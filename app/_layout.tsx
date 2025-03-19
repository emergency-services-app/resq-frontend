import { Slot, Stack } from "expo-router";
import "./globals.css";
import { AuthProvider } from "../context/authContext";

export default function RootLayout() {
	return (
		<AuthProvider>
			<Slot/>
		</AuthProvider>
	);
}
