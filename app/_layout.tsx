import { Slot, Stack } from "expo-router";
import "./globals.css";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

	useEffect(() => {
		loadStoredAuth();
	}, []);

	const [loaded] = useFonts({
		"Laila-Regular": require("../assets/fonts/Laila-Regular.ttf"),
		"Laila-Light": require("../assets/fonts/Laila-Light.ttf"),
		"Laila-Medium": require("../assets/fonts/Laila-Medium.ttf"),
		"Laila-Bold": require("../assets/fonts/Laila-Bold.ttf"),
		"Laila-SemiBold": require("../assets/fonts/Laila-SemiBold.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <Slot />;
}
