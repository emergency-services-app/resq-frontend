import React from "react";
import { AVAILABLE_SERVICES } from "@/constants";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	StatusBar,
	Image,
	ActivityIndicator,
} from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { capitalizeFirstLetter, getServiceType, requestHandler } from "@/lib/utils";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { createEmergencyRequest } from "@/services/api/emergency-request";
import { useLocationStore } from "@/store/locationStore";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";

const EmergencyServicesScreen = () => {
	const router = useRouter();
	const { user } = useAuthStore((state) => state);
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const [isCreating, setIsCreating] = useState(false);
	const { askLocationPermission, getLocation, location, permissionStatus } = useLocationStore();

	if (!user) {
		alert("Please sign in");
		router.replace("/sign-in");
		return null;
	}

	const services: { name: string; icon: "ambulance" | "fire-extinguisher" | "shield" | "car"; color: string }[] = [
		{ name: "Ambulance", icon: "ambulance", color: theme.primary },
		{ name: "Fire brigade", icon: "fire-extinguisher", color: theme.primary },
		{ name: "Police", icon: "shield", color: theme.primary },
		{ name: "Rescue", icon: "car", color: theme.primary },
	];

	const pastServices = [
		{ name: "Ambulance", time: "2023-10-27 10:30 AM", status: "Completed" },
		{ name: "Police", time: "2023-10-25 03:15 PM", status: "Completed" },
		{ name: "Fire Brigade", time: "2023-10-20 08:00 AM", status: "Completed" },
	];

	useEffect(() => {
		if (permissionStatus === "granted") {
			getLocation();
		} else {
			askLocationPermission();
		}
	}, [permissionStatus]);

	const handleSelectService = async (service: string) => {
		try {
			if (!location) {
				await askLocationPermission();
				await getLocation();
			}

			if (!location) {
				alert("Failed to get your location. Please try again.");
				return;
			}

			await requestHandler(
				async () =>
					await createEmergencyRequest({
						emergencyType: getServiceType(service),
						emergencyDescription: `Request created from ${user.name} at location ${location.coords.latitude}, ${location.coords.longitude}`,

						userLocation: {
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
						},
					}),
				() => setIsCreating(true),
				(res) => {
					const { data } = res;
					if (!data || !data.emergencyRequest) return;

					router.push(`/service/${service}?requestId=${data.emergencyRequest.id}`);
				},
				(err) => {
					console.log("Error requesting service:", err);
					alert("Failed to request service. Please try again.");
				}
			);
		} catch (error) {
			console.log("Error requesting service:", error);
			alert("Failed to request service. Please try again.");
		}
	};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
				backgroundColor={theme.background}
			/>
			<ScrollView
				style={[styles.container, { backgroundColor: theme.background }]}
				showsVerticalScrollIndicator={false}
			>
				<LinearGradient
					colors={[theme.background, theme.surface]}
					style={styles.header}
				>
					<View style={styles.headerContent}>
						<Image
							source={require("@/assets/images/logo.png")}
							style={styles.logo}
							resizeMode="contain"
						/>
						<View style={styles.textContainer}>
							<Text style={[styles.headerText, { color: theme.text }]}>पहिलो उद्धार</Text>
							<Text style={[styles.headerSubtext, { color: theme.textSecondary }]}>Just a Tap away</Text>
						</View>
					</View>
				</LinearGradient>

				<View style={styles.greetingContainer}>
					<Text style={[styles.welcome, { color: theme.textSecondary }]}>Welcome,</Text>
					<Text style={[styles.username, { color: theme.text }]}>{capitalizeFirstLetter(user.name)}</Text>
				</View>

				<View style={styles.emergencySection}>
					<Text style={[styles.title, { color: theme.primary }]}>Are you in emergency?</Text>
					<Text style={[styles.subtitle, { color: theme.textSecondary }]}>
						Select the service you need assistance with.
					</Text>

					<View style={styles.serviceGrid}>
						{services.map((service, index) => (
							<TouchableOpacity
								key={index}
								style={[styles.serviceButton, { backgroundColor: theme.surface, borderLeftColor: service.color }]}
								onPress={() => handleSelectService(service.name)}
								activeOpacity={0.7}
								disabled={isCreating}
							>
								<View style={[styles.iconContainer, { backgroundColor: `${service.color}20` }]}>
									<Icon
										name={service.icon}
										size={24}
										color={service.color}
									/>
								</View>
								<Text style={[styles.serviceText, { color: service.color }]}>{service.name}</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				<View style={styles.pastContainer}>
					<View style={styles.pastHeaderRow}>
						<Text style={[styles.pastTitle, { color: theme.text }]}>Recent Activities</Text>
						<TouchableOpacity>
							<Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
						</TouchableOpacity>
					</View>

					{pastServices.map((item, index) => (
						<View
							key={index}
							style={[styles.pastItemCard, { backgroundColor: theme.surface }]}
						>
							<View style={styles.pastItemLeft}>
								<Text style={[styles.pastItemName, { color: theme.text }]}>{item.name}</Text>
								<Text style={[styles.pastTime, { color: theme.textSecondary }]}>{item.time}</Text>
							</View>
							<View style={styles.pastItemRight}>
								<Text style={[styles.statusBadge, { backgroundColor: theme.success, color: theme.background }]}>
									{item.status}
								</Text>
								<Ionicons
									name="chevron-forward"
									size={16}
									color={theme.textSecondary}
								/>
							</View>
						</View>
					))}
				</View>
			</ScrollView>

			{isCreating && (
				<View style={[styles.loadingOverlay, { backgroundColor: `${theme.background}99` }]}>
					<View style={[styles.loadingContent, { backgroundColor: theme.surface }]}>
						<ActivityIndicator
							size="large"
							color={theme.primary}
						/>
						<Text style={[styles.loadingText, { color: theme.text }]}>Requesting service...</Text>
					</View>
				</View>
			)}
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
	},
	logo: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "transparent",
	},
	textContainer: {
		marginLeft: 15,
		flex: 1,
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "left",
	},
	headerSubtext: {
		fontSize: 14,
		textAlign: "left",
		marginTop: 2,
	},
	greetingContainer: {
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	welcome: {
		fontSize: 22,
		fontWeight: "500",
	},
	username: {
		fontSize: 26,
		fontWeight: "bold",
	},
	emergencySection: {
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		marginBottom: 20,
	},
	serviceGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	serviceButton: {
		width: "48%",
		borderRadius: 12,
		padding: 15,
		alignItems: "center",
		marginBottom: 15,
		borderLeftWidth: 4,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	iconContainer: {
		width: 50,
		height: 50,
		borderRadius: 25,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
	serviceText: {
		fontSize: 16,
		fontWeight: "600",
	},
	pastContainer: {
		marginTop: 30,
		paddingHorizontal: 20,
		paddingBottom: 30,
	},
	pastHeaderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
	},
	pastTitle: {
		fontWeight: "bold",
		fontSize: 20,
	},
	viewAllText: {
		fontSize: 14,
		fontWeight: "500",
	},
	pastItemCard: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	pastItemLeft: {
		flex: 1,
	},
	pastItemRight: {
		flexDirection: "row",
		alignItems: "center",
	},
	pastItemName: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	pastTime: {
		fontSize: 14,
	},
	statusBadge: {
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 12,
		fontSize: 12,
		fontWeight: "500",
		marginRight: 8,
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingContent: {
		padding: 20,
		borderRadius: 12,
		alignItems: "center",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		fontWeight: "500",
	},
});

export default EmergencyServicesScreen;
