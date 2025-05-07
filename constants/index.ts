export const TOKEN_KEY = "token_key";
export const USER_KEY = "user_key";

export const BASE_URL =
	process.env.NODE_ENV === "development" ? process.env.EXPO_PUBLIC_BACKEND_PROD : process.env.EXPO_PUBLIC_BACKEND_DEV;

export const AVAILABLE_SERVICES = ["ambulance", "police", "rescue_team", "fire_truck"];

export enum SocketEventEnums {
	CONNECTION_EVENT = "connection",
	DISCONNECT_EVENT = "disconnect",

	AUTHORIZED_EVENT = "authorized",

	JOIN_EMERGENCY_ROOM = "joinEmergencyRoom",
	LEAVE_EMERGENCY_ROOM = "leaveEmergencyRoom",
	EMERGENCY_RESPONSE_CREATED = "emergencyResponseCreated",
	NOTIFICATION_CREATED = "notificationCreated",

	UPDATE_LOCATION = "updateLocation",
	UPDATE_USER_LOCATION = "updateUserLocation",
	SEND_LOCATION = "sendLocation",
	SEND_USER_LOCATION = "sendUserLocation",

	PROVIDER_FOUND = "providerFound",
	NEED_LOCATION = "needLocation",

	SOCKET_ERROR = "socketError",
}
