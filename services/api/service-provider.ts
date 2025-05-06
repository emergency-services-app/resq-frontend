import { api } from "../axiosInstance";
import { serviceProviderEndpoints } from "../endPoints";

const updateServiceProviderStatus = (data: { status: string; emergencyResponseId?: string }) => {
	return api.patch(serviceProviderEndpoints.updateStatus, data);
};

export { updateServiceProviderStatus };
