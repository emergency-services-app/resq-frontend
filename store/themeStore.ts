import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface ThemeState {
	isDarkMode: boolean;
	toggleDarkMode: () => Promise<void>;
	setDarkMode: (value: boolean) => Promise<void>;
	initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
	isDarkMode: false,
	toggleDarkMode: async () => {
		try {
			const currentState = useThemeStore.getState().isDarkMode;
			const newValue = !currentState;
			await SecureStore.setItemAsync("darkMode", JSON.stringify(newValue));
			set({ isDarkMode: newValue });
		} catch (error) {
			console.error("Error toggling dark mode:", error);
		}
	},
	setDarkMode: async (value: boolean) => {
		try {
			await SecureStore.setItemAsync("darkMode", JSON.stringify(value));
			set({ isDarkMode: value });
		} catch (error) {
			console.error("Error setting dark mode:", error);
		}
	},
	initializeTheme: async () => {
		try {
			const savedTheme = await SecureStore.getItemAsync("darkMode");
			if (savedTheme !== null) {
				const isDarkMode = JSON.parse(savedTheme);
				set({ isDarkMode });
			}
		} catch (error) {
			console.error("Error initializing theme:", error);
		}
	},
}));
