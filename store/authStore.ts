import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { loginUser, logOutUser, registerUser } from "@/services/api/auth";
import { TOKEN_KEY, USER_KEY } from "@/constants";
import { requestHandler } from "@/lib/utils";
import { LoginProps, RegisterProps } from "@/types";
import { router } from "expo-router";

interface AuthStore {
	user: any | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;

	login: (data: LoginProps) => Promise<void>;
	register: (data: RegisterProps) => Promise<void>;
	logout: () => Promise<void>;
	loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
	user: null,
	token: null,
	isAuthenticated: false,
	isLoading: false,

	login: async (data) => {
		await requestHandler(
			async () => await loginUser(data),
			(loading) => set({ isLoading: loading }),
			async (res) => {
				const { token, user } = res.data;
				await SecureStore.setItemAsync(TOKEN_KEY, token);
				await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

				set({ user, token, isAuthenticated: true });

				router.replace("/home"); // or wherever you want to go
			},
			() => {
				set({ user: null, token: null, isAuthenticated: false });
				Alert.alert("Login failed", "Check your credentials.");
			}
		);
	},

	register: async (data) => {
		await requestHandler(
			async () => await registerUser(data),
			(loading) => set({ isLoading: loading }),
			() => {
				Alert.alert("Success", "Account created successfully!");
				router.navigate("/sign-in");
			},
			() => {
				Alert.alert("Registration failed");
			}
		);
	},

	logout: async () => {
		await requestHandler(
			async () => await logOutUser(),
			(loading) => set({ isLoading: loading }),
			async () => {
				await SecureStore.deleteItemAsync(TOKEN_KEY);
				await SecureStore.deleteItemAsync(USER_KEY);
				set({ user: null, token: null, isAuthenticated: false });
				router.replace("/sign-in");
			},
			() => {
				Alert.alert("Logout failed");
			}
		);
	},

	loadStoredAuth: async () => {
		const token = await SecureStore.getItemAsync(TOKEN_KEY);
		const userRaw = await SecureStore.getItemAsync(USER_KEY);

		if (token && userRaw) {
			try {
				const user = JSON.parse(userRaw);
				set({ token, user, isAuthenticated: true });
			} catch {
				set({ token: null, user: null, isAuthenticated: false });
			}
		}
	},
}));
