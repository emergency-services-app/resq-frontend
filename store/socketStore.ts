import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { BASE_URL, SocketEventEnums, TOKEN_KEY } from "@/constants";
import socketIo, { Socket } from "socket.io-client";

interface LocationData {
	latitude: string;
	longitude: string;
}

interface LocationUpdate {
	userId: string;
	location: LocationData;
	timestamp: string;
}

interface ServiceProvider {
	id: string;
	name: string;
	location: LocationData;
	serviceType: string;
	status: "available" | "busy" | "offline";
}

interface ISocketStore {
	socket: Socket | null;
	locationWatcher: Location.LocationSubscription | null;
	isConnected: boolean;
	lastError: string | null;
	availableProviders: ServiceProvider[];
	connectSocket: () => Promise<void>;
	disconnectSocket: () => void;
	startLocationUpdates: (emergencyResponseId: string, isProvider: boolean) => Promise<void>;
	stopLocationUpdates: () => void;
	sendLocation: (emergencyResponseId: string, location: Location.LocationObject, isProvider: boolean) => void;
	joinEmergencyRoom: (emergencyResponseId: string, userId: string, providerId: string) => void;
	onLocationUpdate: (callback: (data: LocationUpdate) => void) => void;
	onUserLocationUpdate: (callback: (data: LocationUpdate) => void) => void;
	requestEmergencyService: (serviceType: string, userLocation: LocationData) => Promise<void>;
	updateProviderStatus: (status: "available" | "busy" | "offline") => void;
	clearError: () => void;
}

export const useSocketStore = create<ISocketStore>((set, get) => ({
	socket: null,
	locationWatcher: null,
	isConnected: false,
	lastError: null,
	availableProviders: [],

	connectSocket: async () => {
		try {
			const token = await SecureStore.getItemAsync(TOKEN_KEY);
			if (!token) {
				console.error("No token found");
				set({ lastError: "Authentication token not found" });
				return;
			}

			const socket = socketIo(BASE_URL, {
				withCredentials: true,
				auth: { token },
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
			});

			socket.on(SocketEventEnums.CONNECTION_EVENT, () => {
				console.log("🚀 Socket connected");
				set({ isConnected: true, lastError: null });
			});

			socket.on(SocketEventEnums.DISCONNECT_EVENT, () => {
				console.log("🛑 Socket disconnected");
				set({ isConnected: false });
			});

			socket.on(SocketEventEnums.SOCKET_ERROR, (error) => {
				console.error("Socket error:", error);
				set({ lastError: "Connection error. Please check your internet connection." });
			});

			socket.on(SocketEventEnums.EMERGENCY_RESPONSE_CREATED, async ({ emergencyResponse }) => {
				console.log("🆘 Emergency Response Created:", emergencyResponse);

				const emergencyResponseId = emergencyResponse.id;
				const userId = emergencyResponse.userId;
				const providerId = emergencyResponse.serviceProviderId;

				get().joinEmergencyRoom(emergencyResponseId, userId, providerId);
				await get().startLocationUpdates(emergencyResponseId, false);
			});

			socket.on(SocketEventEnums.NEED_LOCATION, async ({ emergencyResponseId }) => {
				console.log("📍 Need location event received for emergency:", emergencyResponseId);
				await get().startLocationUpdates(emergencyResponseId, true);
			});

			socket.on(SocketEventEnums.PROVIDER_FOUND, ({ providers }) => {
				console.log("👥 Available providers:", providers);
				set({ availableProviders: providers });
			});

			socket.on(SocketEventEnums.PROVIDER_STATUS_UPDATED, ({ providerId, status }) => {
				set((state) => ({
					availableProviders: state.availableProviders.map((provider) =>
						provider.id === providerId ? { ...provider, status } : provider
					),
				}));
			});

			set({ socket });
		} catch (error) {
			console.error("Error connecting to socket:", error);
			set({ lastError: "Failed to connect to server" });
		}
	},

	disconnectSocket: () => {
		const { socket, stopLocationUpdates } = get();
		if (socket) {
			socket.disconnect();
			console.log("🛑 Socket disconnected manually");
		}
		stopLocationUpdates();
		set({ socket: null, isConnected: false, lastError: null });
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

	sendLocation: (emergencyResponseId: string, location: Location.LocationObject, isProvider: boolean) => {
		const { socket } = get();
		if (socket) {
			const event = isProvider ? SocketEventEnums.SEND_LOCATION : SocketEventEnums.SEND_USER_LOCATION;
			socket.emit(event, {
				emergencyResponseId,
				location: {
					latitude: location.coords.latitude.toString(),
					longitude: location.coords.longitude.toString(),
				},
			});
			console.log(`📡 ${isProvider ? "Provider" : "User"} location sent:`, location.coords);
		}
	},

	startLocationUpdates: async (emergencyResponseId: string, isProvider: boolean) => {
		const { sendLocation } = get();

		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.error("📛 Permission to access location was denied");
				set({ lastError: "Location permission denied" });
				return;
			}

			const watcher = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 5000,
					distanceInterval: 10,
				},
				(location) => {
					sendLocation(emergencyResponseId, location, isProvider);
				}
			);

			set({ locationWatcher: watcher, lastError: null });
			console.log(`📍 Started ${isProvider ? "provider" : "user"} location updates`);
		} catch (error) {
			console.error("Error starting location updates:", error);
			set({ lastError: "Failed to start location updates" });
		}
	},

	stopLocationUpdates: () => {
		const { locationWatcher } = get();
		if (locationWatcher) {
			locationWatcher.remove();
			console.log("🛑 Stopped location updates");
		}
		set({ locationWatcher: null });
	},

	onLocationUpdate: (callback: (data: LocationUpdate) => void) => {
		const { socket } = get();
		if (socket) {
			socket.on(SocketEventEnums.UPDATE_LOCATION, callback);
		}
	},

	onUserLocationUpdate: (callback: (data: LocationUpdate) => void) => {
		const { socket } = get();
		if (socket) {
			socket.on(SocketEventEnums.UPDATE_USER_LOCATION, callback);
		}
	},

	requestEmergencyService: async (serviceType: string, userLocation: LocationData) => {
		const { socket } = get();
		if (socket) {
			socket.emit(SocketEventEnums.REQUEST_EMERGENCY_SERVICE, {
				serviceType,
				userLocation,
			});
			console.log("🚨 Emergency service requested:", { serviceType, userLocation });
		}
	},

	updateProviderStatus: (status: "available" | "busy" | "offline") => {
		const { socket } = get();
		if (socket) {
			socket.emit(SocketEventEnums.UPDATE_PROVIDER_STATUS, { status });
			console.log("📊 Provider status updated:", status);
		}
	},

	clearError: () => {
		set({ lastError: null });
	},
}));
