import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	StatusBar,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useSocketStore } from "@/store/socketStore";
import { SocketEventEnums } from "@/constants";

const UpdateLocationScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const { socket } = useSocketStore();
	const [location, setLocation] = useState<Location.LocationObject | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					Alert.alert("Permission Denied", "Location permission is required to update your location");
					return;
				}

				const location = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.High,
				});
				setLocation(location);
			} catch (error) {
				console.error("Error getting location:", error);
				Alert.alert("Error", "Failed to get your current location");
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	const handleUpdateLocation = async () => {
		if (!location || !socket) return;

		try {
			setIsUpdating(true);
			socket.emit(SocketEventEnums.UPDATE_PROVIDER_LOCATION, {
				location: {
					latitude: location.coords.latitude.toString(),
					longitude: location.coords.longitude.toString(),
				},
			});
			Alert.alert("Success", "Location updated successfully");
			router.back();
		} catch (error) {
			console.error("Error updating location:", error);
			Alert.alert("Error", "Failed to update location");
		} finally {
			setIsUpdating(false);
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
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}
					>
						<Ionicons
							name="arrow-back"
							size={24}
							color={theme.text}
						/>
					</TouchableOpacity>
					<Text style={[styles.headerText, { color: theme.text }]}>Update Location</Text>
				</View>
			</LinearGradient>

			<View style={styles.content}>
				{isLoading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator
							size="large"
							color={theme.primary}
						/>
						<Text style={[styles.loadingText, { color: theme.textSecondary }]}>Getting your current location...</Text>
					</View>
				) : location ? (
					<>
						<MapView
							style={styles.map}
							initialRegion={{
								latitude: location.coords.latitude,
								longitude: location.coords.longitude,
								latitudeDelta: 0.0922,
								longitudeDelta: 0.0421,
							}}
						>
							<Marker
								coordinate={{
									latitude: location.coords.latitude,
									longitude: location.coords.longitude,
								}}
								title="Your Location"
							>
								<View style={[styles.markerContainer, { backgroundColor: theme.primary }]}>
									<Ionicons
										name="location"
										size={24}
										color="#fff"
									/>
								</View>
							</Marker>
						</MapView>

						<View style={styles.locationInfo}>
							<View style={styles.infoRow}>
								<Ionicons
									name="location"
									size={20}
									color={theme.primary}
								/>
								<Text style={[styles.infoText, { color: theme.text }]}>
									Latitude: {location.coords.latitude.toFixed(6)}
								</Text>
							</View>
							<View style={styles.infoRow}>
								<Ionicons
									name="location"
									size={20}
									color={theme.primary}
								/>
								<Text style={[styles.infoText, { color: theme.text }]}>
									Longitude: {location.coords.longitude.toFixed(6)}
								</Text>
							</View>
						</View>

						<TouchableOpacity
							style={[styles.updateButton, { backgroundColor: theme.primary }]}
							onPress={handleUpdateLocation}
							disabled={isUpdating}
						>
							{isUpdating ? (
								<ActivityIndicator
									size="small"
									color="#fff"
								/>
							) : (
								<>
									<Ionicons
										name="refresh"
										size={20}
										color="#fff"
									/>
									<Text style={styles.updateButtonText}>Update Location</Text>
								</>
							)}
						</TouchableOpacity>
					</>
				) : (
					<View style={styles.errorContainer}>
						<Ionicons
							name="location"
							size={64}
							color={theme.error}
						/>
						<Text style={[styles.errorText, { color: theme.textSecondary }]}>Unable to get your location</Text>
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
	},
	backButton: {
		marginRight: 15,
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
	},
	content: {
		flex: 1,
		padding: 20,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
	},
	map: {
		flex: 1,
		borderRadius: 12,
		marginBottom: 20,
	},
	markerContainer: {
		padding: 8,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: "#fff",
	},
	locationInfo: {
		backgroundColor: "rgba(0,0,0,0.05)",
		padding: 15,
		borderRadius: 12,
		marginBottom: 20,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	infoText: {
		fontSize: 16,
		marginLeft: 10,
	},
	updateButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 15,
		borderRadius: 12,
		gap: 10,
	},
	updateButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 16,
		marginTop: 10,
	},
});

export default UpdateLocationScreen;
