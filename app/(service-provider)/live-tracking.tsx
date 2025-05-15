import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSocketStore } from "@/store/socketStore";
import * as Location from "expo-location";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";
import { updateEmergencyResponse } from "@/services/api/emergency-response";
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

const ServiceProviderLiveTracking = () => {
	const router = useRouter();
	const { responseId, emergencyLat, emergencyLng, providerLat, providerLng, optimalPath, status } =
		useLocalSearchParams();
	const { serviceProvider } = useAuthStore();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const mapRef = React.useRef<MapView>(null);

	const [currentLocation, setCurrentLocation] = useState<ILocation>({
		latitude: parseFloat(providerLat as string),
		longitude: parseFloat(providerLng as string),
	});
	const [emergencyLocation, setEmergencyLocation] = useState<ILocation>({
		latitude: parseFloat(emergencyLat as string),
		longitude: parseFloat(emergencyLng as string),
	});
	const [optimalPathData, setOptimalPathData] = useState<IOptimalPath | null>(null);
	const [currentStatus, setCurrentStatus] = useState(status as string);
	const { socket, joinEmergencyRoom, startLocationUpdates, stopLocationUpdates } = useSocketStore();

	useEffect(() => {
		if (!socket || !responseId || !serviceProvider.id) return;

		joinEmergencyRoom(responseId as string, serviceProvider.id, serviceProvider.id);

		const startTracking = async () => {
			try {
				await startLocationUpdates(responseId as string, true);
			} catch (error) {
				Alert.alert(
					"Location Error",
					"Failed to start location tracking. Please check your location permissions and try again."
				);
			}
		};

		startTracking();

		const handleUserLocationUpdate = (data: any) => {
			if (data.location) {
				setEmergencyLocation({
					latitude: parseFloat(data.location.latitude),
					longitude: parseFloat(data.location.longitude),
				});
			}
		};

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

		socket.on(SocketEventEnums.UPDATE_USER_LOCATION, handleUserLocationUpdate);
		socket.on("optimal_path_update", handleOptimalPathUpdate);

		return () => {
			stopLocationUpdates();
			socket.off(SocketEventEnums.UPDATE_USER_LOCATION, handleUserLocationUpdate);
			socket.off("optimal_path_update", handleOptimalPathUpdate);
		};
	}, [socket, responseId]);

	useEffect(() => {
		if (optimalPath) {
			try {
				const parsedPaths = JSON.parse(optimalPath as string);
				if (parsedPaths && parsedPaths.length > 0) {
					const path = parsedPaths[0];
					if (Array.isArray(path)) {
						setOptimalPathData({
							latlngs: path,
							duration: 0,
							distance: 0,
						});
					} else {
						setOptimalPathData(path);
					}
				}
			} catch (error) {
				console.error("Error parsing optimal path:", error);
			}
		}
	}, [optimalPath]);

	const handleStatusUpdate = async (newStatus: string) => {
		try {
			await updateEmergencyResponse(responseId as string, {
				statusUpdate: newStatus,
				updateDescription: `Status updated to ${newStatus}`,
			});
			setCurrentStatus(newStatus);
			socket?.emit(SocketEventEnums.UPDATE_PROVIDER_STATUS, {
				status: newStatus,
				emergencyResponseId: responseId,
			});

			if (newStatus === "completed") {
				Alert.alert("Emergency Completed", "You have successfully completed this emergency response.", [
					{
						text: "OK",
						onPress: () => router.replace("/(service-provider-tabs)/active"),
					},
				]);
			} else {
				Alert.alert("Success", "Status updated successfully");
			}
		} catch (error) {
			Alert.alert("Error", "Failed to update status");
		}
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
			<View style={[styles.header, { backgroundColor: theme.surface }]}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.push("/(service-provider-tabs)/active")}
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
					latitude: (currentLocation.latitude + emergencyLocation.latitude) / 2,
					longitude: (currentLocation.longitude + emergencyLocation.longitude) / 2,
					latitudeDelta: Math.abs(currentLocation.latitude - emergencyLocation.latitude) * 2,
					longitudeDelta: Math.abs(currentLocation.longitude - emergencyLocation.longitude) * 2,
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
						mapRef.current?.fitToCoordinates([currentLocation, emergencyLocation], {
							edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
							animated: true,
						});
					}
				}}
			>
				<Marker
					coordinate={currentLocation}
					title="Your Location"
					description="Service Provider"
				>
					<View style={[styles.markerContainer, { backgroundColor: theme.success }]}>
						<Ionicons
							name="car"
							size={24}
							color="#fff"
						/>
					</View>
				</Marker>

				<Marker
					coordinate={emergencyLocation}
					title="Emergency Location"
					description="Emergency site"
				>
					<View style={[styles.markerContainer, { backgroundColor: theme.error }]}>
						<Ionicons
							name="warning"
							size={24}
							color="#fff"
						/>
					</View>
				</Marker>

				{optimalPathData && optimalPathData.latlngs.length > 0 && (
					<Polyline
						coordinates={optimalPathData.latlngs.map(([longitude, latitude]) => ({
							latitude: parseFloat(latitude.toString()),
							longitude: parseFloat(longitude.toString()),
						}))}
						strokeWidth={3}
						strokeColor={theme.success}
					/>
				)}
			</MapView>

			<View style={[styles.infoContainer, { backgroundColor: theme.surface }]}>
				<View style={styles.locationInfo}>
					<View style={styles.locationRow}>
						<View style={[styles.markerDot, { backgroundColor: theme.success }]} />
						<Text style={[styles.locationText, { color: theme.text }]}>Your Location</Text>
					</View>
					<View style={styles.locationRow}>
						<View style={[styles.markerDot, { backgroundColor: theme.error }]} />
						<Text style={[styles.locationText, { color: theme.text }]}>Emergency Location</Text>
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
			</View>

			<View style={[styles.footer, { backgroundColor: theme.surface }]}>
				<Text style={[styles.statusText, { color: theme.text }]}>Current Status: {currentStatus}</Text>
				<View style={styles.buttonContainer}>
					{currentStatus === "assigned" && (
						<TouchableOpacity
							style={[styles.button, { backgroundColor: theme.primary }]}
							onPress={() => handleStatusUpdate("en_route")}
						>
							<Text style={styles.buttonText}>Start Journey</Text>
						</TouchableOpacity>
					)}
					{currentStatus === "en_route" && (
						<TouchableOpacity
							style={[styles.button, { backgroundColor: theme.primary }]}
							onPress={() => handleStatusUpdate("arrived")}
						>
							<Text style={styles.buttonText}>Mark as Arrived</Text>
						</TouchableOpacity>
					)}
					{currentStatus === "arrived" && (
						<TouchableOpacity
							style={[styles.button, { backgroundColor: theme.success }]}
							onPress={() => handleStatusUpdate("completed")}
						>
							<Text style={styles.buttonText}>Complete Emergency</Text>
						</TouchableOpacity>
					)}
				</View>
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
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	headerText: {
		fontSize: 20,
		fontWeight: "bold",
		marginLeft: 16,
	},
	backButton: {
		padding: 8,
	},
	map: {
		flex: 1,
	},
	markerContainer: {
		padding: 8,
		borderRadius: 20,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	footer: {
		padding: 16,
		elevation: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	statusText: {
		fontSize: 16,
		fontWeight: "500",
		marginBottom: 12,
		textAlign: "center",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "center",
	},
	button: {
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "500",
	},
	infoContainer: {
		position: "absolute",
		bottom: 100,
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

export default ServiceProviderLiveTracking;
