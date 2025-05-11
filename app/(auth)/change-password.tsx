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
import Icon from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { authApi } from "@/services/api/auth";

const ChangePasswordScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;

	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const validateForm = () => {
		const newErrors = {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		};

		if (!formData.currentPassword) {
			newErrors.currentPassword = "Current password is required";
		}

		if (!formData.newPassword) {
			newErrors.newPassword = "New password is required";
		} else if (formData.newPassword.length < 8) {
			newErrors.newPassword = "Password must be at least 8 characters";
		} else if (!/[A-Z]/.test(formData.newPassword)) {
			newErrors.newPassword = "Password must contain at least one uppercase letter";
		} else if (!/[a-z]/.test(formData.newPassword)) {
			newErrors.newPassword = "Password must contain at least one lowercase letter";
		} else if (!/[0-9]/.test(formData.newPassword)) {
			newErrors.newPassword = "Password must contain at least one number";
		} else if (!/[^A-Za-z0-9]/.test(formData.newPassword)) {
			newErrors.newPassword = "Password must contain at least one special character";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your new password";
		} else if (formData.newPassword !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return !Object.values(newErrors).some((error) => error);
	};

	const handleChangePassword = async () => {
		if (!validateForm()) return;

		try {
			setIsLoading(true);
			await authApi.changePassword({
				oldPassword: formData.currentPassword,
				newPassword: formData.newPassword,
			});
			Alert.alert("Success", "Password changed successfully", [{ text: "OK", onPress: () => router.back() }]);
		} catch (error) {
			Alert.alert("Error", "Failed to change password. Please try again.");
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
							<Text style={[styles.headerText, { color: theme.text }]}>Change Password</Text>
						</View>
					</View>
				</LinearGradient>

				<View style={styles.content}>
					<View style={styles.formContainer}>
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.textSecondary }]}>Current Password</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: theme.surface,
										color: theme.text,
										borderColor: errors.currentPassword ? theme.error : theme.border,
									},
								]}
								value={formData.currentPassword}
								onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
								placeholder="Enter your current password"
								placeholderTextColor={theme.textSecondary}
								secureTextEntry
							/>
							{errors.currentPassword ? (
								<Text style={[styles.errorText, { color: theme.error }]}>{errors.currentPassword}</Text>
							) : null}
						</View>

						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>New Password</Text>
							<View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
								<Icon
									name="lock"
									size={20}
									color={theme.textSecondary}
									style={styles.inputIcon}
								/>
								<TextInput
									style={[styles.input, { color: theme.text }]}
									placeholder="Enter new password"
									placeholderTextColor={theme.textSecondary}
									value={formData.newPassword}
									onChangeText={(text) => setFormData((prev) => ({ ...prev, newPassword: text }))}
									secureTextEntry
								/>
							</View>
							{errors.newPassword && (
								<Text style={[styles.errorText, { color: theme.error }]}>{errors.newPassword}</Text>
							)}
							<View style={styles.passwordRequirements}>
								<Text style={[styles.requirementText, { color: theme.textSecondary }]}>Password must contain:</Text>
								<Text style={[styles.requirementItem, { color: theme.textSecondary }]}>• At least 8 characters</Text>
								<Text style={[styles.requirementItem, { color: theme.textSecondary }]}>
									• At least one uppercase letter
								</Text>
								<Text style={[styles.requirementItem, { color: theme.textSecondary }]}>
									• At least one lowercase letter
								</Text>
								<Text style={[styles.requirementItem, { color: theme.textSecondary }]}>• At least one number</Text>
								<Text style={[styles.requirementItem, { color: theme.textSecondary }]}>
									• At least one special character
								</Text>
							</View>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: theme.textSecondary }]}>Confirm New Password</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: theme.surface,
										color: theme.text,
										borderColor: errors.confirmPassword ? theme.error : theme.border,
									},
								]}
								value={formData.confirmPassword}
								onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
								placeholder="Confirm your new password"
								placeholderTextColor={theme.textSecondary}
								secureTextEntry
							/>
							{errors.confirmPassword ? (
								<Text style={[styles.errorText, { color: theme.error }]}>{errors.confirmPassword}</Text>
							) : null}
						</View>

						<TouchableOpacity
							style={[styles.button, { backgroundColor: theme.primary }]}
							onPress={handleChangePassword}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={[styles.buttonText, { color: "#fff" }]}>Change Password</Text>
							)}
						</TouchableOpacity>
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
	errorText: {
		fontSize: 12,
		marginTop: 4,
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
	inputContainer: {
		gap: 8,
	},
	inputWrapper: {
		padding: 15,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "white",
		flexDirection: "row",
		alignItems: "center",
	},
	inputIcon: {
		marginRight: 15,
	},
	passwordRequirements: {
		marginTop: 8,
		paddingHorizontal: 4,
	},
	requirementText: {
		fontSize: 12,
		marginBottom: 4,
	},
	requirementItem: {
		fontSize: 12,
		marginLeft: 8,
		marginBottom: 2,
	},
});

export default ChangePasswordScreen;
