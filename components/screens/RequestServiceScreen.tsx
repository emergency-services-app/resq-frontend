import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ActivityIndicator,
	Modal,
	FlatList,
	Alert,
} from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import Icon from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { capitalizeFirstLetter, requestHandler } from "@/lib/utils";
import { createEmergencyRequest } from "@/services/api/emergency-request";
import { useAuthStore } from "@/store/authStore";
import { createEmergencyResponse } from "@/services/api/emergency-response";
import { useLocationStore } from "@/store/locationStore";
import * as Location from "expo-location";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { searchLocation, LocationResult } from "@/services/api/location";
import mapsApi from "@/services/api/maps";
import { ILocation, ICreateEmergencyRequest, ICreateEmergencyResponse } from "@/types";
import { getNearbyProviders, NearbyProvider } from "@/services/api/service-provider";

interface OptimalPath {
	distance: number;
	duration: number;
	latlngs: Array<{
		latitude: number;
		longitude: number;
	}>;
}

interface EmergencyResponse {
	assignedAt: string;
	emergencyRequestId: string;
	id: string;
	respondedAt: string;
	serviceProviderId: string;
	statusUpdate: string;
	updateDescription: string | null;
}

interface ResponseData {
	emergencyResponse: EmergencyResponse[];
	optimalPath: OptimalPath[];
}

interface Props {
	selectedServiceType?: string;
}

const SERVICE_TYPES = ["ambulance", "fire", "police"];

