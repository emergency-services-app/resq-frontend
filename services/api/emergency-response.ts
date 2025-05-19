import { ICreateEmergencyResponse } from "@/types";
import { api } from "../axiosInstance";
import { emergencyResponseEndpoints } from "../endPoints";

const createEmergencyResponse = (data: ICreateEmergencyResponse) => {
	return api.post(emergencyResponseEndpoints.create, data);
};

const getEmergencyResponses = () => {
	return api.get(emergencyResponseEndpoints.getUsersResponses);
};

const getEmergencyResponseById = (id: string) => {
	return api.get(emergencyResponseEndpoints.getResponseById(id));
};

const updateEmergencyResponse = (
	id: string,
	data: {
		statusUpdate: string;
		updateDescription: string;
	}
) => {
	return api.put(emergencyResponseEndpoints.updateResponse(id), data);
};

const deleteEmergencyResponse = (id: string) => {
	return api.delete(emergencyResponseEndpoints.deleteResponse(id));
};

const getProviderResponses = () => {
	return api.get(emergencyResponseEndpoints.getProviderResponses);
};

export {
	createEmergencyResponse,
	getEmergencyResponses,
	getEmergencyResponseById,
	updateEmergencyResponse,
	deleteEmergencyResponse,
	getProviderResponses,
};
