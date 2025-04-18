import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "@expo/vector-icons/FontAwesome";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { requestHandler } from "@/lib/utils";
import { authApi } from "@/services/api/auth";

const ForgotPasswordScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const { phoneNumber: phoneNumberParam, isForgotPassword } = useLocalSearchParams();

	const [phoneNumber, setPhoneNumber] = useState(phoneNumberParam as string);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSendOtp = async () => {
		try {
			setError(null);
			setIsLoading(true);

			if (!phoneNumber) {
				setError("Please enter your phone number");
				return;
			}

			await requestHandler(
				async () => await authApi.forgotPassword({ phoneNumber }),
				() => setIsLoading(true),
				(response) => {
					console.log("Response:", response);
					Alert.alert("Success", "Password reset instructions have been sent to your phone number", [{ text: "OK" }]);
					router.push({
						pathname: "/(auth)/otp-screen",
						params: {
							otpToken: response.data.otpToken,
							userId: response.data.userId,
							isForgotPassword: "true",
						},
					});
				},
				(err) => {
					console.log("Error sending OTP:", err);
					setError("Failed to send OTP. Please try again.");
				}
			);
		} catch (error) {
			console.log("Error sending OTP:", error);
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
			<View style={styles.content}>
				<View style={styles.header}>
					<Text style={[styles.title, { color: theme.text }]}>Forgot Password</Text>
					<Text style={[styles.subtitle, { color: theme.textSecondary }]}>
						Enter your phone number to reset your password
					</Text>
				</View>

				<View style={styles.form}>
					<View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
						<Icon
							name="phone"
							size={20}
							color={theme.primary}
							style={styles.inputIcon}
						/>
						<TextInput
							style={[styles.input, { color: theme.text }]}
							placeholder="Phone Number"
							placeholderTextColor={theme.textSecondary}
							value={phoneNumber}
							onChangeText={setPhoneNumber}
							keyboardType="phone-pad"
							autoCapitalize="none"
						/>
					</View>

					{error && (
						<View style={[styles.errorContainer, { backgroundColor: theme.error + "20" }]}>
							<Icon
								name="exclamation-circle"
								size={16}
								color={theme.error}
							/>
							<Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
						</View>
					)}

					<TouchableOpacity
						style={[styles.button, { backgroundColor: theme.primary }, isLoading ? styles.buttonDisabled : null]}
						onPress={handleSendOtp}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator
								size="small"
								color="#fff"
							/>
						) : (
							<Text style={styles.buttonText}>Send OTP</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.backButton}
						onPress={() => router.back()}
					>
						<Text style={[styles.backButtonText, { color: theme.primary }]}>Back to Login</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		padding: 20,
		justifyContent: "center",
	},
	header: {
		marginBottom: 40,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
	},
	form: {
		gap: 16,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderRadius: 12,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	inputIcon: {
		marginRight: 12,
	},
	input: {
		flex: 1,
		fontSize: 16,
	},
	errorContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 8,
	},
	errorText: {
		marginLeft: 8,
		fontSize: 14,
	},
	button: {
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	backButton: {
		alignItems: "center",
		marginTop: 16,
	},
	backButtonText: {
		fontSize: 16,
		fontWeight: "500",
	},
});

export default ForgotPasswordScreen;
