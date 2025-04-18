import { api } from "../axiosInstance";
import { emergencyContactsEndpoints } from "../endPoints";
import { ICreateEmergencyContact } from "@/types";

const createEmergencyContact = (data: ICreateEmergencyContact) => {
	return api.post(emergencyContactsEndpoints.create, data);
};

const getUsersContacts = () => {
	return api.get(emergencyContactsEndpoints.getUsersContacts);
};

const getContactById = (id: string) => {
	return api.get(emergencyContactsEndpoints.getContactById(id));
};

const updateContact = (id: string, data: ICreateEmergencyContact) => {
	return api.put(emergencyContactsEndpoints.updateContact(id), data);
};

const deleteContact = (id: string) => {
	return api.delete(emergencyContactsEndpoints.deleteContact(id));
};

const getCommonContacts = () => {
	return api.get(emergencyContactsEndpoints.getCommonContacts);
};

export { createEmergencyContact, getUsersContacts, getContactById, updateContact, deleteContact, getCommonContacts };
