import { RegisterProps } from "@/types";
import { api } from "../axiosInstance";
import { LoginProps } from "@/types";
import { userEndpoints } from "../endPoints";

export const loginUser = async (data: LoginProps) => {
	const response = await api.post(userEndpoints.login, data);
	const result = response.data;
	return result;
};

export const registerUser = async (data: RegisterProps) => {
	const response = await api.post(userEndpoints.register, data);
	const result = response.data.user;
	return result;
};

export const logoutUser = async () => {
	const response = await api.post(userEndpoints.logout);
	const result = response.data.token;
	return result;
};
