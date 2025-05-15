import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const TermsAndConditionsScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;

	const terms = [
		{
			title: "1. Service Provider Responsibilities",
			content:
				"As a service provider, you are responsible for maintaining accurate information about your vehicle, service area, and availability status. You must respond promptly to emergency requests and maintain professional conduct at all times.",
		},
		{
			title: "2. Emergency Response Protocol",
			content:
				"When responding to emergencies, you must follow the established protocols and guidelines. This includes maintaining communication with the emergency response center and updating your status regularly.",
		},
		{
			title: "3. Vehicle Requirements",
			content:
				"Your vehicle must meet all safety and regulatory requirements. Regular maintenance checks are mandatory, and you must ensure your vehicle is in optimal condition for emergency response.",
		},
		{
			title: "4. Location Services",
			content:
				"You must keep your location services enabled while on duty. This allows the system to accurately track your position and assign you to the nearest emergency.",
		},
		{
			title: "5. Privacy and Data Protection",
			content:
				"You must respect the privacy of users and maintain confidentiality of all information received during emergency responses. Unauthorized sharing of information is strictly prohibited.",
		},
		{
			title: "6. Code of Conduct",
			content:
				"Maintain professional behavior at all times. Discrimination, harassment, or any form of misconduct will result in immediate suspension of your service provider account.",
		},
		{
			title: "7. Service Availability",
			content:
				"You must accurately update your availability status. False availability status may result in penalties or account suspension.",
		},
		{
			title: "8. Emergency Response Time",
			content:
				"You are expected to respond to emergency requests within the specified time frame. Regular delays or unresponsiveness may affect your service provider rating.",
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
							<Text style={[styles.headerText, { color: theme.text }]}>Terms & Conditions</Text>
						</View>
					</View>
				</LinearGradient>

				<View style={styles.content}>
					{terms.map((term, index) => (
						<View
							key={index}
							style={[styles.termSection, { backgroundColor: theme.surface }]}
						>
							<Text style={[styles.termTitle, { color: theme.text }]}>{term.title}</Text>
							<Text style={[styles.termContent, { color: theme.textSecondary }]}>{term.content}</Text>
						</View>
					))}
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
	logo: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	textContainer: {
		marginLeft: 15,
		flex: 1,
	},
	termSection: {
		marginBottom: 20,
		padding: 15,
		borderRadius: 10,
	},
	termTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 10,
	},
	termContent: {
		fontSize: 14,
		lineHeight: 20,
	},
});

export default TermsAndConditionsScreen;
