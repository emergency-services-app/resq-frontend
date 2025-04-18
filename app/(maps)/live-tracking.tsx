import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSocketStore } from "@/store/socketStore";
import * as Location from "expo-location";
import Icon from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";

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
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const mapRef = React.useRef<MapView>(null);

	const [currentLocation, setCurrentLocation] = useState<ILocation>({
		latitude: parseFloat(userLat as string),
		longitude: parseFloat(userLng as string),
	});
	const [providerLocation, setProviderLocation] = useState<ILocation>({
		latitude: parseFloat(providerLat as string),
		longitude: parseFloat(providerLng as string),
	});
	const [optimalPathData, setOptimalPathData] = useState<IOptimalPath | null>(null);
	const { socket, joinEmergencyRoom, startLocationUpdates, stopLocationUpdates, sendLocation } = useSocketStore();

	const userId = "user-id";
	const providerId = "provider-id";

	// Initialize optimal path from route params
	useEffect(() => {
		if (optimalPath) {
			try {
				const parsedPaths = JSON.parse(optimalPath as string);
				if (parsedPaths && parsedPaths.length > 0) {
					setOptimalPathData(parsedPaths[0]);
				}
			} catch (error) {
				console.error("Error parsing optimal path:", error);
			}
		}
	}, [optimalPath]);

	const sendLocationUpdate = async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.error("Location permission not granted");
				return;
			}

			const location = await Location.getCurrentPositionAsync({});
			const newLocation = {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			};

			setCurrentLocation(newLocation);
			sendLocation(emergencyResponseId as string, newLocation);
		} catch (error) {
			console.error("Error getting/sending location:", error);
		}
	};

	useEffect(() => {
		if (!socket || !emergencyResponseId) return;

		// Join the emergency room
		joinEmergencyRoom(emergencyResponseId as string, userId, providerId);

		startLocationUpdates(emergencyResponseId as string);

		const locationInterval = setInterval(sendLocationUpdate, 1000);

		socket.on("location_update", (data) => {
			console.log("📍Provider Location Update:", data);
			const newProviderLocation = {
				latitude: data.latitude,
				longitude: data.longitude,
			};
			setProviderLocation(newProviderLocation);
		});

		socket.on("optimal_path_update", (data) => {
			console.log("🛣️ Optimal Path Update:", data);
			if (data.data && data.data.length > 0) {
				setOptimalPathData({
					latlngs: data.data[0].latlngs,
					duration: data.data[0].duration,
					distance: data.data[0].distance,
				});
			}
		});

		return () => {
			clearInterval(locationInterval);
			socket.off("location_update");
			socket.off("optimal_path_update");
			stopLocationUpdates();
		};
	}, [socket, emergencyResponseId]);

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
						// Convert the optimal path coordinates to the format expected by fitToCoordinates
						const coordinates = optimalPathData.latlngs.map(([longitude, latitude]) => ({
							latitude,
							longitude,
						}));

						// Fit the map to show the entire route with padding
						mapRef.current?.fitToCoordinates(coordinates, {
							edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
							animated: true,
						});
					} else {
						// If no optimal path yet, just show both markers
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
					description="Emergency location"
				>
					<View style={[styles.markerContainer, { backgroundColor: theme.error }]}>
						<Ionicons
							name="car"
							size={24}
							color="#fff"
						/>
					</View>
				</Marker>

				<Marker
					coordinate={providerLocation}
					title="Service Provider"
					description="Service provider location"
				>
					<View style={[styles.markerContainer, { backgroundColor: theme.primary }]}>
						<Ionicons
							name="alert-circle"
							size={24}
							color="#fff"
						/>
					</View>
				</Marker>

				{optimalPathData && (
					<>
						<Polyline
							coordinates={optimalPathData.latlngs.map(([longitude, latitude]) => ({
								latitude,
								longitude,
							}))}
							strokeWidth={8}
							strokeColor={"blue"}
						/>
						{optimalPathData.latlngs.length > 0 && (
							<Marker
								coordinate={{
									latitude: optimalPathData.latlngs[0][1],
									longitude: optimalPathData.latlngs[0][0],
								}}
							>
								<View style={[styles.markerContainer, { backgroundColor: theme.success }]}>
									<Ionicons
										name="car"
										size={20}
										color="#fff"
									/>
								</View>
							</Marker>
						)}
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
						<View style={[styles.markerDot, { backgroundColor: "green" }]} />
						<Text style={[styles.locationText, { color: theme.text }]}>Service Provider</Text>
					</View>
				</View>

				{optimalPathData && (
					<View style={styles.routeInfo}>
						<View style={styles.infoRow}>
							<Icon
								name="road"
								size={20}
								color={theme.primary}
							/>
							<Text style={[styles.infoText, { color: theme.text }]}>
								{(optimalPathData.distance / 1000).toFixed(2)} km
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Icon
								name="clock-o"
								size={20}
								color={theme.primary}
							/>
							<Text style={[styles.infoText, { color: theme.text }]}>
								{Math.ceil(optimalPathData.duration / 60)} minutes
							</Text>
						</View>
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
});

export default LiveTrackingScreen;
