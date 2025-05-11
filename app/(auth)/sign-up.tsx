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

const SignUpScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const { registerUser, error, clearError } = useAuthStore();

	const [name, setName] = useState("");
	const [age, setAge] = useState("");
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [primaryAddress, setPrimaryAddress] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [isLoading, setIsLoading] = useState(false);

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!name.trim()) {
			newErrors.name = "Name is required";
		} else if (name.length > 50) {
			newErrors.name = "Name must be less than 50 characters";
		}

		if (!age.trim()) {
			newErrors.age = "Age is required";
		} else if (isNaN(Number(age)) || Number(age) <= 0) {
			newErrors.age = "Please enter a valid age";
		}

		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = "Please enter a valid email";
		}

		if (!phoneNumber.trim()) {
			newErrors.phoneNumber = "Phone number is required";
		} else if (!/^\d{10}$/.test(phoneNumber)) {
			newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
		}

		if (!primaryAddress.trim()) {
			newErrors.primaryAddress = "Primary address is required";
		}

		if (!password.trim()) {
			newErrors.password = "Password is required";
		} else if (password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		} else if (!/[A-Z]/.test(password)) {
			newErrors.password = "Password must contain at least one uppercase letter";
		} else if (!/[a-z]/.test(password)) {
			newErrors.password = "Password must contain at least one lowercase letter";
		} else if (!/[0-9]/.test(password)) {
			newErrors.password = "Password must contain at least one number";
		} else if (!/[^A-Za-z0-9]/.test(password)) {
			newErrors.password = "Password must contain at least one special character";
		}

		if (!confirmPassword.trim()) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (password !== confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setIsLoading(true);
		clearError();

		try {
			await registerUser({
				name,
				age: Number(age),
				email,
				phoneNumber: Number(phoneNumber),
				primaryAddress,
				password,
			});

			Alert.alert("Success", "Registration successful! Please verify your email to continue.", [
				{
					text: "OK",
					onPress: () => router.replace("/sign-in"),
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
								value={name}
								onChangeText={setName}
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
								value={age}
								onChangeText={setAge}
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
								value={email}
								onChangeText={setEmail}
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
								value={primaryAddress}
								onChangeText={setPrimaryAddress}
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
								value={confirmPassword}
								onChangeText={setConfirmPassword}
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

					{errors.submit && (
						<Text style={[styles.errorText, { color: theme.error, textAlign: "center" }]}>{errors.submit}</Text>
					)}

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
		top: 15,
		left: 15,
		zIndex: 10,
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
		alignItems: "center",
	},
	footerRow: {
		flexDirection: "row",
		marginTop: 10,
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
});

export default SignUpScreen;
