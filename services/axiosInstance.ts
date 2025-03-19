import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL =
	process.env.NODE_ENV === "development"
		? process.env.EXPO_PUBLIC_BACKEND_PROD
		: process.env.EXPO_PUBLIC_BACKEND_DEV;

console.log("BASE_URL", BASE_URL);
export const api = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
});

api.interceptors.request.use(
	async function (config) {
		const token = await SecureStore.getItemAsync("token");

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	function (error) {
		return Promise.reject(error);
	}
);
