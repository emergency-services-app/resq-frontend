import axios from "axios";
import { BASE_URL } from "../../constants";

export interface LocationResult {
	name: string;
	province: string;
	distance: string;
	district: string;
	municipality: string;
	ward: string;
	geometry: string;
	nameLower: string;
	id: string;
}

export interface SearchLocationResponse {
	data: LocationResult[];
}

export const searchLocation = async (query: string): Promise<SearchLocationResponse> => {
	try {
		const response = await axios.get(`${BASE_URL}/api/v1/location/search`, {
			params: { query },
		});
		return response.data;
	} catch (error) {
		console.error("Error searching location:", error);
		throw error;
	}
};
