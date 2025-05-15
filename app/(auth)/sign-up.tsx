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
import { useSignUpStore } from "../../store/signupStore";
import Checkbox from "expo-checkbox";

const SignUpScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const { registerUser, error, clearError } = useAuthStore();
	const { formData, setFormData, resetForm } = useSignUpStore();

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [isLoading, setIsLoading] = useState(false);

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		} else if (formData.name.length > 50) {
			newErrors.name = "Name must be less than 50 characters";
		}

		if (!formData.age.trim()) {
			newErrors.age = "Age is required";
		} else if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
			newErrors.age = "Please enter a valid age";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Please enter a valid email";
		}

		if (!formData.phoneNumber.trim()) {
			newErrors.phoneNumber = "Phone number is required";
		} else if (!/^\d{10}$/.test(formData.phoneNumber)) {
			newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
		}

		if (!formData.primaryAddress.trim()) {
			newErrors.primaryAddress = "Primary address is required";
		}

		if (!formData.password.trim()) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		} else if (!/[A-Z]/.test(formData.password)) {
			newErrors.password = "Password must contain at least one uppercase letter";
		} else if (!/[a-z]/.test(formData.password)) {
			newErrors.password = "Password must contain at least one lowercase letter";
		} else if (!/[0-9]/.test(formData.password)) {
			newErrors.password = "Password must contain at least one number";
		} else if (!/[^A-Za-z0-9]/.test(formData.password)) {
			newErrors.password = "Password must contain at least one special character";
		}

		if (!formData.confirmPassword.trim()) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (!formData.acceptedTerms) {
			newErrors.terms = "You must accept the terms and conditions";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setIsLoading(true);
		clearError();

		try {
			const response = await registerUser({
				name: formData.name,
				age: Number(formData.age),
				email: formData.email,
				phoneNumber: Number(formData.phoneNumber),
				primaryAddress: formData.primaryAddress,
				password: formData.password,
			});

			console.log("LOGIN RESPONSE", response);

			Alert.alert("Success", "Registration successful! Please verify your email to continue.", [
				{
					text: "OK",
					onPress: () => {
						resetForm();
						router.replace({
							pathname: "/otp-screen",
						});
					},
				},
			]);
		} catch (error: any) {
			console.error("Registration error:", error);
			Alert.alert("Error", error?.message || "Registration failed. Please try again.", [{ text: "OK" }]);
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
			<ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
				>
					<Icon
						name="arrow-left"
						size={24}
						color={theme.text}
					/>
				</TouchableOpacity>

				<LinearGradient
					colors={[theme.background, theme.surface]}
					style={styles.header}
				>
					<Text style={[styles.headerText, { color: theme.text }]}>Create Account</Text>
					<Text style={[styles.headerSubtext, { color: theme.textSecondary }]}>Sign up to get started</Text>
				</LinearGradient>

				<View style={styles.formContainer}>
					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
						<View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
							<Icon
								name="user"
								size={20}
								color={theme.textSecondary}
								style={styles.inputIcon}
							/>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="Enter your full name"
								placeholderTextColor={theme.textSecondary}
								value={formData.name}
								onChangeText={(text) => setFormData({ name: text })}
								maxLength={50}
								editable={!isLoading}
							/>
						</View>
						{errors.name && <Text style={[styles.errorText, { color: theme.error }]}>{errors.name}</Text>}
					</View>

					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: theme.text }]}>Age</Text>
						<View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
							<Icon
								name="calendar"
								size={20}
								color={theme.textSecondary}
								style={styles.inputIcon}
							/>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="Enter your age"
								placeholderTextColor={theme.textSecondary}
								value={formData.age}
								onChangeText={(text) => setFormData({ age: text })}
								keyboardType="number-pad"
								editable={!isLoading}
							/>
						</View>
						{errors.age && <Text style={[styles.errorText, { color: theme.error }]}>{errors.age}</Text>}
					</View>

					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: theme.text }]}>Email</Text>
						<View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
							<Icon
								name="envelope"
								size={20}
								color={theme.textSecondary}
								style={styles.inputIcon}
							/>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="Enter your email"
								placeholderTextColor={theme.textSecondary}
								value={formData.email}
								onChangeText={(text) => setFormData({ email: text })}
								keyboardType="email-address"
								autoCapitalize="none"
								editable={!isLoading}
							/>
						</View>
						{errors.email && <Text style={[styles.errorText, { color: theme.error }]}>{errors.email}</Text>}
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
								value={formData.phoneNumber}
								onChangeText={(text) => setFormData({ phoneNumber: text })}
								keyboardType="phone-pad"
								maxLength={10}
								editable={!isLoading}
							/>
						</View>
						{errors.phoneNumber && <Text style={[styles.errorText, { color: theme.error }]}>{errors.phoneNumber}</Text>}
					</View>

					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: theme.text }]}>Primary Address</Text>
						<View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
							<Icon
								name="map-marker"
								size={20}
								color={theme.textSecondary}
								style={styles.inputIcon}
							/>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="Enter your primary address"
								placeholderTextColor={theme.textSecondary}
								value={formData.primaryAddress}
								onChangeText={(text) => setFormData({ primaryAddress: text })}
								editable={!isLoading}
							/>
						</View>
						{errors.primaryAddress && (
							<Text style={[styles.errorText, { color: theme.error }]}>{errors.primaryAddress}</Text>
						)}
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
								value={formData.password}
								onChangeText={(text) => setFormData({ password: text })}
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

					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
						<View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
							<Icon
								name="lock"
								size={20}
								color={theme.textSecondary}
								style={styles.inputIcon}
							/>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="Confirm password"
								placeholderTextColor={theme.textSecondary}
								value={formData.confirmPassword}
								onChangeText={(text) => setFormData({ confirmPassword: text })}
								secureTextEntry={!showConfirmPassword}
								editable={!isLoading}
							/>
							<TouchableOpacity
								onPress={() => setShowConfirmPassword(!showConfirmPassword)}
								style={styles.eyeIcon}
								disabled={isLoading}
							>
								<Icon
									name={showConfirmPassword ? "eye" : "eye-slash"}
									size={20}
									color={theme.textSecondary}
								/>
							</TouchableOpacity>
						</View>
						{errors.confirmPassword && (
							<Text style={[styles.errorText, { color: theme.error }]}>{errors.confirmPassword}</Text>
						)}
					</View>

					<View style={styles.termsContainer}>
						<Checkbox
							value={formData.acceptedTerms}
							onValueChange={(value) => setFormData({ acceptedTerms: value })}
							color={formData.acceptedTerms ? theme.primary : undefined}
							disabled={isLoading}
						/>
						<View style={styles.termsTextContainer}>
							<Text style={[styles.termsText, { color: theme.text }]}>
								I agree to the{" "}
								<Text
									style={[styles.termsLink, { color: theme.primary }]}
									onPress={() => router.push("/(others)/terms-and-conditions")}
								>
									Terms and Conditions
								</Text>
							</Text>
						</View>
					</View>
					{errors.terms && <Text style={[styles.errorText, { color: theme.error }]}>{errors.terms}</Text>}

					<TouchableOpacity
						style={[styles.submitButton, { backgroundColor: theme.primary }, isLoading && styles.buttonDisabled]}
						onPress={handleSubmit}
						disabled={isLoading}
					>
						{isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Sign Up</Text>}
					</TouchableOpacity>

					<View style={styles.footer}>
						<View style={styles.footerRow}>
							<Text style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account? </Text>
							<TouchableOpacity
								onPress={() => router.push("/sign-in")}
								disabled={isLoading}
							>
								<Text style={[styles.footerText, { color: theme.primary }]}>Sign In</Text>
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
	backButton: {
		position: "absolute",
		top: 40,
		left: 20,
		zIndex: 1,
		padding: 10,
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
	},
	footerRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	footerText: {
		fontSize: 14,
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
	termsContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
		marginTop: 10,
	},
	termsTextContainer: {
		flex: 1,
		marginLeft: 10,
	},
	termsText: {
		fontSize: 14,
	},
	termsLink: {
		textDecorationLine: "underline",
	},
});

export default SignUpScreen;
