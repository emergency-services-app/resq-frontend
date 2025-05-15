import React, { useState } from "react";
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
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { updateServiceProviderStatus } from "@/services/api/service-provider";
import { capitalizeFirstLetter, defineServiceStatus } from "@/lib/utils";

const ServiceProviderProfileScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const user = useAuthStore((state) => state.serviceProvider);
	const { setProviderStatus } = useAuthStore();
	const [isUpdating, setIsUpdating] = useState(false);
	const [isAvailable, setIsAvailable] = useState(defineServiceStatus(user.serviceStatus));
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleStatusChange = async (newStatus: boolean) => {
		try {
			setIsAvailable(newStatus);
			setIsUpdating(true);
			const status = newStatus ? "available" : "off_duty";
			await updateServiceProviderStatus({ status });
			setProviderStatus(status);
		} catch (error: any) {
			Alert.alert("Error", error.response?.data?.message || "Failed to update status. Please try again.");
			setIsAvailable(!newStatus);
		} finally {
			setIsUpdating(false);
		}
	};

	const menuItems = [
		{
			icon: "person-outline",
			label: "Personal Information",
			onPress: () => router.push("/service-provider/personal-information"),
		},
		{
			icon: "car-outline",
			label: "Vehicle Information",
			onPress: () => router.push("/service-provider/vehicle-information"),
		},
		{
			icon: "lock-closed-outline",
			label: "Change Password",
			onPress: () => router.push("/service-provider/change-password"),
		},
		{
			icon: "notifications-outline",
			label: "Notifications",
			type: "switch",
			value: notificationsEnabled,
			onValueChange: (value: boolean) => {
				setNotificationsEnabled(value);
				// Optionally persist preference here
			},
		},
		{
			icon: "document-text-outline",
			label: "Terms and Conditions",
			onPress: () => router.push("/service-provider/terms-and-conditions"),
		},
	];

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
							<Text style={[styles.headerText, { color: theme.text }]}>Profile</Text>
						</View>
					</View>
				</LinearGradient>

				<View style={styles.content}>
					<View style={styles.profileSection}>
						<View style={[styles.profileImageContainer, { backgroundColor: theme.surface }]}>
							{user?.profilePicture ? (
								<Image
									source={{ uri: user.profilePicture }}
									style={styles.profileImage}
								/>
							) : (
								<Ionicons
									name="person"
									size={40}
									color={theme.textSecondary}
								/>
							)}
						</View>
						<Text style={[styles.name, { color: theme.text }]}>{user?.name}</Text>
						<Text style={[styles.role, { color: theme.textSecondary }]}>Service Provider</Text>

						<View style={[styles.statusContainer, { backgroundColor: theme.surface }]}>
							<View style={styles.statusRow}>
								<Text style={[styles.statusLabel, { color: theme.text }]}>Service Status</Text>
								<Switch
									value={isAvailable}
									onValueChange={handleStatusChange}
									trackColor={{ false: theme.border, true: theme.primary }}
									thumbColor={isAvailable ? "#fff" : "#f4f3f4"}
								/>
							</View>
							<Text style={[styles.statusText, { color: isAvailable ? theme.success : theme.error }]}>
								{isAvailable ? "Available for Service" : "Currently Unavailable"}
							</Text>
						</View>
					</View>

					<View style={styles.infoSection}>
						<View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
							<View style={styles.infoRow}>
								<Ionicons
									name="car"
									size={24}
									color={theme.primary}
								/>
								<View style={styles.infoContent}>
									<Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Vehicle Type</Text>
									<Text style={[styles.infoValue, { color: theme.text }]}>
										{capitalizeFirstLetter(user?.serviceType)}
									</Text>
								</View>
							</View>
							<View style={styles.infoRow}>
								<Ionicons
									name="location"
									size={24}
									color={theme.primary}
								/>
								<View style={styles.infoContent}>
									<Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Service Area</Text>
									<Text style={[styles.infoValue, { color: theme.text }]}>{user?.serviceArea}</Text>
								</View>
							</View>
						</View>
					</View>

					<View style={styles.menuSection}>
						{menuItems.map((item, index) => (
							<View
								key={index}
								style={[styles.menuItem, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
							>
								<View style={styles.menuItemLeft}>
									<View style={[styles.iconContainer, { backgroundColor: theme.border }]}>
										<Ionicons
											name={item.icon as any}
											size={24}
											color={theme.primary}
										/>
									</View>
									<Text style={[styles.menuItemText, { color: theme.text }]}>{item.label}</Text>
								</View>
								{item.type === "switch" ? (
									<Switch
										value={item.value}
										onValueChange={item.onValueChange}
										trackColor={{ false: theme.border, true: theme.primary }}
										thumbColor={item.value ? "#fff" : "#f4f3f4"}
									/>
								) : (
									<TouchableOpacity onPress={item.onPress}>
										<Ionicons
											name="chevron-forward"
											size={24}
											color={theme.textSecondary}
										/>
									</TouchableOpacity>
								)}
							</View>
						))}
					</View>

					<TouchableOpacity
						style={[styles.logoutButton, { backgroundColor: theme.error }]}
						onPress={() => {
							setIsLoading(true);
							useAuthStore.getState().logout();
							router.replace("/sign-in");
							setIsLoading(false);
						}}
					>
						{isLoading ? (
							<ActivityIndicator
								size="small"
								color="#fff"
							/>
						) : (
							<>
								<Ionicons
									name="log-out-outline"
									size={20}
									color="#fff"
								/>
								<Text style={styles.logoutText}>Log Out</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1 },
	container: { flex: 1 },
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
	headerContent: { flexDirection: "row", alignItems: "center" },
	logo: { width: 40, height: 40, borderRadius: 20 },
	textContainer: { marginLeft: 15, flex: 1 },
	headerText: { fontSize: 24, fontWeight: "bold", textAlign: "left" },
	content: { padding: 20 },
	profileSection: { alignItems: "center", marginBottom: 30 },
	profileImageContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 15,
	},
	profileImage: { width: 100, height: 100, borderRadius: 50 },
	name: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
	role: { fontSize: 16 },
	statusContainer: { marginTop: 20, padding: 15, borderRadius: 12, width: "100%" },
	statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
	statusLabel: { fontSize: 16, fontWeight: "600" },
	statusText: { fontSize: 14 },
	infoSection: { marginBottom: 30 },
	infoCard: { padding: 15, borderRadius: 12 },
	infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
	infoContent: { marginLeft: 15, flex: 1 },
	infoLabel: { fontSize: 14, marginBottom: 2 },
	infoValue: { fontSize: 16, fontWeight: "500" },
	menuSection: { backgroundColor: "transparent", borderRadius: 12, overflow: "hidden" },
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
	},
	menuItemLeft: { flexDirection: "row", alignItems: "center" },
	menuItemText: { fontSize: 16, marginLeft: 15 },
	iconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 15,
		borderRadius: 12,
		marginTop: 20,
		gap: 10,
	},
	logoutText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default ServiceProviderProfileScreen;
