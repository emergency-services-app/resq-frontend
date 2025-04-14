import { create } from "zustand";

import { ServiceProviderStore, LocationStore, MarkerData } from "@/types";

export const useLocationStore = create<LocationStore>((set) => ({
	userLatitude: null,
	userLongitude: null,
	userAddress: null,
	destinationLatitude: null,
	destinationLongitude: null,
	destinationAddress: null,
	setUserLocation: ({ latitude, longitude, address }: { latitude: number; longitude: number; address: string }) => {
		set(() => ({
			userLatitude: latitude,
			userLongitude: longitude,
			userAddress: address,
		}));

		// if provider is selected and now new location is set, clear the selected driver
		const { selectedProvider, clearSelectedProvider } = useServiceProviderStore.getState();
		if (selectedProvider) clearSelectedProvider();
	},

	setDestinationLocation: ({
		latitude,
		longitude,
		address,
	}: {
		latitude: number;
		longitude: number;
		address: string;
	}) => {
		set(() => ({
			destinationLatitude: latitude,
			destinationLongitude: longitude,
			destinationAddress: address,
		}));

		// if provider is selected and now new location is set, clear the selected driver
		const { selectedProvider, clearSelectedProvider } = useServiceProviderStore.getState();
		if (selectedProvider) clearSelectedProvider();
	},
}));

export const useServiceProviderStore = create<ServiceProviderStore>((set) => ({
	providers: [] as MarkerData[],
	selectedProvider: null,
	setSelectedProvider: (providerId: number) => set(() => ({ selectedProvider: providerId })),
	setProviders: (providers: MarkerData[]) => set(() => ({ providers })),
	clearSelectedProvider: () => set(() => ({ selectedProvider: null })),
}));
