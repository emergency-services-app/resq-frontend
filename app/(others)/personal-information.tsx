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
	TextInput,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/api/auth";

const PersonalInformationScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const { user, setUser } = useAuthStore();

	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
		phoneNumber: user?.phoneNumber.toString() || "",
	});

	const handleUpdate = async () => {
		try {
			setIsLoading(true);
			const response = await authApi.updateUser(formData);
			if (response.data) {
				setUser(response.data.user);
				setIsEditing(false);
				Alert.alert("Success", "Profile updated successfully");
			}
		} catch (error) {
			Alert.alert("Error", "Failed to update profile. Please try again.");
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
			<ScrollView
				style={[styles.container, { backgroundColor: theme.background }]}
				showsVerticalScrollIndicator={false}
			>
				<LinearGradient
					colors={[theme.background, theme.surface]}
					style={styles.header}
				>
					<View style={styles.headerContent}>
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
						<Image
							source={require("@/assets/images/logo.png")}
							style={styles.logo}
							resizeMode="contain"
						/>
						<View style={styles.textContainer}>
							<Text style={[styles.headerText, { color: theme.text }]}>Personal Information</Text>
						</View>
					</View>
				</LinearGradient>

				<View style={styles.content}>
					<View style={styles.avatarContainer}>
						<View style={[styles.avatar, { backgroundColor: theme.primary }]}>
							<Ionicons
								name="person"
								size={40}
								color="#fff"
							/>
						</View>
					</View>

					<View style={styles.formContainer}>
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: theme.surface,
										color: theme.text,
										borderColor: theme.border,
									},
								]}
								value={formData.name}
								onChangeText={(text) => setFormData({ ...formData, name: text })}
								editable={isEditing}
								placeholder="Enter your full name"
								placeholderTextColor={theme.textSecondary}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: theme.surface,
										color: theme.text,
										borderColor: theme.border,
									},
								]}
								value={formData.email}
								onChangeText={(text) => setFormData({ ...formData, email: text })}
								editable={isEditing}
								placeholder="Enter your email"
								placeholderTextColor={theme.textSecondary}
								keyboardType="email-address"
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: theme.surface,
										color: theme.text,
										borderColor: theme.border,
									},
								]}
								value={formData.phoneNumber}
								onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
								editable={isEditing}
								placeholder="Enter your phone number"
								placeholderTextColor={theme.textSecondary}
								keyboardType="phone-pad"
							/>
						</View>

						<TouchableOpacity
							style={[styles.button, { backgroundColor: isEditing ? theme.primary : theme.surface }]}
							onPress={isEditing ? handleUpdate : () => setIsEditing(true)}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={[styles.buttonText, { color: isEditing ? "#fff" : theme.text }]}>
									{isEditing ? "Save Changes" : "Edit Profile"}
								</Text>
							)}
						</TouchableOpacity>

						{isEditing && (
							<TouchableOpacity
								style={[styles.cancelButton, { backgroundColor: theme.surface }]}
								onPress={() => {
									setIsEditing(false);
									setFormData({
										name: user?.name || "",
										email: user?.email || "",
										phoneNumber: user?.phoneNumber || "",
									});
								}}
							>
								<Text style={[styles.cancelButtonText, { color: theme.error }]}>Cancel</Text>
							</TouchableOpacity>
						)}
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
	avatarContainer: {
		alignItems: "center",
		marginBottom: 30,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	formContainer: {
		gap: 20,
	},
	inputGroup: {
		gap: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
	},
	input: {
		padding: 15,
		borderRadius: 12,
		borderWidth: 1,
		fontSize: 16,
	},
	button: {
		padding: 15,
		borderRadius: 12,
		alignItems: "center",
		marginTop: 20,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "600",
	},
	cancelButton: {
		padding: 15,
		borderRadius: 12,
		alignItems: "center",
		marginTop: 10,
	},
	cancelButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
});

export default PersonalInformationScreen;
