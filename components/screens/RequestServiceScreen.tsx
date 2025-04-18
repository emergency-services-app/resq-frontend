import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import Icon from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { capitalizeFirstLetter, requestHandler } from "@/lib/utils";
import { createEmergencyRequest } from "@/services/api/emergency-request";
import { useAuthStore } from "@/store/authStore";
import { createEmergencyResponse } from "@/services/api/emergency-response";
import { useLocationStore } from "@/store/locationStore";
import * as Location from "expo-location";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";

interface ILocation {
	latitude: number;
	longitude: number;
	latitudeDelta?: number;
	longitudeDelta?: number;
}

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

const RequestServiceScreen: React.FC<Props> = ({ selectedServiceType = "ambulance" }) => {
	const router = useRouter();
	const { requestId } = useGlobalSearchParams();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { user } = useAuthStore();
	const { askLocationPermission, getLocation, location, permissionStatus } = useLocationStore();
	const [isCreating, setIsCreating] = useState<boolean>(false);
	const [isLoadingLocation, setIsLoadingLocation] = useState(true);
	const [locationName, setLocationName] = useState("");
	const [mapRef, setMapRef] = useState<MapView | null>(null);
	const [currentLocation, setCurrentLocation] = useState<ILocation>({
		latitude: 27.7172,
		longitude: 85.324,
		latitudeDelta: 0.005,
		longitudeDelta: 0.005,
	});
	const [selectedDestination, setSelectedDestination] = useState<ILocation>({
		latitude: 27.7172,
		longitude: 85.324,
		latitudeDelta: 0.005,
		longitudeDelta: 0.005,
	});
	
	const [responseData, setResponseData] = useState<ResponseData | null>(null);
	const [routePath, setRoutePath] = useState<Array<{ latitude: number; longitude: number }>>([]);
	const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
	const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);

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
							latitude: selectedDestination.latitude,
							longitude: selectedDestination.longitude,
						},
					}),
				() => setIsCreating(true),
				(res) => {
					const { data } = res;
					console.log(data, "data");

					setResponseData(data);

					if (data.optimalPath && data.optimalPath.length > 0) {
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
					onPress={() => router.back()}
				>
					<Ionicons
						name="arrow-back"
						size={24}
						color={theme.text}
					/>
				</TouchableOpacity>
				<Text style={[styles.headerText, { color: theme.text }]}>Confirm Emergency</Text>
			</View>

			<MapView
				ref={(ref) => setMapRef(ref)}
				style={styles.map}
				initialRegion={{
					...currentLocation,
					latitudeDelta: 0.005,
					longitudeDelta: 0.005,
				}}
			>
				<Marker
					coordinate={{
						latitude: currentLocation.latitude,
						longitude: currentLocation.longitude,
					}}
					title="Your Location"
					pinColor={theme.primary}
				/>

				{routePath.length > 0 && (
					<Polyline
						coordinates={routePath}
						strokeWidth={4}
						strokeColor={theme.primary}
					/>
				)}
			</MapView>

			{responseData ? (
				<View style={[styles.card, { backgroundColor: theme.surface }]}>
					<Text style={[styles.successTitle, { color: theme.text }]}>Service Requested Successfully!</Text>
					{estimatedDistance && estimatedTime && (
						<View style={[styles.estimateContainer, { backgroundColor: theme.background }]}>
							<Text style={[styles.estimateText, { color: theme.text }]}>
								Estimated distance: {(estimatedDistance / 1000).toFixed(2)} km
							</Text>
							<Text style={[styles.estimateText, { color: theme.text }]}>
								Estimated arrival time: {Math.ceil(estimatedTime / 60)} minutes
							</Text>
						</View>
					)}
					<TouchableOpacity
						style={[styles.requestBtn, { backgroundColor: theme.primary }]}
						onPress={() => {
							if (responseData.emergencyResponse && responseData.emergencyResponse.length > 0) {
								const responseId = responseData.emergencyResponse[0].id;
								router.push({
									pathname: "/live-tracking",
									params: {
										responseId: responseId,
										userLat: location?.coords.latitude.toString() || "",
										userLng: location?.coords.longitude.toString() || "",
										providerLat: selectedDestination.latitude.toString(),
										providerLng: selectedDestination.longitude.toString(),
										optimalPath: JSON.stringify(responseData.optimalPath),
									},
								});
							}
						}}
					>
						<Text style={styles.requestText}>Track Service Provider</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View style={[styles.card, { backgroundColor: theme.surface }]}>
					<Text style={[styles.label, { color: theme.text }]}>Pick up Location</Text>
					<View style={[styles.inputBox, { backgroundColor: theme.background }]}>
						<Icon
							name="map-marker"
							size={24}
							color={theme.primary}
						/>
						<TextInput
							style={[styles.input, { color: theme.text }]}
							placeholder="Loading location..."
							placeholderTextColor={theme.textSecondary}
							value={locationName}
							editable={false}
						/>
					</View>

					<Text style={[styles.label, { color: theme.text }]}>Selected Service</Text>
					<View style={[styles.inputBox, { backgroundColor: theme.background }]}>
						<Icon
							name="lock"
							size={18}
							color={theme.primary}
						/>
						<Text style={[styles.input, { color: theme.text }]}>{capitalizeFirstLetter(selectedServiceType)}</Text>
					</View>

					{error && (
						<View style={[styles.errorContainer, { backgroundColor: theme.error + "20" }]}>
							<Icon
								name="exclamation-circle"
								size={16}
								color={theme.error}
							/>
							<Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
						</View>
					)}

					<TouchableOpacity
						style={[
							styles.requestBtn,
							{ backgroundColor: theme.primary },
							isLoading ? styles.requestBtnDisabled : null,
						]}
						onPress={handleCreateServiceResponse}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator
								size="small"
								color="#fff"
							/>
						) : (
							<Text style={styles.requestText}>Request Service</Text>
						)}
					</TouchableOpacity>
				</View>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#f8f8f8" },
	loadingContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		color: "#666",
	},
	header: {
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 14,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	headerText: { fontSize: 16, fontWeight: "600" },
	map: { flex: 1 },
	card: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "white",
		padding: 16,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 10,
	},
	label: { fontWeight: "bold", marginTop: 8 },
	inputBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: "#f2f2f2",
		borderRadius: 10,
		paddingHorizontal: 14,
		paddingVertical: 6,
		marginTop: 6,
	},
	input: { flex: 1 },
	requestBtn: {
		marginTop: 14,
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: "center",
	},
	requestBtnDisabled: {
		opacity: 0.7,
	},
	requestText: { fontWeight: "600", color: "#fff" },
	successTitle: {
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 12,
	},
	estimateContainer: {
		backgroundColor: "#f2f2f2",
		padding: 12,
		borderRadius: 10,
		marginBottom: 12,
	},
	estimateText: {
		fontSize: 14,
		marginBottom: 4,
	},
	backButton: {
		padding: 8,
	},
	errorContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 8,
		marginTop: 12,
	},
	errorText: {
		marginLeft: 8,
		fontSize: 14,
	},
});

export default RequestServiceScreen;
