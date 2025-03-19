import { useAuth } from "@/context/authContext";
import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
	Image,
	ScrollView,
} from "react-native";

export default function RegisterScreen() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [age, setAge] = useState("");
	const [phone, setPhone] = useState("");
	const [primaryAddress, setPrimaryAddress] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isChecked, setIsChecked] = useState(false);
	const auth = useAuth();

	const handleRegister = () => {
		if (auth.registerAction) {
			auth.registerAction({
				name,
				email,
				age: Number(age),
				phoneNumber: phone,
				primaryAddress,
				password,
			});
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Image
				source={require("@/assets/images/logo.png")}
				style={styles.logo}
			/>
			{/* <Text style={styles.title}>FirstResQ</Text>
			<Text style={styles.subtitle}>YOUR EMERGENCY PARTNER</Text> */}

			<Text style={styles.heading}>Register</Text>
			<Text style={styles.subHeading}>Enter your details to register</Text>

			<TextInput
				style={styles.input}
				placeholder="Name"
				value={name}
				onChangeText={setName}
			/>
			<TextInput
				style={styles.input}
				placeholder="Email Address"
				keyboardType="email-address"
				value={email}
				onChangeText={setEmail}
			/>
			<TextInput
				style={styles.input}
				placeholder="Phone Number"
				keyboardType="phone-pad"
				value={phone}
				onChangeText={setPhone}
			/>
			<TextInput
				style={styles.input}
				placeholder="Password"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>
			<TextInput
				style={styles.input}
				placeholder="Confirm Password"
				secureTextEntry
				value={confirmPassword}
				onChangeText={setConfirmPassword}
			/>

			<View style={styles.checkboxContainer}>
				{/* <CheckBox
					value={isChecked}
					onValueChange={setIsChecked}
					style={styles.checkbox}
				/> */}
				<Text style={styles.checkboxLabel}>
					I Agree With The Terms And Conditions
				</Text>
			</View>

			<TouchableOpacity
				style={styles.button}
				onPress={handleRegister}
			>
				<Text style={styles.buttonText}>Next</Text>
			</TouchableOpacity>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 20,
	},
	logo: {
		width: 100,
		height: 100,
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 5,
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 20,
	},
	heading: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "center",
	},
	subHeading: {
		fontSize: 16,
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		width: "100%",
		height: 50,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 10,
		paddingHorizontal: 10,
		marginBottom: 15,
	},
	checkboxContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
	},
	checkbox: {
		marginRight: 10,
	},
	checkboxLabel: {
		fontSize: 14,
	},
	button: {
		width: "100%",
		backgroundColor: "#f44336",
		paddingVertical: 15,
		borderRadius: 10,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
});
