import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSocketStore } from "@/store/socketStore";
import { useAuthStore } from "@/store/authStore";
import Icon from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";

interface Location {
	latitude: string;
	longitude: string;
}

interface LocationUpdate {
	userId: string;
	location: Location;
	timestamp: string;
}

const LiveTrackingScreen = () => {
	const router = useRouter();
	const { emergencyResponseId } = useLocalSearchParams();
	const { user } = useAuthStore();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const mapRef = React.useRef<MapView>(null);

	const {
		socket,
		isConnected,
		joinEmergencyRoom,
		startLocationUpdates,
		stopLocationUpdates,
		onLocationUpdate,
		onUserLocationUpdate,
	} = useSocketStore();

	const [providerLocation, setProviderLocation] = useState<Location | null>(null);
	const [userLocation, setUserLocation] = useState<Location | null>(null);
	const [optimalPath, setOptimalPath] = useState<Location[]>([]);

	useEffect(() => {
		if (!socket || !emergencyResponseId || !user) return;

		// Join the emergency room
		joinEmergencyRoom(emergencyResponseId as string, user.id, user.serviceProviderId || "");

		// Start location updates based on user role
		startLocationUpdates(emergencyResponseId as string, !!user.serviceProviderId);

		// Listen for provider location updates
		onLocationUpdate((data: LocationUpdate) => {
			console.log("📍 Provider Location Update:", data);
			setProviderLocation(data.location);
		});

		// Listen for user location updates
		onUserLocationUpdate((data: LocationUpdate) => {
			console.log("📍 User Location Update:", data);
			setUserLocation(data.location);
		});

		return () => {
			stopLocationUpdates();
		};
	}, [socket, emergencyResponseId, user]);

	if (!isConnected) {
		return (
			<View style={styles.container}>
				<Text>Connecting to server...</Text>
			</View>
		);
	}

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
					latitude: userLocation ? parseFloat(userLocation.latitude) : 0,
					longitude: userLocation ? parseFloat(userLocation.longitude) : 0,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421,
				}}
				onMapReady={() => {
					if (optimalPath.length > 0) {
						// Convert the optimal path coordinates to the format expected by fitToCoordinates
						const coordinates = optimalPath.map((loc) => ({
							latitude: parseFloat(loc.latitude),
							longitude: parseFloat(loc.longitude),
						}));

						// Fit the map to show the entire route with padding
						mapRef.current?.fitToCoordinates(coordinates, {
							edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
							animated: true,
						});
					} else {
						// If no optimal path yet, just show both markers
						mapRef.current?.fitToCoordinates(
							[
								{
									latitude: parseFloat(userLocation?.latitude || "0"),
									longitude: parseFloat(userLocation?.longitude || "0"),
								},
								{
									latitude: parseFloat(providerLocation?.latitude || "0"),
									longitude: parseFloat(providerLocation?.longitude || "0"),
								},
							],
							{
								edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
								animated: true,
							}
						);
					}
				}}
			>
				{userLocation && (
					<Marker
						coordinate={{
							latitude: parseFloat(userLocation.latitude),
							longitude: parseFloat(userLocation.longitude),
						}}
						title="Your Location"
						pinColor="blue"
					/>
				)}
				{providerLocation && (
					<Marker
						coordinate={{
							latitude: parseFloat(providerLocation.latitude),
							longitude: parseFloat(providerLocation.longitude),
						}}
						title="Service Provider"
						pinColor="red"
					/>
				)}
				{optimalPath.length > 0 && (
					<Polyline
						coordinates={optimalPath.map((loc) => ({
							latitude: parseFloat(loc.latitude),
							longitude: parseFloat(loc.longitude),
						}))}
						strokeWidth={3}
						strokeColor="#2196F3"
					/>
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

				{optimalPath.length > 0 && (
					<View style={styles.routeInfo}>
						<View style={styles.infoRow}>
							<Icon
								name="road"
								size={20}
								color={theme.primary}
							/>
							<Text style={[styles.infoText, { color: theme.text }]}>
								{(optimalPath.length * 1000).toFixed(2)} meters
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Icon
								name="clock-o"
								size={20}
								color={theme.primary}
							/>
							<Text style={[styles.infoText, { color: theme.text }]}>
								{((optimalPath.length * 1000) / 1000).toFixed(2)} seconds
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
