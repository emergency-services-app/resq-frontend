import { create } from "zustand";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { userEndpoints } from "@/services/endPoints";
import { api } from "@/services/axiosInstance";
import Constants from "expo-constants";

interface NotificationState {
	pushToken: string | null;
	isRegistered: boolean;
	settings: {
		emergencyAlerts: boolean;
		locationUpdates: boolean;
		serviceUpdates: boolean;
	};
	registerForPushNotifications: () => Promise<void>;
	updateSettings: (settings: Partial<NotificationState["settings"]>) => void;
	scheduleLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
}

function handleRegistrationError(errorMessage: string) {
	throw new Error(errorMessage);
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
	pushToken: null,
	isRegistered: false,
	settings: {
		emergencyAlerts: true,
		locationUpdates: true,
		serviceUpdates: true,
	},

	registerForPushNotifications: async () => {
		try {
			if (Platform.OS === "android") {
				await Notifications.setNotificationChannelAsync("default", {
					name: "default",
					importance: Notifications.AndroidImportance.MAX,
					vibrationPattern: [0, 250, 250, 250],
					lightColor: "#FF231F7C",
				});
			}

			const { status: existingStatus } = await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;
			if (existingStatus !== "granted") {
				const { status } = await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}
			if (finalStatus !== "granted") {
				alert("Failed to get push token for push notification!");
				return;
			}

			// Get projectId from app.json
			const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
			if (!projectId) {
				handleRegistrationError("Project ID not found");
			}

			try {
				const token = await Notifications.getExpoPushTokenAsync({
					projectId: projectId,
				});

				await api.post("/notifications/token", { token: token.data });
				set({ pushToken: token.data, isRegistered: true });
			} catch (error: any) {
				console.log("Error getting push token:", error.message);
				if (error.message.includes("EXPERIENCE_NOT_FOUND")) {
					console.log("Please ensure your Expo project ID is correct in app.json");
				}
			}
		} catch (error) {
			console.log("Error registering for push notifications:", error);
		}
	},

	updateSettings: (newSettings) => {
		set((state) => ({
			settings: { ...state.settings, ...newSettings },
		}));
	},

	scheduleLocalNotification: async (title: string, body: string, data?: any) => {
		await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body,
				data: data || {},
			},
			trigger: null, // Show immediately
		});
	},
}));
