import { api } from "../axiosInstance";
import { emergencyRequestEndpoints } from "../endPoints";
import type { IEmergencyRequest, ICreateEmergencyRequest } from "@/types";

const createEmergencyRequest = (data: ICreateEmergencyRequest) => {
	return api.post(emergencyRequestEndpoints.create, data);
};

const getUsersRequests = () => {
	return api.get(emergencyRequestEndpoints.getUsersRequests);
};

const getRequestById = (id: string) => {
	return api.get(emergencyRequestEndpoints.getRequestById(id));
};

const updateRequest = (id: string, data: ICreateEmergencyRequest) => {
	return api.put(emergencyRequestEndpoints.updateRequest(id), data);
};

const deleteRequest = (id: string) => {
	return api.delete(emergencyRequestEndpoints.deleteRequest(id));
};

export const getRecentEmergencyRequests = async () => {
	try {
		const response = await api.get<{
			success: boolean;
			data: IEmergencyRequest[];
		}>("/emergency-request/recent");
		return response.data;
	} catch (error) {
		console.error("Error fetching recent emergency requests:", error);
		throw error;
	}
};

export { createEmergencyRequest, getUsersRequests, getRequestById, updateRequest, deleteRequest };
