import { create } from "zustand";
import * as Location from "expo-location";

// interface for location store
interface LocationState {
	permissionStatus: Location.PermissionStatus | null;
	location: Location.LocationObject | null;
	emergencyResponseId: string | null;
	setEmergencyResponseId: (id: string) => void;
	askLocationPermission: () => Promise<void>;
	getLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
	permissionStatus: null,
	location: null,
	emergencyResponseId: null,

	// actions
	setEmergencyResponseId: (id: string) => set({ emergencyResponseId: id }),

	// ask for location permission
	askLocationPermission: async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();
		set({ permissionStatus: status });
	},

	// get location and set it
	getLocation: async () => {
		const { status } = await Location.getForegroundPermissionsAsync();
		if (status !== "granted") {
			const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
			set({ permissionStatus: newStatus });

			if (newStatus !== "granted") {
				throw new Error("Location permission denied");
			}
		}

		const loc = await Location.getCurrentPositionAsync({});
		set({ location: loc });
	},
}));
