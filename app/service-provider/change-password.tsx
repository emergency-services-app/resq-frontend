import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	StatusBar,
	TouchableOpacity,
	TextInput,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { changeProviderPassword } from "@/services/api/service-provider";

const ChangePasswordScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleChangePassword = async () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		if (newPassword !== confirmPassword) {
			Alert.alert("Error", "New passwords do not match");
			return;
		}

		try {
			setIsLoading(true);
			await changeProviderPassword({
				oldPassword: currentPassword,
				newPassword,
			});
			Alert.alert("Success", "Password updated successfully");
			router.back();
		} catch (error) {
			Alert.alert("Error", "Failed to update password");
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
						<Text style={[styles.headerText, { color: theme.text }]}>Change Password</Text>
					</View>
				</LinearGradient>

				<View style={styles.content}>
					<View style={[styles.formGroup, { backgroundColor: theme.surface }]}>
						<Text style={[styles.label, { color: theme.textSecondary }]}>Current Password</Text>
						<TextInput
							style={[styles.input, { color: theme.text, borderColor: theme.border }]}
							value={currentPassword}
							onChangeText={setCurrentPassword}
							secureTextEntry
							placeholder="Enter current password"
							placeholderTextColor={theme.textSecondary}
						/>
					</View>

					<View style={[styles.formGroup, { backgroundColor: theme.surface }]}>
						<Text style={[styles.label, { color: theme.textSecondary }]}>New Password</Text>
						<TextInput
							style={[styles.input, { color: theme.text, borderColor: theme.border }]}
							value={newPassword}
							onChangeText={setNewPassword}
							secureTextEntry
							placeholder="Enter new password"
							placeholderTextColor={theme.textSecondary}
						/>
					</View>

					<View style={[styles.formGroup, { backgroundColor: theme.surface }]}>
						<Text style={[styles.label, { color: theme.textSecondary }]}>Confirm New Password</Text>
						<TextInput
							style={[styles.input, { color: theme.text, borderColor: theme.border }]}
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							secureTextEntry
							placeholder="Confirm new password"
							placeholderTextColor={theme.textSecondary}
						/>
					</View>

					<TouchableOpacity
						style={[styles.button, { backgroundColor: theme.primary }]}
						onPress={handleChangePassword}
						disabled={isLoading}
					>
						<Text style={styles.buttonText}>{isLoading ? "Updating..." : "Update Password"}</Text>
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
	formGroup: {
		marginBottom: 20,
		padding: 15,
		borderRadius: 10,
	},
	label: {
		fontSize: 16,
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
	},
	button: {
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 20,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default ChangePasswordScreen;
