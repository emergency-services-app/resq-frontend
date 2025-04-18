import { api } from "@/services/axiosInstance";
import { serviceProviderEndpoints } from "../endPoints";
import { IServiceProvider, IServiceProviderLogin, IServiceProviderRegister, IServiceProviderUpdate } from "@/types";

// Service Provider API Functions
const registerServiceProvider = (data: IServiceProviderRegister) => {
	return api.post(serviceProviderEndpoints.register, data);
};

const loginServiceProvider = (data: IServiceProviderLogin) => {
	return api.post(serviceProviderEndpoints.login, data);
};

const logoutServiceProvider = () => {
	return api.get(serviceProviderEndpoints.logout);
};

const updateServiceProvider = (data: IServiceProviderUpdate) => {
	return api.put(serviceProviderEndpoints.update, data);
};

const verifyServiceProvider = (verificationCode: string) => {
	return api.post(serviceProviderEndpoints.verify, { code: verificationCode });
};

const forgotServiceProviderPassword = (phoneNumber: string) => {
	return api.post(serviceProviderEndpoints.forgotPassword, { phoneNumber });
};

const resetServiceProviderPassword = (data: { phoneNumber: string; code: string; newPassword: string }) => {
	return api.post(serviceProviderEndpoints.resetPassword, data);
};

const getServiceProviderProfile = () => {
	return api.get(serviceProviderEndpoints.getProfile);
};

const getServiceProviderById = (id: string) => {
	return api.get(serviceProviderEndpoints.getById(id));
};

export {
	registerServiceProvider,
	loginServiceProvider,
	logoutServiceProvider,
	updateServiceProvider,
	verifyServiceProvider,
	forgotServiceProviderPassword,
	resetServiceProviderPassword,
	getServiceProviderProfile,
	getServiceProviderById,
};
