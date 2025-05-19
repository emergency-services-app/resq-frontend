import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { userEndpoints } from "./endPoints";
import axios from "axios";

export const registerForPushNotifications = async () => {
	let token;

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
	token = (await Notifications.getExpoPushTokenAsync()).data;

	// Send token to backend
	try {
		await axios.post(userEndpoints.updatePushToken, { pushToken: token });
	} catch (error) {
		console.log("Error updating push token:", error);
	}

	return token;
};

export const scheduleLocalNotification = async (title: string, body: string, data?: any) => {
	await Notifications.scheduleNotificationAsync({
		content: {
			title,
			body: body.replace(/\\n/g, "\n"), // Ensure proper line breaks
			data: data || {},
			sound: true,
			priority: Notifications.AndroidNotificationPriority.HIGH,
		},
		trigger: null, // Show immediately
	});
};

export const setupNotificationListeners = (
	onNotificationReceived: (notification: Notifications.Notification) => void,
	onNotificationResponseReceived: (response: Notifications.NotificationResponse) => void
) => {
	const notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);
	const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponseReceived);

	return () => {
		Notifications.removeNotificationSubscription(notificationListener);
		Notifications.removeNotificationSubscription(responseListener);
	};
};
