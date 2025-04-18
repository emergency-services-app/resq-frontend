import { ICreateEmergencyRequest } from "@/types";
import { api } from "../axiosInstance";
import { emergencyRequestEndpoints } from "../endPoints";

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

export { createEmergencyRequest, getUsersRequests, getRequestById, updateRequest, deleteRequest };
