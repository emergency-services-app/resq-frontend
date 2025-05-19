import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	StatusBar,
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

const ServiceSettingsScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const user = useAuthStore((state) => state.serviceProvider);
	const { setProviderStatus } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);
	const [isAvailable, setIsAvailable] = useState(user?.status === "available");
	const [autoAccept, setAutoAccept] = useState(false);
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);

	const handleStatusToggle = async () => {
		try {
			setIsLoading(true);
			const newStatus = isAvailable ? "unavailable" : "available";
			await updateServiceProviderStatus(newStatus);
			setProviderStatus(newStatus);
			setIsAvailable(!isAvailable);
			Alert.alert("Success", `You are now ${newStatus}`);
		} catch (error) {
			console.error("Error updating status:", error);
			Alert.alert("Error", "Failed to update status");
		} finally {
			setIsLoading(false);
		}
	};

	const settingsItems = [
		{
			icon: "radio-button-on",
			label: "Service Availability",
			description: "Toggle your availability for emergency responses",
			type: "switch",
			value: isAvailable,
			onValueChange: handleStatusToggle,
		},
		{
			icon: "flash",
			label: "Auto Accept",
			description: "Automatically accept emergency requests",
			type: "switch",
			value: autoAccept,
			onValueChange: setAutoAccept,
		},
		{
			icon: "notifications",
			label: "Notifications",
			description: "Receive notifications for new requests",
			type: "switch",
			value: notificationsEnabled,
			onValueChange: setNotificationsEnabled,
		},
	];

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
					<Text style={[styles.headerText, { color: theme.text }]}>Service Settings</Text>
				</View>
			</LinearGradient>

			<ScrollView
				style={[styles.container, { backgroundColor: theme.background }]}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.content}>
					<View style={styles.settingsSection}>
						{settingsItems.map((item, index) => (
							<View
								key={index}
								style={[styles.settingItem, { backgroundColor: theme.surface }]}
							>
								<View style={styles.settingLeft}>
									<View style={[styles.iconContainer, { backgroundColor: theme.border }]}>
										<Ionicons
											name={item.icon as any}
											size={24}
											color={theme.primary}
										/>
									</View>
									<View style={styles.settingInfo}>
										<Text style={[styles.settingLabel, { color: theme.text }]}>{item.label}</Text>
										<Text style={[styles.settingDescription, { color: theme.textSecondary }]}>{item.description}</Text>
									</View>
								</View>
								{item.type === "switch" ? (
									<Switch
										value={item.value}
										onValueChange={item.onValueChange}
										trackColor={{ false: theme.border, true: theme.primary }}
										thumbColor={item.value ? "#fff" : "#f4f3f4"}
										disabled={isLoading}
									/>
								) : null}
							</View>
						))}
					</View>

					<View style={styles.infoSection}>
						<View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
							<Text style={[styles.infoTitle, { color: theme.text }]}>Service Information</Text>
							<View style={styles.infoRow}>
								<Ionicons
									name="car"
									size={20}
									color={theme.primary}
								/>
								<Text style={[styles.infoText, { color: theme.text }]}>Service Type: {user?.serviceType}</Text>
							</View>
							<View style={styles.infoRow}>
								<Ionicons
									name="location"
									size={20}
									color={theme.primary}
								/>
								<Text style={[styles.infoText, { color: theme.text }]}>Service Area: {user?.serviceArea}</Text>
							</View>
						</View>
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
		padding: 20,
	},
	settingsSection: {
		marginBottom: 30,
	},
	settingItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 15,
		borderRadius: 12,
		marginBottom: 15,
	},
	settingLeft: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 15,
	},
	settingInfo: {
		flex: 1,
	},
	settingLabel: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	settingDescription: {
		fontSize: 14,
	},
	infoSection: {
		marginBottom: 30,
	},
	infoCard: {
		padding: 15,
		borderRadius: 12,
	},
	infoTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 15,
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
});

export default ServiceSettingsScreen;
