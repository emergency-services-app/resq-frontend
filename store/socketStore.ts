import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { BASE_URL, SocketEventEnums, TOKEN_KEY } from "@/constants";
import socketIo, { Socket } from "socket.io-client";

interface ISocketStore {
	socket: Socket | null;
	locationWatcher: Location.LocationSubscription | null;
	connectSocket: () => Promise<void>;
	disconnectSocket: () => void;
	startLocationUpdates: (emergencyResponseId: string) => Promise<void>;
	stopLocationUpdates: () => void;
	sendLocation: (emergencyResponseId: string, location: { latitude: number; longitude: number }) => void;
	joinEmergencyRoom: (emergencyResponseId: string, userId: string, providerId: string) => void;
}

export const useSocketStore = create<ISocketStore>((set, get) => ({
	socket: null,
	locationWatcher: null,

	connectSocket: async () => {
		const token = await SecureStore.getItemAsync(TOKEN_KEY);
		if (!token) {
			console.error("No token found");
			return;
		}

		const socket = socketIo(BASE_URL, {
			withCredentials: true,
			auth: { token },
		});

		socket.on(SocketEventEnums.CONNECTION_EVENT, () => {
			console.log("🚀 Socket connected");
		});

		socket.on(SocketEventEnums.DISCONNECT_EVENT, () => {
			console.log("🛑 Socket disconnected");
		});

		socket.on(SocketEventEnums.EMERGENCY_RESPONSE_CREATED, async ({ emergencyResponse, optimalPath }) => {
			console.log("🆘 Emergency Response Created:", emergencyResponse);

			const emergencyResponseId = emergencyResponse.id;
			const userId = emergencyResponse.serviceProviderId;
			const providerId = emergencyResponse.serviceProviderId;

			get().joinEmergencyRoom(emergencyResponseId, userId, providerId);
			await get().startLocationUpdates(emergencyResponseId);
		});

		socket.on(SocketEventEnums.NEED_LOCATION, async ({ emergencyResponseId }) => {
			console.log("📍 Need location event received for emergency:", emergencyResponseId);
			await get().startLocationUpdates(emergencyResponseId);
		});

		set({ socket });
	},

	disconnectSocket: () => {
		const { socket, stopLocationUpdates } = get();
		if (socket) {
			socket.disconnect();
			console.log("🛑 Socket disconnected manually");
		}
		stopLocationUpdates();
		set({ socket: null });
	},

	joinEmergencyRoom: (emergencyResponseId: string, userId: string, providerId: string) => {
		const { socket } = get();
		if (socket) {
			socket.emit(SocketEventEnums.JOIN_EMERGENCY_ROOM, {
				emergencyResponseId,
				userId,
				providerId,
			});
			console.log("✅ Joined emergency room");
		}
	},

	sendLocation: (emergencyResponseId: string, location: { latitude: number; longitude: number }) => {
		const { socket } = get();
		if (socket) {
			socket.emit(SocketEventEnums.SEND_LOCATION, {
				emergencyResponseId,
				providerLocation: location,
			});
			console.log("📡 Location sent:", location);
		}
	},

	startLocationUpdates: async (emergencyResponseId: string) => {
		const { sendLocation } = get();

		const { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			console.error("📛 Permission to access location was denied");
			return;
		}

		const watcher = await Location.watchPositionAsync(
			{
				accuracy: Location.Accuracy.High,
				timeInterval: 5000,
				distanceInterval: 10,
			},
			(location) => {
				const { latitude, longitude } = location.coords;
				sendLocation(emergencyResponseId, { latitude, longitude });
			}
		);

		set({ locationWatcher: watcher });
		console.log("📍 Started location updates");
	},

	stopLocationUpdates: () => {
		const { locationWatcher } = get();
		if (locationWatcher) {
			locationWatcher.remove();
			console.log("🛑 Stopped location updates");
		}
		set({ locationWatcher: null });
	},
}));
