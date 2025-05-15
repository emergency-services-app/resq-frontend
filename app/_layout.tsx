import { Slot, Stack } from "expo-router";
import "./globals.css";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";
import { useLocationStore } from "@/store/locationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { api } from "@/services/axiosInstance";
import { serviceProviderEndpoints, userEndpoints } from "@/services/endPoints";
import { initializeApp } from "../utils/initializeApp";
import * as Notifications from "expo-notifications";

// Configure notifications
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const connectSocket = useSocketStore((state) => state.connectSocket);
	const disconnectSocket = useSocketStore((state) => state.disconnectSocket);
	const socket = useSocketStore((state) => state.socket);
	const registerForPushNotifications = useNotificationStore((state) => state.registerForPushNotifications);

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
					await loadStoredAuth();
				}
			} catch (error) {
				try {
					const response = await api.get(serviceProviderEndpoints.getProfile);
					if (response.data.success) {
						await loadStoredAuth();
					}
				} catch (error) {
					useAuthStore.getState().logout();
				}
			}
		};

		checkAuthAndLoadProfile();
	}, []);

	useEffect(() => {
		initializeApp();
	}, []);

	useEffect(() => {
		registerForPushNotifications();
	}, []);

	const [loaded, error] = useFonts({
		"Laila-Regular": require("../assets/fonts/Laila-Regular.ttf"),
		"Laila-Light": require("../assets/fonts/Laila-Light.ttf"),
		"Laila-Medium": require("../assets/fonts/Laila-Medium.ttf"),
		"Laila-Bold": require("../assets/fonts/Laila-Bold.ttf"),
		"Laila-SemiBold": require("../assets/fonts/Laila-SemiBold.ttf"),
		"Inter": require("@tamagui/font-inter/otf/Inter-Medium.otf"),
		"InterBold": require("@tamagui/font-inter/otf/Inter-Bold.otf"),
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

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
