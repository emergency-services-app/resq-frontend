import { BASE_URL } from "@/constants";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({
	baseURL: `${BASE_URL}/api/v1`,
	withCredentials: true,
});

api.interceptors.request.use(
	async function (config) {
		const token = await SecureStore.getItemAsync("token");

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		console.log("hitting url", config.baseURL, config.url, config.method);
		return config;
	},
	function (error) {
		return Promise.reject(error);
	}
);
