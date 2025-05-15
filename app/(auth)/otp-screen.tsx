import { requestHandler } from "@/lib/utils";
import { authApi } from "@/services/api/auth";
import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";

const OTPScreen = () => {
	const router = useRouter();
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [password, setPassword] = useState("");
	const inputRefs = useRef<Array<TextInput | null>>([]);

	const { otpToken, userId, isForgotPassword } = useGlobalSearchParams();

	const handleOtpSubmit = async () => {
		if (typeof userId !== "string") return;

		if (otp.length !== 6) {
			alert("Please enter a valid OTP");
			return;
		}

		if (isForgotPassword === "true") {
			await requestHandler(
				async () => await authApi.resetPassword({ otpToken: otp, userId, password }),
				setIsLoading,
				(res) => {
					alert("OTP verified successfully!");
					router.replace("/(tabs)/home");
				},
				() => {
					alert("OTP verification failed! Try again.");
				}
			);
		} else {
			await requestHandler(
				async () => await authApi.verifyOTP({ otpToken: otp, userId }),
				setIsLoading,
				(res) => {
					alert("OTP verified successfully!");
					router.replace("/(tabs)/home");
				},
				() => {
					alert("OTP verification failed! Try again.");
				}
			);
		}
	};

	return (
		<View style={styles.container}>
			<Image
				source={require("@/assets/images/logo.png")}
				style={styles.logo}
			/>
			{/* <Text style={styles.title}>FirstResQ</Text>
      <Text style={styles.subtitle}>YOUR EMERGENCY PARTNER</Text> */}

			<Text style={styles.otpText}>Enter OTP</Text>
			<Text style={styles.infoText}>An OTP Has Been Sent To 98********</Text>

			<View style={styles.otpInputContainer}>
				{Array(6)
					.fill(0)
					.map((_, index) => (
						<TextInput
							key={index}
							style={styles.otpInput}
							ref={(input) => (inputRefs.current[index] = input)}
							keyboardType="numeric"
							maxLength={1}
							onChangeText={(text) => {
								const newOtp = otp.split("");
								if (newOtp.length < 6) {
									inputRefs?.current[index + 1]?.focus();
								}
								newOtp[index] = text;
								setOtp(newOtp.join(""));
							}}
							onKeyPress={({ nativeEvent }) => {
								if (nativeEvent.key === "Backspace") {
									inputRefs?.current[index - 1]?.focus();
								}
							}}
						/>
					))}
			</View>

			{isForgotPassword === "true" && (
				<View>
					<TextInput
						placeholder="New Password"
						value={password}
						onChangeText={setPassword}
						style={styles.passwordInput}
					/>
				</View>
			)}

			<Text style={styles.resendText}>
				Didn’t Get The Code? <Text style={styles.boldText}>Request Again</Text>
			</Text>

			<TouchableOpacity
				style={styles.button}
				onPress={handleOtpSubmit}
			>
				<Text style={styles.buttonText}>{isLoading ? <ActivityIndicator /> : "Submit"}</Text>
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
	otpText: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 10,
	},
	infoText: {
		fontSize: 14,
		color: "#555",
		marginBottom: 20,
	},
	otpInputContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		marginBottom: 20,
	},
	otpInput: {
		width: 50,
		height: 50,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 10,
		textAlign: "center",
		fontSize: 18,
	},
	resendText: {
		fontSize: 14,
		color: "#555",
		marginBottom: 20,
	},
	boldText: {
		fontWeight: "bold",
		color: "#f44336",
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
	passwordInput: {
		width: "100%",
		height: 50,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 10,
		paddingHorizontal: 10,
		marginBottom: 20,
	},
});

export default OTPScreen;
