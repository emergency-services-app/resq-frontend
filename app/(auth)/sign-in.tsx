import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	ScrollView,
	SafeAreaView,
	StatusBar,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/FontAwesome";
import { useThemeStore } from "../../store/themeStore";
import { lightTheme, darkTheme } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";

const SignInScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const { loginUser, loginServiceProvider, forgotPassword, error, clearError } = useAuthStore();

	const [isServiceProvider, setIsServiceProvider] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [isLoading, setIsLoading] = useState(false);

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!phoneNumber.trim()) {
			newErrors.phoneNumber = "Phone number is required";
		} else if (!/^\d{10}$/.test(phoneNumber)) {
			newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
		}

		if (!password.trim()) {
			newErrors.password = "Password is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setIsLoading(true);
		clearError();

		try {
			if (isServiceProvider) {
				console.log("Attempting service provider login...");
				await loginServiceProvider(Number(phoneNumber), password);
			} else {
				console.log("Attempting user login...");
				await loginUser(Number(phoneNumber), password);
			}

			console.log("Login successful, navigating to home...");
		} catch (error: any) {
			console.error("Login error details:", {
				message: error?.message,
				response: error?.response?.data,
				status: error?.response?.status,
			});
			Alert.alert("Error", error?.response?.message || "Login failed. Please check your credentials and try again.", [
				{ text: "OK" },
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleForgotPassword = async () => {
		if (!phoneNumber.trim()) {
			Alert.alert("Error", "Please enter your phone number first", [{ text: "OK" }]);
			return;
		}

		setIsLoading(true);
		clearError();

		router.push({
			pathname: "/forgot-password",
			params: { phoneNumber, isForgotPassword: "true" },
		});
	};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
				backgroundColor={theme.background}
			/>
			<ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
				<LinearGradient
					colors={[theme.background, theme.surface]}
					style={styles.header}
				>
					<Text style={[styles.headerText, { color: theme.text }]}>Welcome Back</Text>
					<Text style={[styles.headerSubtext, { color: theme.textSecondary }]}>Sign in to continue</Text>
				</LinearGradient>

				<View style={styles.formContainer}>
					<View style={styles.toggleContainer}>
						<TouchableOpacity
							style={[styles.toggleButton, !isServiceProvider && { backgroundColor: theme.primary }]}
							onPress={() => setIsServiceProvider(false)}
							disabled={isLoading}
						>
							<Text style={[styles.toggleButtonText, !isServiceProvider && { color: "#fff" }]}>User</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.toggleButton, isServiceProvider && { backgroundColor: theme.primary }]}
							onPress={() => setIsServiceProvider(true)}
							disabled={isLoading}
						>
							<Text style={[styles.toggleButtonText, isServiceProvider && { color: "#fff" }]}>Service Provider</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
						<View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
							<Icon
								name="phone"
								size={20}
								color={theme.textSecondary}
								style={styles.inputIcon}
							/>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="Enter phone number"
								placeholderTextColor={theme.textSecondary}
								value={phoneNumber}
								onChangeText={setPhoneNumber}
								keyboardType="phone-pad"
								maxLength={10}
								editable={!isLoading}
							/>
						</View>
						{errors.phoneNumber && <Text style={[styles.errorText, { color: theme.error }]}>{errors.phoneNumber}</Text>}
					</View>

					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: theme.text }]}>Password</Text>
						<View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
							<Icon
								name="lock"
								size={20}
								color={theme.textSecondary}
								style={styles.inputIcon}
							/>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="Enter password"
								placeholderTextColor={theme.textSecondary}
								value={password}
								onChangeText={setPassword}
								secureTextEntry={!showPassword}
								editable={!isLoading}
							/>
							<TouchableOpacity
								onPress={() => setShowPassword(!showPassword)}
								style={styles.eyeIcon}
								disabled={isLoading}
							>
								<Icon
									name={showPassword ? "eye" : "eye-slash"}
									size={20}
									color={theme.textSecondary}
								/>
							</TouchableOpacity>
						</View>
						{errors.password && <Text style={[styles.errorText, { color: theme.error }]}>{errors.password}</Text>}
					</View>

					<TouchableOpacity
						style={[styles.forgotPasswordButton, isLoading && styles.buttonDisabled]}
						onPress={handleForgotPassword}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color={theme.primary} />
						) : (
							<Text style={[styles.forgotPasswordText, { color: theme.primary }]}>Forgot Password?</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.submitButton, { backgroundColor: theme.primary }, isLoading && styles.buttonDisabled]}
						onPress={handleSubmit}
						disabled={isLoading}
					>
						{isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Sign In</Text>}
					</TouchableOpacity>

					<View style={styles.footer}>
						<View style={styles.footerRow}>
							<Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
							<TouchableOpacity
								onPress={() => router.push(isServiceProvider ? "/service-provider-signup" : "/sign-up")}
								disabled={isLoading}
							>
								<Text style={[styles.footerText, { color: theme.primary }]}>Sign Up</Text>
							</TouchableOpacity>
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
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
	},
	headerSubtext: {
		fontSize: 14,
		textAlign: "center",
		marginTop: 5,
	},
	formContainer: {
		padding: 20,
	},
	toggleContainer: {
		flexDirection: "row",
		marginBottom: 20,
		borderRadius: 12,
		overflow: "hidden",
		backgroundColor: "#f0f0f0",
	},
	toggleButton: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
	},
	toggleButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#666",
	},
	inputContainer: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 12,
		paddingHorizontal: 15,
		height: 50,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	inputIcon: {
		marginRight: 10,
	},
	eyeIcon: {
		marginLeft: 10,
	},
	input: {
		flex: 1,
		fontSize: 16,
	},
	errorText: {
		fontSize: 12,
		marginTop: 4,
	},
	forgotPasswordButton: {
		alignSelf: "flex-end",
		marginBottom: 20,
	},
	forgotPasswordText: {
		fontSize: 14,
		fontWeight: "600",
	},
	submitButton: {
		height: 50,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 20,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	submitButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	footer: {
		marginTop: 20,
		alignItems: "center",
	},
	footerRow: {
		flexDirection: "row",
		marginTop: 10,
	},
	footerText: {
		fontSize: 14,
	},
});

export default SignInScreen;