const RequestServiceScreen: React.FC<Props> = ({ selectedServiceType = "ambulance" }) => {
	const router = useRouter();
	const { requestId } = useGlobalSearchParams();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showLocationSearch, setShowLocationSearch] = useState(false);
	const [showServiceSelect, setShowServiceSelect] = useState(false);
	const [currentServiceType, setCurrentServiceType] = useState(selectedServiceType);

	const { user } = useAuthStore();
	const { askLocationPermission, getLocation, location, permissionStatus } = useLocationStore();
	const [isCreating, setIsCreating] = useState<boolean>(false);
	const [isLoadingLocation, setIsLoadingLocation] = useState(true);
	const [locationName, setLocationName] = useState("");
	const [mapRef, setMapRef] = useState<MapView | null>(null);
	const [currentLocation, setCurrentLocation] = useState<Region>({
		latitude: 27.7172,
		longitude: 85.324,
		latitudeDelta: 0.005,
		longitudeDelta: 0.005,
	});
	const [selectedDestination, setSelectedDestination] = useState<Region>({
		latitude: 27.7172,
		longitude: 85.324,
		latitudeDelta: 0.005,
		longitudeDelta: 0.005,
	});

	const [responseData, setResponseData] = useState<ResponseData | null>(null);
	const [routePath, setRoutePath] = useState<Array<{ latitude: number; longitude: number }>>([]);
	const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
	const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
	const [nearbyProviders, setNearbyProviders] = useState<NearbyProvider[]>([]);

	const getLocationName = async (latitude: number, longitude: number) => {
		try {
			const response = await Location.reverseGeocodeAsync({
				latitude,
				longitude,
			});
			if (response[0]) {
				const address = response[0];
				return `${address.street || ""} ${address.district || ""} ${address.city || ""}`.trim();
			}
			return "Unknown location";
		} catch (error) {
			console.log("Error getting location name:", error);
			return "Unknown location";
		}
	};

	useEffect(() => {
		const initializeLocation = async () => {
			try {
				setIsLoadingLocation(true);

				if (permissionStatus !== "granted") {
					await askLocationPermission();
				}

				// Only get location if we don't already have it
				if (!location) {
					await getLocation();
				}

				if (location) {
					const newLocation = {
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
						latitudeDelta: 0.005,
						longitudeDelta: 0.005,
					};
					setCurrentLocation(newLocation);
					setSelectedDestination(newLocation);

					if (mapRef) {
						mapRef.animateToRegion(
							{
								...newLocation,
								latitudeDelta: 0.005,
								longitudeDelta: 0.005,
							},
							1000
						);
					}

					const name = await getLocationName(location.coords.latitude, location.coords.longitude);
					setLocationName(name);
				}
			} catch (error) {
				console.log("Error getting location:", error);
				alert(
					"Location permission is required to use this feature. Please enable location services in your device settings."
				);
			} finally {
				setIsLoadingLocation(false);
			}
		};

		initializeLocation();
	}, []);

	useEffect(() => {
		const fetchNearbyProviders = async () => {
			try {
				if (location) {
					const res = await getNearbyProviders({
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
						serviceType: currentServiceType,
					});
					setNearbyProviders(res.data.providers || []);
				}
			} catch (err) {
				console.log("Error fetching nearby providers", err);
			}
		};
		fetchNearbyProviders();
	}, [location, currentServiceType]);

	const handleCreateServiceResponse = async () => {
		try {
			setError(null);
			setIsLoading(true);

			if (!location) {
				await askLocationPermission();
				await getLocation();
			}

			if (typeof requestId !== "string") {
				setError("Invalid request ID");
				return;
			}

			await requestHandler(
				async () =>
					await createEmergencyResponse({
						emergencyRequestId: requestId,
						destLocation: {
							latitude: selectedDestination.latitude + 0.01,
							longitude: selectedDestination.longitude + 0.01,
						},
					}),
				() => setIsCreating(true),
				(res) => {
					const { data } = res;
					console.log(data, "data");

					setResponseData(data);

					if (data.optimalPath && data.optimalPath.length > 0) {
						console.log(data, "RESPONSE CREATED DATA");

						setRoutePath(data.optimalPath[0].latlngs);
						setEstimatedTime(data.optimalPath[0].duration);
						setEstimatedDistance(data.optimalPath[0].distance);

						if (mapRef && data.optimalPath[0].latlngs.length > 0) {
							const coordinates = data.optimalPath[0].latlngs;
							mapRef.fitToCoordinates(coordinates, {
								edgePadding: { top: 50, right: 50, bottom: 200, left: 50 },
								animated: true,
							});
						}
					}

					if (data.emergencyResponse && data.emergencyResponse.length > 0) {
						const responseId = data.emergencyResponse[0].id;
						router.push({
							pathname: "/live-tracking",
							params: {
								responseId: responseId,
								userLat: location?.coords.latitude.toString() || "",
								userLng: location?.coords.longitude.toString() || "",
								providerLat: selectedDestination.latitude.toString(),
								providerLng: selectedDestination.longitude.toString(),
								optimalPath: JSON.stringify(data.optimalPath),
							},
						});
					}
				},
				(err) => {
					console.log("Error requesting service:", err);
					setError("Failed to request service. Please try again.");
				}
			);
		} catch (error) {
			console.log("Error requesting service:", error);
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
			setIsCreating(false);
		}
	};

	const handleSearch = async (text: string) => {
		setSearchQuery(text);
		if (text.length < 3) {
			setSearchResults([]);
			return;
		}
		setIsSearching(true);
		try {
			const response = await mapsApi.getAutoComplete(text, selectedDestination.latitude, selectedDestination.longitude);
			setSearchResults(response.data);
		} catch (error) {
			console.error("Error searching location:", error);
		} finally {
			setIsSearching(false);
		}
	};

	const handleClearSearch = () => {
		setSearchQuery("");
		setSearchResults([]);
	};

	const handleLocationSelect = (location: LocationResult) => {
		setShowLocationSearch(false);
		setSearchQuery("");
		setSearchResults([]);

		// Parse geometry string to get coordinates
		const [lat, lng] = location.geometry.split(",").map(Number);
		const newDestination: Region = {
			latitude: lat,
			longitude: lng,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		};
		setSelectedDestination(newDestination);

		// Animate map to the selected location
		mapRef?.animateToRegion(newDestination);
	};

	const handleBackPress = () => {
		Alert.alert("Cancel Request", "Are you sure you want to cancel this request?", [
			{
				text: "No",
				style: "cancel",
			},
			{
				text: "Yes",
				onPress: () => router.back(),
			},
		]);
	};

	if (isLoadingLocation) {
		return (
			<View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
				<ActivityIndicator
					size="large"
					color={theme.primary}
				/>
				<Text style={[styles.loadingText, { color: theme.text }]}>Getting your location...</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
			<View style={[styles.header, { backgroundColor: theme.surface }]}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={handleBackPress}
				>
					<Ionicons
						name="arrow-back"
						size={24}
						color={theme.text}
					/>
				</TouchableOpacity>
				<Text style={[styles.headerText, { color: theme.text }]}>
					Request {capitalizeFirstLetter(currentServiceType)}
				</Text>
			</View>

			<View style={styles.searchContainer}>
				<View style={[styles.searchBox, { backgroundColor: theme.surface }]}>
					<Icon
						name="search"
						size={20}
						color={theme.textSecondary}
						style={styles.searchIcon}
					/>
					<TextInput
						style={[styles.searchInput, { color: theme.text }]}
						placeholder="Search for emergency location..."
						placeholderTextColor={theme.textSecondary}
						value={searchQuery}
						onChangeText={handleSearch}
					/>
					{searchQuery.length > 0 && (
						<TouchableOpacity
							onPress={handleClearSearch}
							style={styles.clearButton}
						>
							<Icon
								name="times-circle"
								size={20}
								color={theme.textSecondary}
							/>
						</TouchableOpacity>
					)}
					{isSearching && (
						<ActivityIndicator
							size="small"
							color={theme.primary}
							style={styles.searchLoader}
						/>
					)}
				</View>

				{searchResults.length > 0 && (
					<View style={[styles.searchResultsContainer, { backgroundColor: theme.surface }]}>
						<FlatList
							data={searchResults}
							keyExtractor={(item, index) => item.id || index.toString()}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
									onPress={() => handleLocationSelect(item)}
								>
									<View style={styles.resultContent}>
										<Icon
											name="map-marker"
											size={16}
											color={theme.primary}
											style={styles.resultIcon}
										/>
										<View style={styles.resultTextContainer}>
											<Text
												style={[styles.resultName, { color: theme.text }]}
												numberOfLines={1}
											>
												{item.name}
											</Text>
											<Text
												style={[styles.resultDetails, { color: theme.textSecondary }]}
												numberOfLines={1}
											>
												{`${item.municipality}, ${item.district}, ${item.province}`}
											</Text>
										</View>
									</View>
									{item.distance && (
										<Text style={[styles.distanceText, { color: theme.primary }]}>{item.distance}</Text>
									)}
								</TouchableOpacity>
							)}
							style={styles.searchResultsList}
							contentContainerStyle={styles.searchResultsContent}
							showsVerticalScrollIndicator={false}
						/>
					</View>
				)}
			</View>

			<MapView
				ref={(ref) => setMapRef(ref)}
				style={styles.map}
				initialRegion={currentLocation}
				showsUserLocation
				showsMyLocationButton
			>
				<Marker
					coordinate={currentLocation}
					title="Your Location"
					description="Your current location"
				>
					<View style={[styles.markerContainer, { backgroundColor: theme.primary }]}>
						<Ionicons
							name="location"
							size={24}
							color="#fff"
						/>
					</View>
				</Marker>

				<Marker
					coordinate={selectedDestination}
					title="Emergency Location"
					description={locationName}
				>
					<View style={[styles.markerContainer, { backgroundColor: theme.error }]}>
						<Ionicons
							name="alert-circle"
							size={24}
							color="#fff"
						/>
					</View>
				</Marker>

				{routePath.length > 0 && (
					<Polyline
						coordinates={routePath}
						strokeWidth={4}
						strokeColor={theme.primary}
					/>
				)}

				{nearbyProviders.map((provider, idx) => (
					<Marker
						key={provider.id || idx}
						coordinate={{
							latitude: parseFloat(provider.location.latitude),
							longitude: parseFloat(provider.location.longitude),
						}}
						title={provider.name}
						description={provider.serviceType}
					>
						<View style={{ alignItems: "center" }}>
							<Ionicons
								name={
									provider.serviceType === "ambulance"
										? "medkit"
										: provider.serviceType === "fire"
										? "flame"
										: provider.serviceType === "police"
										? "shield"
										: "car"
								}
								size={32}
								color={
									provider.serviceType === "ambulance"
										? "#e53935"
										: provider.serviceType === "fire"
										? "#fb8c00"
										: provider.serviceType === "police"
										? "#3949ab"
										: "#333"
								}
							/>
							<Text style={{ fontSize: 10, color: "#333" }}>{provider.name}</Text>
						</View>
					</Marker>
				))}
			</MapView>

			<View style={[styles.infoContainer, { backgroundColor: theme.surface }]}>
				<View style={styles.locationInfo}>
					<View style={styles.locationRow}>
						<View style={[styles.markerDot, { backgroundColor: theme.primary }]} />
						<Text style={[styles.locationText, { color: theme.text }]}>Your Location</Text>
					</View>
					<View style={styles.locationRow}>
						<View style={[styles.markerDot, { backgroundColor: theme.error }]} />
						<Text style={[styles.locationText, { color: theme.text }]}>Emergency Location</Text>
					</View>
				</View>

				{estimatedTime && estimatedDistance && (
					<View style={styles.routeInfo}>
						<View style={styles.infoRow}>
							<Icon
								name="road"
								size={20}
								color={theme.primary}
							/>
							<Text style={[styles.infoText, { color: theme.text }]}>{(estimatedDistance / 1000).toFixed(2)} km</Text>
						</View>
						<View style={styles.infoRow}>
							<Icon
								name="clock-o"
								size={20}
								color={theme.primary}
							/>
							<Text style={[styles.infoText, { color: theme.text }]}>{Math.ceil(estimatedTime / 60)} minutes</Text>
						</View>
					</View>
				)}

				{error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}

				<TouchableOpacity
					style={[styles.confirmButton, { backgroundColor: theme.primary }, isLoading && styles.disabledButton]}
					onPress={handleCreateServiceResponse}
					disabled={isLoading}
				>
					{isLoading ? (
						<ActivityIndicator
							color="#fff"
							size="small"
						/>
					) : (
						<>
							<Icon
								name="check-circle"
								size={20}
								color="#fff"
								style={styles.buttonIcon}
							/>
							<Text style={styles.buttonText}>Request {capitalizeFirstLetter(currentServiceType)}</Text>
						</>
					)}
				</TouchableOpacity>
			</View>

			{/* Location Search Modal */}
			<Modal
				visible={showLocationSearch}
				animationType="slide"
				transparent={true}
				onRequestClose={() => setShowLocationSearch(false)}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Search Location</Text>
							<TouchableOpacity
								onPress={() => setShowLocationSearch(false)}
								style={styles.closeButton}
							>
								<Ionicons
									name="close"
									size={24}
									color="#333"
								/>
							</TouchableOpacity>
						</View>
						<View style={styles.searchContainer}>
							<TextInput
								style={styles.searchInput}
								placeholder="Search for a location..."
								value={searchQuery}
								onChangeText={handleSearch}
								autoFocus
							/>
							{isSearching && (
								<ActivityIndicator
									size="small"
									color="#007AFF"
									style={styles.searchLoader}
								/>
							)}
						</View>
						<FlatList
							data={searchResults}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={styles.searchResult}
									onPress={() => handleLocationSelect(item)}
								>
									<View style={styles.searchResultContent}>
										<Text style={styles.searchResultName}>{item.name}</Text>
										<Text style={styles.searchResultDetails}>
											{item.municipality}, {item.district}, {item.province}
										</Text>
										{item.distance && <Text style={styles.searchResultDistance}>{item.distance} km away</Text>}
									</View>
								</TouchableOpacity>
							)}
							style={styles.searchResultsList}
						/>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	backButton: {
		padding: 8,
		marginRight: 16,
	},
	headerText: {
		fontSize: 18,
		fontWeight: "600",
	},
	searchContainer: {
		position: "absolute",
		top: 80,
		left: 16,
		right: 16,
		zIndex: 1,
	},
	map: {
		flex: 1,
	},
	markerContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "#fff",
	},
	infoContainer: {
		position: "absolute",
		bottom: 20,
		left: 20,
		right: 20,
		padding: 16,
		borderRadius: 16,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	locationInfo: {
		marginBottom: 16,
	},
	locationRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	markerDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 8,
	},
	locationText: {
		fontSize: 14,
		fontWeight: "500",
	},
	routeInfo: {
		borderTopWidth: 1,
		borderTopColor: "rgba(0,0,0,0.1)",
		paddingTop: 16,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	infoText: {
		fontSize: 16,
		marginLeft: 12,
		fontWeight: "500",
	},
	errorText: {
		fontSize: 14,
		marginBottom: 16,
	},
	confirmButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		borderRadius: 8,
	},
	disabledButton: {
		opacity: 0.5,
	},
	buttonIcon: {
		marginRight: 8,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	loadingContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
	},
	searchBox: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		paddingVertical: 8,
	},
	clearButton: {
		padding: 4,
		marginLeft: 8,
	},
	searchLoader: {
		marginLeft: 8,
	},
	searchResultsContainer: {
		marginTop: 4,
		borderRadius: 8,
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		maxHeight: 200,
		overflow: "hidden",
	},
	searchResultsList: {
		flexGrow: 0,
	},
	searchResultsContent: {
		paddingVertical: 4,
	},
	searchResultItem: {
		padding: 12,
		borderBottomWidth: 1,
	},
	resultContent: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
	},
	resultTextContainer: {
		flex: 1,
		marginLeft: 8,
	},
	resultName: {
		fontSize: 14,
		fontWeight: "500",
	},
	resultDetails: {
		fontSize: 12,
		marginTop: 2,
	},
	distanceText: {
		fontSize: 12,
		fontWeight: "500",
		marginLeft: 8,
	},
	resultIcon: {
		marginRight: 8,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	modalContent: {
		backgroundColor: "white",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		maxHeight: "80%",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#333",
	},
	closeButton: {
		padding: 5,
	},
	searchResult: {
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	searchResultContent: {
		flex: 1,
	},
	searchResultName: {
		fontSize: 16,
		fontWeight: "500",
		color: "#333",
		marginBottom: 4,
	},
	searchResultDetails: {
		fontSize: 14,
		color: "#666",
		marginBottom: 2,
	},
	searchResultDistance: {
		fontSize: 12,
		color: "#007AFF",
	},
});

export default RequestServiceScreen;
