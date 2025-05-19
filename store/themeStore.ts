import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { lightTheme, darkTheme } from "@/constants/theme";

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
			console.log("Error toggling dark mode:", error);
		}
	},
	setDarkMode: async (value: boolean) => {
		try {
			await SecureStore.setItemAsync("darkMode", JSON.stringify(value));
			set({ isDarkMode: value });
		} catch (error) {
			console.log("Error setting dark mode:", error);
		}
	},
	initializeTheme: async () => {
		try {
			const darkModeValue = await SecureStore.getItemAsync("darkMode");
			if (darkModeValue !== null) {
				set({ isDarkMode: JSON.parse(darkModeValue) });
			}
		} catch (error) {
			console.log("Error initializing theme:", error);
		}
	},
}));
