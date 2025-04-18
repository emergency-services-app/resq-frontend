import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/FontAwesome";
import { useThemeStore } from "../../store/themeStore";
import { lightTheme, darkTheme } from "../../constants/theme";
import { registerServiceProvider } from "../../services/api/serviceProvider";

const ServiceProviderSignupScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phoneNumber: "",
		password: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
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

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		try {
			const { confirmPassword, ...registrationData } = formData;
			await registerServiceProvider(registrationData);
			router.push("/verify-service-provider");
		} catch (error) {
			console.error("Registration error:", error);
			setErrors({
				submit: "Registration failed. Please try again.",
			});
		}
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
					<Text style={[styles.headerText, { color: theme.text }]}>Service Provider Registration</Text>
					<Text style={[styles.headerSubtext, { color: theme.textSecondary }]}>
						Create your service provider account
					</Text>
				</LinearGradient>

				<View style={styles.formContainer}>
					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: theme.text }]}>Name</Text>
						<View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
							<Icon
								name="user"
								size={20}
								color={theme.textSecondary}
								style={styles.inputIcon}
							/>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="Enter your name"
								placeholderTextColor={theme.textSecondary}
								value={formData.name}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
							/>
						</View>
						{errors.name && <Text style={[styles.errorText, { color: theme.error }]}>{errors.name}</Text>}
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
								onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
								keyboardType="email-address"
								autoCapitalize="none"
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
								onChangeText={(text) => setFormData((prev) => ({ ...prev, phoneNumber: text }))}
								keyboardType="phone-pad"
								maxLength={10}
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
								value={formData.password}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, password: text }))}
								secureTextEntry
							/>
						</View>
						{errors.password && <Text style={[styles.errorText, { color: theme.error }]}>{errors.password}</Text>}
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
								onChangeText={(text) => setFormData((prev) => ({ ...prev, confirmPassword: text }))}
								secureTextEntry
							/>
						</View>
						{errors.confirmPassword && (
							<Text style={[styles.errorText, { color: theme.error }]}>{errors.confirmPassword}</Text>
						)}
					</View>

					{errors.submit && (
						<Text style={[styles.errorText, { color: theme.error, textAlign: "center" }]}>{errors.submit}</Text>
					)}

					<TouchableOpacity
						style={[styles.submitButton, { backgroundColor: theme.primary }]}
						onPress={handleSubmit}
					>
						<Text style={styles.submitButtonText}>Register</Text>
					</TouchableOpacity>

					<View style={styles.footer}>
						<View style={styles.footerRow}>
							<Text style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account? </Text>
							<TouchableOpacity onPress={() => router.push("/sign-in")}>
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
	},
	footerText: {
		fontSize: 14,
	},
});

export default ServiceProviderSignupScreen;
