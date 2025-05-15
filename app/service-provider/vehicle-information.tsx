import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";

const VehicleInformationScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const user = useAuthStore((state) => state.serviceProvider);

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
						<Text style={[styles.headerText, { color: theme.text }]}>Vehicle Information</Text>
					</View>
				</LinearGradient>

				<View style={styles.content}>
					<View style={[styles.formGroup, { backgroundColor: theme.surface }]}>
						<Text style={[styles.label, { color: theme.textSecondary }]}>Vehicle Type</Text>
						<TextInput
							style={[styles.input, { color: theme.text, borderColor: theme.border }]}
							value={user?.vehicleInformation.type}
							editable={false}
						/>
					</View>

					<View style={[styles.formGroup, { backgroundColor: theme.surface }]}>
						<Text style={[styles.label, { color: theme.textSecondary }]}>Vehicle Number</Text>
						<TextInput
							style={[styles.input, { color: theme.text, borderColor: theme.border }]}
							value={user?.vehicleInformation.number}
							editable={false}
						/>
					</View>

					<View style={[styles.formGroup, { backgroundColor: theme.surface }]}>
						<Text style={[styles.label, { color: theme.textSecondary }]}>Vehicle Model</Text>
						<TextInput
							style={[styles.input, { color: theme.text, borderColor: theme.border }]}
							value={user?.vehicleInformation.model}
							editable={false}
						/>
					</View>

					<View style={[styles.formGroup, { backgroundColor: theme.surface }]}>
						<Text style={[styles.label, { color: theme.textSecondary }]}>Vehicle Color</Text>
						<TextInput
							style={[styles.input, { color: theme.text, borderColor: theme.border }]}
							value={user?.vehicleInformation.color}
							editable={false}
						/>
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
});

export default VehicleInformationScreen;
