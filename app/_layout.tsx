import { Slot, Stack } from "expo-router";
import "./globals.css";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";
import { useLocationStore } from "@/store/locationStore";
import { api } from "@/services/axiosInstance";
import { userEndpoints } from "@/services/endPoints";
import { initializeApp } from "../utils/initializeApp";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const connectSocket = useSocketStore((state) => state.connectSocket);
	const disconnectSocket = useSocketStore((state) => state.disconnectSocket);
	const socket = useSocketStore((state) => state.socket);
	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		if (isAuthenticated && !socket) {
			connectSocket();
		}

		return () => {
			disconnectSocket();
		};
	}, [isAuthenticated]);

	useEffect(() => {
		useLocationStore.getState().askLocationPermission();
	}, []);

	useEffect(() => {
		const checkAuthAndLoadProfile = async () => {
			try {
				const response = await api.get(userEndpoints.getProfile);
				if (response.data.success) {
					loadStoredAuth();
				}
			} catch (error) {
				useAuthStore.getState().logout();
			}
		};

		checkAuthAndLoadProfile();
	}, []);

	useEffect(() => {
		initializeApp();
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
