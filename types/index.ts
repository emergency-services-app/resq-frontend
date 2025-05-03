export interface RegisterProps {
	name: string;
	age: number;
	email: string;
	phoneNumber: number;
	primaryAddress: string;
	password: string;
}

export interface UpdateUserProps {
	name: string;
	age: number;
	email: string;
	phoneNumber: number;
	primaryAddress: string;
}
export interface LoginProps {
	phoneNumber: number;
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
	phoneNumber: string;
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

export interface UserInterface {
	id: string;
	name: string;
	email: string;
	phoneNumber: number;
	age: number;
	isVerified: boolean;
	primaryAddress: string;
	role: "user" | "admin";
}

export interface ILocation {
	latitude: number;
	longitude: number;
}

export interface ICreateEmergencyRequest {
	id?: string;
	emergencyType: "police" | "fire_truck" | "ambulance" | "rescue_team";
	emergencyDescription: string;
	userLocation: ILocation;
}

export interface ICreateEmergencyResponse {
	id?: string;
	emergencyRequestId: string;
	destLocation: ILocation;
}

export interface ICreateEmergencyContact {
	id?: string;
	contactName: string;
	contactNumber: string;
	contactEmail: string;
	contactAddress: string;
}

export interface EmergencyRequestInterface {}

export interface IServiceProvider {
	id: string;
	name: string;
	email: string;
	phoneNumber: string;
	isVerified: boolean;
	createdAt: string;
	updatedAt: string;
	role: "service_provider";
}

export interface IServiceProviderRegister {
	name: string;
	email: string;
	phoneNumber: string;
	password: string;
	serviceType: "police" | "fire_truck" | "ambulance" | "rescue_team";
}

export interface IServiceProviderUpdate {
	name?: string;
	email?: string;
	phoneNumber?: string;
	serviceType?: "police" | "fire_truck" | "ambulance" | "rescue_team";
}
