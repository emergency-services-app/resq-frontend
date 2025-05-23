import {
	LoginProps,
	RegisterProps,
	ResetPasswordProps,
	VerifyUserProps,
	ForgotPasswordProps,
	UpdateUserProps,
} from "@/types";
import { api } from "@/services/axiosInstance";
import { userEndpoints } from "../endPoints";

export const authApi = {
	login: async (data: LoginProps) => {
		console.log("Auth API - login request:", {
			url: userEndpoints.login,
			data,
		});
		const response = await api.post(userEndpoints.login, data);
		console.log("Auth API - login response:", response.data);
		return response.data;
	},
	logout: async () => {
		const response = await api.get(userEndpoints.logout);
		return response.data;
	},
	register: async (data: RegisterProps) => {
		const response = await api.post(userEndpoints.register, data);
		return response.data;
	},
	verifyOTP: async (data: VerifyUserProps) => {
		return api.post(userEndpoints.verify, data);
	},
	resendOTP: async () => {
		const response = await api.post(userEndpoints.verify);
		return response.data;
	},
	forgotPassword: (data: ForgotPasswordProps) => {
		return api.post(userEndpoints.forgotPassword, data);
	},
	resetPassword: async (data: ResetPasswordProps) => {
		return api.post(userEndpoints.resetPassword, data);
	},
	updateUser: async (data: Partial<UpdateUserProps>) => {
		const response = await api.put(userEndpoints.updateUser, data);
		return response.data;
	},
	changePassword: async (data: { oldPassword: string; newPassword: string }) => {
		const response = await api.post(userEndpoints.changePassword, data);
		return response.data;
	},
};
