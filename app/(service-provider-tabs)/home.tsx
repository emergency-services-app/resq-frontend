import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	StatusBar,
	Image,
	TouchableOpacity,
	Switch,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import MapView, { Marker } from "react-native-maps";
import { useSocketStore } from "@/store/socketStore";
import { SocketEventEnums } from "@/constants";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useNotificationStore } from "@/store/notificationStore";
import ServiceProviderStatus from "@/components/screens/ServiceProviderStatus";

const ServiceProviderHomeScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const user = useAuthStore((state) => state.serviceProvider);
	const { setProviderStatus } = useAuthStore();
	const { socket } = useSocketStore();
	const { scheduleLocalNotification } = useNotificationStore();

	const menuItems = [
		{
			icon: "time-outline" as const,
			label: "Response History",
			onPress: () => router.push("/service-provider/provider-responses"),
		},
		{
			icon: "location-outline" as const,
			label: "Update Location",
			onPress: () => router.push("/service-provider/update-location"),
		},
		{
			icon: "settings-outline" as const,
			label: "Service Settings",
			onPress: () => router.push("/service-provider/service-settings"),
		},
	];

	useEffect(() => {
		if (!socket) return;

		const handleConnect = () => {
			console.log("[ServiceProviderDashboard] Socket connected");
		};

		const handleEmergencyAssigned = (data: any) => {
			console.log("[ServiceProviderDashboard] Emergency assigned:", data);
			const { emergencyResponse, optimalPath } = data;
			router.push({
				pathname: "../(maps)/live-tracking",
				params: {
					emergencyResponseId: emergencyResponse?.id,
					userLat: data?.emergencyResponse?.destinationLocation.latitude.toString() || "",
					userLng: data?.emergencyResponse?.destinationLocation.longitude.toString() || "",
					providerLat: data?.emergencyResponse.originLocation.latitude.toString(),
					providerLng: data?.emergencyResponse.originLocation.longitude.toString(),
					optimalPath: JSON.stringify(data?.optimalPath),
				},
			});
		};

		const handleNotification = async (data: any) => {
			console.log("[ServiceProviderDashboard] Notification received:", data);
			console.log("NOTIFICATION CREATED", data);

			if (data.type) {
				const { emergencyType, location, eta, distance, userInfo } = data.metadata;

				const notificationTitle = `Emergency Service: ${emergencyType}`;
				const notificationBody = `Requested by ${userInfo?.name}\t${userInfo?.contact} at ${location.generalName}`;

				scheduleLocalNotification(notificationTitle, notificationBody, data);
			} else {
				scheduleLocalNotification(
					data.title || "New Notification",
					data.message || "You have a new notification",
					data.data
				);
			}
		};

		socket.on(SocketEventEnums.CONNECTION_EVENT, handleConnect);
		socket.on(SocketEventEnums.NOTIFICATION_CREATED, handleNotification);
		socket.on(SocketEventEnums.EMERGENCY_RESPONSE_CREATED, handleEmergencyAssigned);

		// Cleanup
		return () => {
			socket.off(SocketEventEnums.CONNECTION_EVENT, handleConnect);
			socket.off(SocketEventEnums.EMERGENCY_RESPONSE_CREATED, handleEmergencyAssigned);
			socket.off(SocketEventEnums.NOTIFICATION_CREATED, handleNotification);
		};
	}, [socket, router, setProviderStatus, scheduleLocalNotification]);

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

				<View style={styles.content}>
					<ServiceProviderStatus />

					<View style={styles.mapContainer}>
						<MapView
							style={styles.map}
							initialRegion={{
								latitude: 27.7172,
								longitude: 85.324,
								latitudeDelta: 0.0922,
								longitudeDelta: 0.0421,
							}}
						>
							<Marker
								coordinate={{
									latitude: 27.7172,
									longitude: 85.324,
								}}
								title="Your Location"
							/>
						</MapView>
					</View>

					<View style={styles.menuSection}>
						{menuItems.map((item, index) => (
							<TouchableOpacity
								key={index}
								style={[styles.menuItem, { borderBottomColor: theme.border }]}
								onPress={item.onPress}
							>
								<View style={styles.menuItemLeft}>
									<Ionicons
										name={item.icon}
										size={24}
										color={theme.text}
									/>
									<Text style={[styles.menuItemText, { color: theme.text }]}>{item.label}</Text>
								</View>
								<Ionicons
									name="chevron-forward"
									size={24}
									color={theme.textSecondary}
								/>
							</TouchableOpacity>
						))}
					</View>
				</View>
			</ScrollView>
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

	headerSubtext: {
		fontSize: 14,
		textAlign: "left",
		marginTop: 2,
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
		width: 40,
		height: 40,
		borderRadius: 20,
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
	content: {
		padding: 20,
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
	welcomeSection: {
		marginBottom: 30,
	},
	welcomeText: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 5,
	},
	subText: {
		fontSize: 16,
	},
	menuSection: {
		gap: 15,
		marginBottom: 30,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 20,
		borderRadius: 12,
		borderBottomWidth: 1,
	},
	menuItemLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	menuItemText: {
		fontSize: 16,
		marginLeft: 15,
	},
	statusSection: {
		marginBottom: 20,
	},
	statusCard: {
		padding: 20,
		borderRadius: 12,
		marginBottom: 20,
	},
	statusHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	statusTitle: {
		fontSize: 18,
		fontWeight: "600",
	},
	statusText: {
		fontSize: 16,
	},
	mapContainer: {
		height: 200,
		borderRadius: 12,
		overflow: "hidden",
		marginBottom: 20,
	},
	map: {
		width: "100%",
		height: "100%",
	},
	quickActionButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 15,
		borderRadius: 12,
		marginBottom: 20,
	},
	quickActionText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 10,
	},
});

export default ServiceProviderHomeScreen;
