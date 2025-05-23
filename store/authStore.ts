import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { loginServiceProvider, logoutServiceProvider, registerServiceProvider } from "@/services/api/service-provider";
import { TOKEN_KEY, USER_KEY } from "@/constants";
import { authApi } from "../services/api/auth";
import { RegisterProps, VerifyUserProps } from "@/types";
import { router } from "expo-router";

interface AuthResponse {
	token: string;
	user?: any;
	serviceProvider?: any;
}

interface IAuthStore {
	user: any | null;
	serviceProvider: any | null;
	isAuthenticated: boolean;
	isServiceProvider: boolean;
	isLoading: boolean;
	error: string | null;
	setUser: (user: any) => void;
	loginUser: (phoneNumber: number, password: string) => Promise<void>;
	loginServiceProvider: (phoneNumber: number, password: string) => Promise<void>;
	registerUser: (data: RegisterProps) => Promise<void>;
	registerServiceProvider: (data: any) => Promise<void>;
	setProviderStatus: (status: string) => void;
	setServiceProvider: (user: any) => void;
	logout: () => void;
	clearError: () => void;
	verifyOTP: (data: VerifyUserProps) => Promise<void>;
	resendOTP: () => Promise<void>;
	forgotPassword: (phoneNumber: string) => Promise<void>;
	loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<IAuthStore>((set, get) => ({
	user: null,
	serviceProvider: null,
	isAuthenticated: false,
	isServiceProvider: false,
	isLoading: false,
	error: null,

	loginUser: async (phoneNumber, password) => {
		try {
			set({ isLoading: true, error: null });
			const response = await authApi.login({ phoneNumber, password });
			if (response.data && response.data.token) {
				const { token, user } = response.data as AuthResponse;
				await SecureStore.setItemAsync(TOKEN_KEY, token);
				set({
					user,
					isAuthenticated: true,
					isServiceProvider: false,
					error: null,
				});
				router.replace("/");
			} else {
				const { otpToken, userId } = response.data;
				router.replace({
					pathname: "/(auth)/otp-screen",
					params: {
						otpToken,
						userId,
					},
				});
			}
		} catch (error: any) {
			console.log("AuthStore - login error:", {
				error,
				message: error?.message,
				response: error?.response?.data,
				status: error?.response?.status,
			});
			set({ error: error.response?.data?.message || "Login failed" });
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},

	setUser: (user: any) => {
		set({ user });
	},

	setServiceProvider: (serviceProvider: any) => {
		set({ serviceProvider });
	},

	setProviderStatus: (status: string) => {
		set({ serviceProvider: { ...get().serviceProvider, serviceStatus: status } });
	},

	loginServiceProvider: async (phoneNumber, password) => {
		try {
			set({ isLoading: true, error: null });
			const response = await loginServiceProvider({ phoneNumber, password });
			if (response.data && response.data.token) {
				const { token, serviceProvider } = response.data as AuthResponse;

				await SecureStore.setItemAsync(TOKEN_KEY, token);
				set({
					serviceProvider,
					isAuthenticated: true,
					isServiceProvider: true,
					isLoading: false,
				});
				router.replace("/(service-provider-tabs)/home");
			} else {
				const { otpToken, serviceProviderId: userId } = response.data;
				router.replace({
					pathname: "/(auth)/otp-screen",
					params: {
						otpToken,
						userId,
					},
				});
			}
		} catch (error: any) {
			set({
				error: error.response?.data?.message || "Login failed",
				isLoading: false,
			});
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},

	registerUser: async (data) => {
		try {
			set({ isLoading: true, error: null });
			const response = await authApi.register(data);
			set({ user: response.data, error: null });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Registration failed" });
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},

	registerServiceProvider: async (data: any) => {
		try {
			set({ isLoading: true, error: null });
			const response = await registerServiceProvider(data);
			const { token, serviceProvider } = response.data as AuthResponse;
			await SecureStore.setItemAsync(TOKEN_KEY, token);
			set({
				serviceProvider,
				isAuthenticated: true,
				isServiceProvider: true,
				isLoading: false,
			});
		} catch (error: any) {
			set({
				error: error.response?.data?.message || "Registration failed",
				isLoading: false,
			});
			throw new Error(error);
		}
	},

	logout: async () => {
		try {
			set({ isLoading: true, error: null });
			let response;
			if (get().isServiceProvider) {
				response = await logoutServiceProvider();
			} else {
				response = await authApi.logout();
			}

			if (response.statusCode === 200) {
				set({
					user: null,
					serviceProvider: null,
					isAuthenticated: false,
					isServiceProvider: false,
				});
				SecureStore.deleteItemAsync(TOKEN_KEY);
				router.replace("/(auth)/sign-in");
			}
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Logout failed" });
			throw error;
		}
	},

	clearError: () => {
		set({ error: null });
	},

	verifyOTP: async (data) => {
		try {
			set({ isLoading: true, error: null });
			const response = await authApi.verifyOTP(data);
			set({ user: response.data, error: null });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "OTP verification failed" });
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},

	resendOTP: async () => {
		try {
			set({ isLoading: true, error: null });
			await authApi.resendOTP();
			set({ error: null });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to resend OTP" });
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},

	forgotPassword: async (email) => {
		try {
			set({ isLoading: true, error: null });
			await authApi.forgotPassword({ email });
			set({ error: null });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to send reset instructions" });
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},

	loadStoredAuth: async () => {
		try {
			const token = await SecureStore.getItemAsync(TOKEN_KEY);
			if (token) {
				set({ isAuthenticated: true });
			}
		} catch (error) {
			console.log("Error loading stored auth:", error);
		}
	},
}));
