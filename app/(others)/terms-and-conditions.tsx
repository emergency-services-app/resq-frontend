import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const TermsAndConditionsScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;

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
					<Text style={[styles.sectionTitle, { color: theme.text }]}>1. Acceptance of Terms</Text>
					<Text style={[styles.paragraph, { color: theme.textSecondary }]}>
						By accessing and using the Pahilo Uddhar application, you accept and agree to be bound by the terms and
						provision of this agreement.
					</Text>

					<Text style={[styles.sectionTitle, { color: theme.text }]}>2. Emergency Services</Text>
					<Text style={[styles.paragraph, { color: theme.textSecondary }]}>
						The application provides emergency response services. Users acknowledge that response times may vary based
						on location, traffic, and other factors beyond our control.
					</Text>

					<Text style={[styles.sectionTitle, { color: theme.text }]}>3. User Responsibilities</Text>
					<Text style={[styles.paragraph, { color: theme.textSecondary }]}>
						Users must provide accurate information and use the service responsibly. False emergency reports may result
						in legal consequences.
					</Text>

					<Text style={[styles.sectionTitle, { color: theme.text }]}>4. Privacy Policy</Text>
					<Text style={[styles.paragraph, { color: theme.textSecondary }]}>
						We collect and process personal data in accordance with our Privacy Policy. By using the app, you consent to
						such processing.
					</Text>

					<Text style={[styles.sectionTitle, { color: theme.text }]}>5. Limitation of Liability</Text>
					<Text style={[styles.paragraph, { color: theme.textSecondary }]}>
						Pahilo Uddhar is not liable for any direct, indirect, incidental, or consequential damages resulting from
						the use of our services.
					</Text>

					<Text style={[styles.sectionTitle, { color: theme.text }]}>6. Changes to Terms</Text>
					<Text style={[styles.paragraph, { color: theme.textSecondary }]}>
						We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes
						acceptance of the new terms.
					</Text>

					<Text style={[styles.sectionTitle, { color: theme.text }]}>7. Contact Information</Text>
					<Text style={[styles.paragraph, { color: theme.textSecondary }]}>
						For any questions regarding these terms, please contact us at support@pahilouddhar.com
					</Text>
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
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 20,
		marginBottom: 10,
	},
	paragraph: {
		fontSize: 16,
		lineHeight: 24,
		marginBottom: 15,
	},
});

export default TermsAndConditionsScreen;
