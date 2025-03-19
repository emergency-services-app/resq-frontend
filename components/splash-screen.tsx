import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

const GetStartedScreen = () => {
	return (
		<View style={styles.container}>
			<Image
				source={require("@/assets/images/logo.png")}
				style={styles.logo}
			/>
			<Text style={styles.title}>FirstResQ</Text>
			<Text style={styles.subtitle}>YOUR EMERGENCY PARTNER</Text>

			<Text style={styles.tagline}>
				Every Second Counts.{" "}
				<Text style={styles.highlightedText}>We're Just A Tap Away.</Text>
			</Text>

			<Text style={styles.description}>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
				vulputate ex sem. Nullam orci nibh, imperdiet at erat et, egestas
				placerat massa.
			</Text>

			<TouchableOpacity
				style={styles.button}
				onPress={() => console.log("Button pressed")}
			>
				<Text style={styles.buttonText}>Let's Get Started</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
		paddingHorizontal: 20,
	},
	logo: {
		width: 100,
		height: 100,
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 5,
	},
	subtitle: {
		fontSize: 16,
		marginBottom: 20,
	},
	tagline: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "center",
	},
	highlightedText: {
		color: "#f44336",
	},
	description: {
		fontSize: 14,
		color: "#555",
		textAlign: "center",
		marginBottom: 30,
	},
	button: {
		backgroundColor: "#f44336",
		paddingVertical: 15,
		paddingHorizontal: 30,
		borderRadius: 30,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
});

export default GetStartedScreen;
