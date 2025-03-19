import {
	View,
	Text,
	Image,
	TextInput,
	ActivityIndicator,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { LoginProps, RegisterProps } from "@/types";
import { loginUser } from "@/services/api/auth";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY } from "@/constants";
import { useAuth } from "@/context/authContext";

const SigninScreen = () => {
	const [phoneNumber, setPhoneNumber] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const { loginAction, authState } = useAuth();

	const handleLogin = async () => {
		if (!phoneNumber.trim() || !password.trim()) {
			alert("Please enter both username and password.");
			return;
		}

		setLoading(true);
		if (loginAction) {
			try {
				const message = await loginAction({ phoneNumber, password });
				alert(message);
				router.push("/(tabs)/home");
			} catch (error: any) {
				alert(error.message || "Login failed.");
			}
		}

		setLoading(false);
	};

	return (
		<View style={styles.container}>
			<Image
				source={require("@/assets/images/logo.png")}
				style={styles.logo}
			/>

			<Text style={styles.loginText}>Login</Text>
			<Text style={styles.infoText}>Enter your details to login</Text>

			<TextInput
				style={styles.input}
				placeholder="phone number"
				keyboardType="phone-pad"
				value={phoneNumber}
				onChangeText={setPhoneNumber}
			/>

			<TextInput
				style={styles.input}
				placeholder="password"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>
			<Text style={styles.forgotText}>Forgot Password?</Text>

			{loading ? (
				<ActivityIndicator
					size="large"
					color="#E63946"
				/>
			) : (
				<TouchableOpacity
					style={styles.button}
					onPressOut={handleLogin}
				>
					<Text style={styles.buttonText}>Login</Text>
				</TouchableOpacity>
			)}

			<Text style={styles.registerText}>
				Don’t Have An Account?{" "}
				<Link
					href="/sign-up"
					style={styles.boldText}
				>
					Register
				</Link>
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#fff",
	},
	logo: {
		width: 100,
		height: 100,
		marginBottom: 10,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
	},
	subtitle: {
		fontSize: 12,
		color: "gray",
		marginBottom: 20,
	},
	loginText: {
		fontSize: 24,
		fontWeight: "bold",
	},
	infoText: {
		fontSize: 14,
		color: "gray",
		marginBottom: 10,
	},
	input: {
		width: "80%",
		padding: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		marginVertical: 5,
	},
	forgotText: {
		alignSelf: "flex-end",
		color: "gray",
		fontSize: 12,
		marginRight: "10%",
	},
	button: {
		backgroundColor: "#E63946",
		padding: 15,
		width: "80%",
		borderRadius: 5,
		alignItems: "center",
		marginVertical: 20,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	registerText: {
		fontSize: 14,
		color: "black",
	},
	boldText: {
		fontWeight: "bold",
	},
});

export default SigninScreen;
