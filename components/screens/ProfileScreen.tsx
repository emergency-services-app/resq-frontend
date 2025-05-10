import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	SafeAreaView,
	StatusBar,
	Alert,
	ActivityIndicator,
	Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { capitalizeFirstLetter } from "@/lib/utils";

type MenuItem = {
	label: string;
	description?: string;
	icon: keyof typeof Ionicons.glyphMap;
	onPress: () => void;
	isExpandable?: boolean;
	isToggle?: boolean;
	value?: boolean;
};

type MenuSection = {
	title: string;
	items: MenuItem[];
};

const ProfileScreen = () => {
	const router = useRouter();
	const { logout, isLoading, user } = useAuthStore();
	const { isDarkMode, toggleDarkMode } = useThemeStore();
	const [isDoNotDistrub, setIsDoNotDistrub] = React.useState(false);
	const theme = isDarkMode ? darkTheme : lightTheme;

	if (isLoading) return <ActivityIndicator />;
	if (!user) return null;

	const menuItems: MenuSection[] = [
		{
			title: "Account Settings",
			items: [
				{
					label: "Personal Information",
					description: "Update your personal details",
					icon: "person-outline",
					onPress: () => router.push("/personal-information"),
					isExpandable: true,
				},
				{
					label: "Change Password",
					description: "Update your password",
					icon: "lock-closed-outline",
					onPress: () => router.push("/change-password"),
					isExpandable: true,
				},
			],
		},
		{
			title: "Preference",
			items: [
				{
					label: "Dark Mode",
					description: "Toggle dark mode",
					icon: isDarkMode ? "moon" : "sunny-outline",
					onPress: toggleDarkMode,
					isToggle: true,
					value: isDarkMode,
				},
				{
					icon: "notifications-outline",
					label: "Notification",
					isExpandable: true,
					isToggle: true,
					onPress: () => {
						setIsDoNotDistrub(!isDoNotDistrub);
					},
					value: isDoNotDistrub,
				},
			],
		},
		{
			title: "Support",
			items: [
				{
					label: "Terms and Conditions",
					description: "Read our terms and conditions",
					icon: "document-text-outline",
					onPress: () => router.push("/terms-and-conditions"),
					isExpandable: true,
				},
				{ icon: "chatbubble-outline", label: "Feedback", onPress: () => Alert.alert("Feedback") },
			],
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
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => router.back()}
					>
						<Ionicons
							name="arrow-back"
							size={24}
							color={theme.text}
						/>
					</TouchableOpacity>
					<Text style={[styles.headerText, { color: theme.text }]}>Profile</Text>
					<Text style={[styles.headerSubtext, { color: theme.textSecondary }]}>Manage your account settings</Text>
				</LinearGradient>

				<View style={styles.profileSection}>
					<View style={styles.avatarContainer}>
						<View style={[styles.avatar, { backgroundColor: theme.primary }]}>
							<Ionicons
								name="person"
								size={40}
								color="#fff"
							/>
						</View>
						<Text style={[styles.name, { color: theme.text }]}>{capitalizeFirstLetter(user.name)}</Text>
						<Text style={[styles.phone, { color: theme.textSecondary }]}>{user.phoneNumber}</Text>
					</View>
				</View>

				<View style={styles.menuContainer}>
					{menuItems.map((section, sectionIndex) => (
						<View
							key={sectionIndex}
							style={styles.section}
						>
							<Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
							{section.items.map((item, itemIndex) => (
								<TouchableOpacity
									key={itemIndex}
									style={[styles.menuItem, { backgroundColor: theme.surface }]}
									onPress={item.onPress}
								>
									<View style={styles.menuItemLeft}>
										<View style={[styles.iconContainer, { backgroundColor: `${theme.primary}20` }]}>
											<Ionicons
												name={item.icon}
												size={22}
												color={theme.primary}
											/>
										</View>
										<Text style={[styles.menuItemText, { color: theme.text }]}>{item.label}</Text>
									</View>
									{item.isToggle ? (
										<Switch
											value={item.value}
											onValueChange={item.onPress}
											trackColor={{ false: theme.border, true: theme.primary }}
											thumbColor={isDarkMode ? theme.primary : theme.border}
										/>
									) : item.isExpandable ? (
										<Ionicons
											name="chevron-forward"
											size={20}
											color={theme.textSecondary}
										/>
									) : null}
								</TouchableOpacity>
							))}
						</View>
					))}

					<TouchableOpacity
						style={[styles.logoutButton, { backgroundColor: theme.error }]}
						onPress={logout}
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
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
	},
	header: {
		textAlign: "left",
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
	backButton: {
		position: "absolute",
		left: 15,
		top: 15,
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "left",
		paddingLeft: 40,
	},
	headerSubtext: {
		fontSize: 14,
		textAlign: "left",
		paddingLeft: 40,
		marginTop: 5,
	},
	profileSection: {
		alignItems: "center",
		marginBottom: 20,
	},
	avatarContainer: {
		alignItems: "center",
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 15,
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	name: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 5,
	},
	phone: {
		fontSize: 16,
	},
	menuContainer: {
		padding: 20,
	},
	section: {
		marginBottom: 25,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 15,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 15,
		borderRadius: 12,
		marginBottom: 10,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	menuItemLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 15,
	},
	menuItemText: {
		fontSize: 16,
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

export default ProfileScreen;
