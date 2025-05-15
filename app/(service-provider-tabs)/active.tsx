import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Alert, Platform } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useSocketStore } from "@/store/socketStore";
import { SocketEventEnums } from "@/constants";
import { getEmergencyResponses, updateEmergencyResponse } from "@/services/api/emergency-response";
import { useRouter } from "expo-router";

interface EmergencyResponse {
	id: string;
	emergencyRequestId: string;
	serviceProviderId: string;
	statusUpdate: string;
	assignedAt: string;
	respondedAt: string | null;
	updateDescription: string | null;
	originLocation: {
		latitude: string;
		longitude: string;
	};
	destinationLocation: {
		latitude: string;
		longitude: string;
	};
}

interface IUpdateEmergencyResponse {
	statusUpdate: string;
	updateDescription: string;
}

const ActiveEmergenciesScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const { socket } = useSocketStore();
	const mapRef = useRef<MapView>(null);
	const [location, setLocation] = useState<Location.LocationObject | null>(null);
	const [activeResponse, setActiveResponse] = useState<EmergencyResponse | null>(null);
	const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [serviceStatus, setServiceStatus] = useState<string>("");

	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				Alert.alert("Permission Denied", "Location permission is required for live tracking");
				return;
			}

			const location = await Location.getCurrentPositionAsync({});
			setLocation(location);

			if (!socket) {
				// TODO: LOGOOGOG
				return;
			}
			// Start watching position
			const subscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 5000,
					distanceInterval: 10,
				},
				(newLocation) => {
					setLocation(newLocation);
					if (activeResponse) {
						socket.emit(SocketEventEnums.SEND_LOCATION, {
							emergencyResponseId: activeResponse.id,
							location: {
								latitude: newLocation.coords.latitude.toString(),
								longitude: newLocation.coords.longitude.toString(),
							},
						});
					}
				}
			);

			return () => {
				subscription.remove();
			};
		})();
	}, []);

	useEffect(() => {
		if (!socket) return;

		const handleEmergencyAssigned = (data: any) => {
			const { emergencyResponse, optimalPath } = data;
			setActiveResponse(emergencyResponse);
			setRouteCoordinates(
				Array.isArray(optimalPath)
					? optimalPath.map((pt: any) => ({
							latitude: Number(pt.latitude),
							longitude: Number(pt.longitude),
					  }))
					: []
			);
			setServiceStatus(emergencyResponse.statusUpdate || "");
			router.push({
				pathname: "/(service-provider-tabs)/live-tracking",
				params: {
					responseId: String(emergencyResponse.id),
					emergencyLat: String(emergencyResponse.destinationLocation.latitude),
					emergencyLng: String(emergencyResponse.destinationLocation.longitude),
					providerLat: String(emergencyResponse.originLocation.latitude),
					providerLng: String(emergencyResponse.originLocation.longitude),
					optimalPath: JSON.stringify(optimalPath),
					status: String(emergencyResponse.statusUpdate || "Assigned"),
				},
			});
		};

		socket.on(SocketEventEnums.EMERGENCY_RESPONSE_CREATED, handleEmergencyAssigned);
		return () => {
			socket.off(SocketEventEnums.EMERGENCY_RESPONSE_CREATED, handleEmergencyAssigned);
		};
	}, [socket, router]);

	const handleUpdateStatus = async (status: string) => {
		try {
			setIsLoading(true);
			if (!activeResponse || !socket) return;

			const updateData: IUpdateEmergencyResponse = {
				statusUpdate: status,
				updateDescription: `Status updated to ${status}`,
			};

			await updateEmergencyResponse(activeResponse.id, updateData as any);
			socket.emit(SocketEventEnums.UPDATE_PROVIDER_STATUS, { status });
			Alert.alert("Success", "Status updated successfully");
		} catch (error) {
			Alert.alert("Error", "Failed to update status");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCompleteEmergency = async () => {
		try {
			setIsLoading(true);
			if (!activeResponse) return;

			const updateData: IUpdateEmergencyResponse = {
				statusUpdate: "completed",
				updateDescription: "Emergency response completed",
			};

			await updateEmergencyResponse(activeResponse.id, updateData as any);
			setActiveResponse(null);
			setRouteCoordinates([]);
			Alert.alert("Success", "Emergency response completed");
		} catch (error) {
			Alert.alert("Error", "Failed to complete emergency response");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
				backgroundColor={theme.background}
			/>
			<LinearGradient
				colors={[theme.background, theme.surface]}
				style={styles.header}
			>
				<View style={styles.headerContent}>
					<Text style={[styles.headerText, { color: theme.text }]}>Active Emergency</Text>
				</View>
			</LinearGradient>

			<View style={styles.container}>
				{activeResponse ? (
					<>
						<MapView
							ref={mapRef}
							style={styles.map}
							provider={PROVIDER_GOOGLE}
							showsUserLocation
							showsMyLocationButton
							initialRegion={
								location
									? {
											latitude: location.coords.latitude,
											longitude: location.coords.longitude,
											latitudeDelta: 0.01,
											longitudeDelta: 0.01,
									  }
									: undefined
							}
						>
							{location && (
								<Marker
									coordinate={{
										latitude: location.coords.latitude,
										longitude: location.coords.longitude,
									}}
									title="Your Location"
								/>
							)}
							{activeResponse.destinationLocation && (
								<Marker
									coordinate={{
										latitude: parseFloat(activeResponse.destinationLocation.latitude),
										longitude: parseFloat(activeResponse.destinationLocation.longitude),
									}}
									title="Emergency Location"
									pinColor="red"
								/>
							)}
							{routeCoordinates.length > 0 && (
								<Polyline
									coordinates={routeCoordinates}
									strokeWidth={4}
									strokeColor={theme.primary}
								/>
							)}
						</MapView>

						<View style={[styles.controls, { backgroundColor: theme.surface }]}>
							<View style={styles.statusContainer}>
								<Text style={[styles.statusLabel, { color: theme.text }]}>Status:</Text>
								<Text style={[styles.statusValue, { color: theme.primary }]}>{serviceStatus}</Text>
							</View>

							<View style={styles.buttonContainer}>
								<TouchableOpacity
									style={[styles.button, { backgroundColor: theme.primary }]}
									onPress={() => handleUpdateStatus("on_way")}
									disabled={isLoading}
								>
									<Text style={styles.buttonText}>On Way</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.button, { backgroundColor: theme.primary }]}
									onPress={() => handleUpdateStatus("arrived")}
									disabled={isLoading}
								>
									<Text style={styles.buttonText}>Arrived</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.button, { backgroundColor: theme.error }]}
									onPress={handleCompleteEmergency}
									disabled={isLoading}
								>
									<Text style={styles.buttonText}>Complete</Text>
								</TouchableOpacity>
							</View>
						</View>
					</>
				) : (
					<View style={styles.noEmergency}>
						<Ionicons
							name="alert-circle-outline"
							size={64}
							color={theme.textSecondary}
						/>
						<Text style={[styles.noEmergencyText, { color: theme.textSecondary }]}>No Active Emergency</Text>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
	},
	header: {
		padding: 15,
		paddingTop: 15,
		paddingBottom: 15,
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
		marginBottom: 20,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
	},
	map: {
		flex: 1,
	},
	controls: {
		padding: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	statusContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 15,
	},
	statusLabel: {
		fontSize: 16,
		fontWeight: "500",
		marginRight: 8,
	},
	statusValue: {
		fontSize: 16,
		fontWeight: "bold",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 10,
	},
	button: {
		flex: 1,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	noEmergency: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	noEmergencyText: {
		fontSize: 18,
		marginTop: 16,
	},
});

export default ActiveEmergenciesScreen;
