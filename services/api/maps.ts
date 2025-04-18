import { api } from "../axiosInstance";
import { mapsEndpoints } from "../endPoints";

const mapsApi = {
	getAutoComplete: async (query: string, lat: number, lng: number) => {
		const response = await api.get(mapsEndpoints.getAutoComplete(query, lat, lng));
		return response.data;
	},
	getOptimalRoute: async (origin: string, destination: string) => {
		const response = await api.get(mapsEndpoints.getOptimalRoute(origin, destination));
		return response.data;
	},
};

export default mapsApi;
