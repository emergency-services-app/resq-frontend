import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSocketStore } from "@/store/socketStore";
import * as Location from "expo-location";
import Icon from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";
import { getEmergencyResponseById, updateEmergencyResponse } from "@/services/api/emergency-response";
import { SocketEventEnums } from "@/constants";

interface ILocation {
	latitude: number;
	longitude: number;
}

interface IOptimalPath {
	latlngs: Array<[number, number]>;
	duration: number;
	distance: number;
}

const LiveTrackingScreen = () => {
	const router = useRouter();
	const { emergencyResponseId, userLat, userLng, providerLat, providerLng, optimalPath } = useLocalSearchParams();
	const { user, serviceProvider, isServiceProvider } = useAuthStore();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const mapRef = React.useRef<MapView>(null);
	const userId = isServiceProvider ? serviceProvider?.id : user?.id;

	const [providerId, setProviderId] = useState<string | null>(null);
	const [currentLocation, setCurrentLocation] = useState<ILocation>({
		latitude: parseFloat(userLat as string),
		longitude: parseFloat(userLng as string),
	});
	const [providerLocation, setProviderLocation] = useState<ILocation>({
		latitude: parseFloat(providerLat as string),
		longitude: parseFloat(providerLng as string),
	});
	const [optimalPathData, setOptimalPathData] = useState<IOptimalPath | null>(null);
	const [isMarkingArrived, setIsMarkingArrived] = useState(false);
	const [isRejecting, setIsRejecting] = useState(false);
	const { socket, joinEmergencyRoom, startLocationUpdates, stopLocationUpdates, sendLocation } = useSocketStore();

	useEffect(() => {
		const getEmergencyResponse = async () => {
			try {
				const response = await getEmergencyResponseById(emergencyResponseId as string);
				setProviderId(response.data.data.providerId);
			} catch (error) {}
		};

		getEmergencyResponse();
		return () => {};
	}, [emergencyResponseId]);

	useEffect(() => {
		if (optimalPath) {
			try {
				const parsedPaths = JSON.parse(optimalPath as string);
				if (parsedPaths && parsedPaths.length > 0) {
					// The response format is { distance, duration, latlngs }
					const path = parsedPaths[0];
					setOptimalPathData({
						latlngs: path.latlngs || [],
						duration: path.duration || 0,
						distance: path.distance || 0,
					});
				}
			} catch (error) {
				console.log("Error parsing optimal path:", error);
			}
		}
	}, [optimalPath]);

	const sendLocationUpdate = async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.log("Location permission not granted");
				return;
			}

			const location = await Location.getCurrentPositionAsync({});
			const newLocation = {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			};

			setCurrentLocation(newLocation);
			sendLocation(emergencyResponseId as string, location, false);
		} catch (error) {
			console.log("Error getting/sending location:", error);
		}
	};

	useEffect(() => {
		if (!socket || !emergencyResponseId || !providerId || !userId) return;

		console.log("Initializing live tracking with:", {
			emergencyResponseId,
			providerId,
			userId,
			currentLocation,
			providerLocation,
		});

		joinEmergencyRoom(emergencyResponseId as string, userId, providerId);
		startLocationUpdates(emergencyResponseId as string, false);

		const locationInterval = setInterval(sendLocationUpdate, 5000);

		socket.on(SocketEventEnums.UPDATE_LOCATION, handleProviderLocationUpdate);
		socket.on(SocketEventEnums.EMERGENCY_RESPONSE_STATUS_UPDATED, handleStatusUpdate);

		return () => {
			clearInterval(locationInterval);
			socket.off(SocketEventEnums.UPDATE_LOCATION, handleProviderLocationUpdate);
			socket.off(SocketEventEnums.EMERGENCY_RESPONSE_STATUS_UPDATED, handleStatusUpdate);
			socket.offAny();
			stopLocationUpdates();
		};
	}, [socket, emergencyResponseId]);

	// Listen for provider location updates
	const handleProviderLocationUpdate = (data: any) => {
		if (data && data.location) {
			console.log("New provider coordinates:", {
				latitude: parseFloat(data.location.latitude),
				longitude: parseFloat(data.location.longitude),
			});
			const newProviderLocation = {
				latitude: parseFloat(data.location.latitude),
				longitude: parseFloat(data.location.longitude),
			};
			setProviderLocation(newProviderLocation);
		} else {
			console.log("Invalid location data received:", data);
		}
	};

	// Listen for optimal path updates
	const handleOptimalPathUpdate = (data: any) => {
		console.log("🛣️ Optimal Path Update:", data);
		if (data.data && data.data.length > 0) {
			setOptimalPathData({
				latlngs: data.data[0].latlngs,
				duration: data.data[0].duration,
				distance: data.data[0].distance,
			});
		}
	};

	const handleStatusUpdate = (data: { statusUpdate: string; message: string }) => {
		Alert.alert("Status Updated", data.message, [
			{
				text: "OK",
				onPress: () => {
					if (isServiceProvider) {
						router.push("/(service-provider-tabs)/home");
					} else {
						router.push("/(tabs)/home");
					}
				},
			},
		]);
	};

	const handleMarkArrived = async () => {
		try {
			setIsMarkingArrived(true);
			await updateEmergencyResponse(emergencyResponseId as string, {
				statusUpdate: "arrived",
				updateDescription: "Service provider has arrived at the location",
			});
		} catch (error) {
			console.log("Error marking as arrived:", error);
			Alert.alert("Error", "Failed to update status");
		} finally {
			setIsMarkingArrived(false);
		}
	};

	const handleRejectResponse = async () => {
		try {
			setIsRejecting(true);
			await updateEmergencyResponse(emergencyResponseId as string, {
				statusUpdate: "rejected",
				updateDescription: "Service provider rejected the emergency response",
			});
			// The navigation will be handled by the socket event listener
		} catch (error) {
			console.log("Error rejecting response:", error);
			Alert.alert("Error", "Failed to update status");
		} finally {
			setIsRejecting(false);
		}
	};

	if (!userId) {
		alert("USER ID missing");
		router.back();
		return;
	}

	console.log("🛣️ Optimal Path Data:", providerLocation, currentLocation);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
			<View style={[styles.header, { backgroundColor: theme.surface }]}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.push("/(tabs)/home")}
				>
					<Ionicons
						name="arrow-back"
						size={24}
						color={theme.text}
					/>
				</TouchableOpacity>
				<Text style={[styles.headerText, { color: theme.text }]}>Live Tracking</Text>
			</View>

			<MapView
				ref={mapRef}
				style={styles.map}
				initialRegion={{
					latitude: (currentLocation.latitude + providerLocation.latitude) / 2,
					longitude: (currentLocation.longitude + providerLocation.longitude) / 2,
					latitudeDelta: Math.abs(currentLocation.latitude - providerLocation.latitude) * 2,
					longitudeDelta: Math.abs(currentLocation.longitude - providerLocation.longitude) * 2,
				}}
				onMapReady={() => {
					if (optimalPathData && optimalPathData.latlngs.length > 0) {
						const coordinates = optimalPathData.latlngs.map(([longitude, latitude]) => ({
							latitude: parseFloat(latitude.toString()),
							longitude: parseFloat(longitude.toString()),
						}));

						mapRef.current?.fitToCoordinates(coordinates, {
							edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
							animated: true,
						});
					} else {
						mapRef.current?.fitToCoordinates([currentLocation, providerLocation], {
							edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
							animated: true,
						});
					}
				}}
			>
				<Marker
					coordinate={currentLocation}
					title="Emergency Location"
					description="Your location"
				>
					<View style={[styles.markerContainer, { backgroundColor: theme.error }]}>
						<Ionicons
							name="warning"
							size={24}
							color="#fff"
						/>
					</View>
				</Marker>

				<Marker
					coordinate={providerLocation}
					title={isServiceProvider ? "You" : "Service Provider"}
					description="Service provider location"
				>
					<View style={[styles.markerContainer, { backgroundColor: theme.success }]}>
						<Ionicons
							name="car"
							size={24}
							color="#fff"
						/>
					</View>
				</Marker>

				{optimalPathData && optimalPathData.latlngs.length > 0 && (
					<>
						<Polyline
							coordinates={optimalPathData.latlngs.map(([longitude, latitude]) => ({
								latitude: parseFloat(latitude.toString()),
								longitude: parseFloat(longitude.toString()),
							}))}
							strokeWidth={7}
							strokeColor={"blue"}
						/>
					</>
				)}
			</MapView>

			<View style={[styles.infoContainer, { backgroundColor: theme.surface }]}>
				<View style={styles.locationInfo}>
					<View style={styles.locationRow}>
						<View style={[styles.markerDot, { backgroundColor: theme.error }]} />
						<Text style={[styles.locationText, { color: theme.text }]}>Emergency Location</Text>
					</View>
					<View style={styles.locationRow}>
						<View style={[styles.markerDot, { backgroundColor: theme.success }]} />
						<Text style={[styles.locationText, { color: theme.text }]}>
							{isServiceProvider ? "You" : "Service Provider"}
						</Text>
					</View>
				</View>

				{optimalPathData && (
					<View style={styles.routeInfo}>
						<View style={styles.infoRow}>
							<Ionicons
								name="navigate"
								size={20}
								color={theme.success}
							/>
							<Text style={[styles.infoText, { color: theme.text }]}>
								{(optimalPathData.distance / 1000).toFixed(2)} km
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Ionicons
								name="time"
								size={20}
								color={theme.success}
							/>
							<Text style={[styles.infoText, { color: theme.text }]}>
								{Math.ceil(optimalPathData.duration / 60)} minutes
							</Text>
						</View>
					</View>
				)}

				{isServiceProvider && (
					<View style={styles.actionButtons}>
						<TouchableOpacity
							style={[
								styles.actionButton,
								{ backgroundColor: theme.success },
								isMarkingArrived && styles.actionButtonDisabled,
							]}
							onPress={handleMarkArrived}
							disabled={isMarkingArrived || isRejecting}
						>
							{isMarkingArrived ? (
								<ActivityIndicator
									color="#fff"
									size="small"
								/>
							) : (
								<>
									<Ionicons
										name="checkmark-circle"
										size={24}
										color="#fff"
									/>
									<Text style={styles.actionButtonText}>Mark as Arrived</Text>
								</>
							)}
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.actionButton,
								{ backgroundColor: theme.error },
								isRejecting && styles.actionButtonDisabled,
							]}
							onPress={handleRejectResponse}
							disabled={isMarkingArrived || isRejecting}
						>
							{isRejecting ? (
								<ActivityIndicator
									color="#fff"
									size="small"
								/>
							) : (
								<>
									<Ionicons
										name="close-circle"
										size={24}
										color="#fff"
									/>
									<Text style={styles.actionButtonText}>Reject Response</Text>
								</>
							)}
						</TouchableOpacity>
					</View>
				)}
			</View>
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
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	errorText: {
		marginTop: 16,
		marginBottom: 24,
		fontSize: 16,
		textAlign: "center",
	},
	retryButton: {
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	actionButtons: {
		marginTop: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 12,
	},
	actionButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 12,
		borderRadius: 8,
		gap: 8,
	},
	actionButtonDisabled: {
		opacity: 0.7,
	},
	actionButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
});

export default LiveTrackingScreen;
