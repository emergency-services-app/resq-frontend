import { io, Socket } from "socket.io-client";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { api } from "@/services/axiosInstance";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "@/constants";

class NotificationService {
	private socket: Socket | null = null;
	private pushToken: string | null = null;

	constructor() {
		this.initializeNotifications();
	}

	private async initializeNotifications() {
		// Request permission for notifications
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== "granted") {
			console.log("Failed to get push token for push notification!");
			return;
		}

		// Get the push token
		const token = await Notifications.getExpoPushTokenAsync({
			projectId: Constants.expoConfig?.extra?.eas?.projectId,
		});

		this.pushToken = token.data;

		// Configure notification handler
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: true,
				shouldPlaySound: true,
				shouldSetBadge: true,
			}),
		});

		// Initialize socket connection
		this.initializeSocket();
	}

	private initializeSocket() {
		this.socket = io(BASE_URL, {
			auth: {
				token: this.pushToken, // This is just for socket auth, not API
			},
		});

		this.socket.on("connect", () => {
			console.log("Socket connected");
		});

		this.socket.on("disconnect", () => {
			console.log("Socket disconnected");
		});

		this.socket.on("notificationCreated", (notification) => {
			this.handleNewNotification(notification);
		});
	}

	private async handleNewNotification(notification: any) {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: `New ${notification.type}`,
				body: notification.message,
				data: { notificationId: notification.id },
			},
			trigger: null,
		});
	}

	public async registerPushToken() {
		if (!this.pushToken) {
			console.log("No push token available");
			return;
		}

		try {
			await api.post("/notifications/token", {
				token: this.pushToken,
			});
		} catch (error) {
			console.log("Error registering push token:", error);
		}
	}

	public async getNotifications(markAsRead: boolean = false) {
		try {
			const response = await api.post("/notifications", {
				markAsRead,
				fromDaysAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
				toDaysAgo: new Date().toISOString(),
			});
			return response.data;
		} catch (error) {
			console.log("Error fetching notifications:", error);
			return [];
		}
	}

	public async markAsRead(notificationId: string) {
		try {
			await api.put(`/notifications/${notificationId}/read`, {});
		} catch (error) {
			console.log("Error marking notification as read:", error);
		}
	}

	public disconnect() {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
	}
}

export const notificationService = new NotificationService();
