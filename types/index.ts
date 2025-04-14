import * as Location from "expo-location";

export interface RegisterProps {
	name: string;
	age: number;
	email: string;
	phoneNumber: string;
	primaryAddress: number;
	password: string;
}

export interface LoginProps {
	phoneNumber: string;
	password: string;
}

export interface ResetPasswordProps {
	otpToken: string;
	userId: string;
	password: string;
}

export interface VerifyUserProps {
	otpToken: string;
	userId: string;
}

export interface ChangePasswordProps {
	oldPassword: string;
	newPassword: string;
}

export interface ForgotPasswordProps {
	email: string;
}

export interface AuthStore {
	isAuthenticated: boolean;
	userDetails: any;
	token: string | null;
	onLogin: ({ token, userDetails }: { token: string; userDetails: any }) => void;
	onLogout: () => void;
}

export interface LocationStore {
	userLatitude: number | null;
	userLongitude: number | null;
	userAddress: string | null;
	destinationLatitude: number | null;
	destinationLongitude: number | null;
	destinationAddress: string | null;
	setUserLocation: ({ latitude, longitude, address }: { latitude: number; longitude: number; address: string }) => void;
	setDestinationLocation: ({
		latitude,
		longitude,
		address,
	}: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
}

export interface MarkerData {
	latitude: number;
	longitude: number;
	id: number;
	title: string;
	profile_image_url: string;
	service_img_url: string;
	rating: number;
	first_name: string;
	last_name: string;
	service_type: string;
	time?: number;
}

export interface ServiceProviderStore {
	providers: MarkerData[];
	selectedProvider: number | null;
	setSelectedProvider: (providerId: number) => void;
	setProviders: (providers: MarkerData[]) => void;
	clearSelectedProvider: () => void;
}

export interface ApiResponseInterface {
	data: any;
	message: string;
	statusCode: number;
	success: boolean;
}
