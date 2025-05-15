import { api } from "@/services/axiosInstance";
import { serviceProviderEndpoints } from "../endPoints";
import { IServiceProvider, IServiceProviderRegister, IServiceProviderUpdate, LoginProps } from "@/types";

export interface NearbyProvider {
	id: string;
	name: string;
	serviceType: string;
	location: {
		latitude: string;
		longitude: string;
	};
}

// Service Provider API Functions
const registerServiceProvider = async (data: IServiceProviderRegister) => {
	const response = await api.post(serviceProviderEndpoints.register, data);
	return response.data;
};

const loginServiceProvider = async (data: LoginProps) => {
	const response = await api.post(serviceProviderEndpoints.login, data);
	return response.data;
};

const logoutServiceProvider = async () => {
	const response = await api.get(serviceProviderEndpoints.logout);
	return response.data;
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

const updateServiceProviderStatus = (data: { status: string; emergencyResponseId?: string }) => {
	return api.patch(serviceProviderEndpoints.updateStatus, data);
};

const changeProviderPassword = (data: { oldPassword: string; newPassword: string }) => {
	return api.post(serviceProviderEndpoints.changePassword, data);
};

const getNearbyProviders = async ({
	latitude,
	longitude,
	serviceType,
}: {
	latitude: number;
	longitude: number;
	serviceType: string;
}) => {
	return api.get(serviceProviderEndpoints.nearbyProviders, {
		params: { latitude, longitude, serviceType },
	});
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
	updateServiceProviderStatus,
	getNearbyProviders,
	changeProviderPassword,
};
