export const userEndpoints = {
	register: "/user/register",
	login: "/user/login",
	logout: "/user/logout",
	verify: "/user/verify",
	resetPassword: "/user/reset-password",
	changePassword: "/user/change-password",
	getProfile: "/user/profile",
	forgotPassword: "/user/forgot-password",
	updateUser: "/user/update",
};

export const emergencyRequestEndpoints = {
	create: "/emergency-request",
	getUsersRequests: "/emergency-request",
	getRequestById: (id: string) => `/emergency-request/${id}`,
	updateRequest: (id: string) => `/emergency-request/${id}`,
	deleteRequest: (id: string) => `/emergency-request/${id}`,
};

export const emergencyResponseEndpoints = {
	create: "/emergency-response",
	getUsersResponses: "/emergency-response",
	getResponseById: (id: string) => `/emergency-response/${id}`,
	updateResponse: (id: string) => `/emergency-response/${id}`,
	deleteResponse: (id: string) => `/emergency-response/${id}`,
};

export const emergencyContactsEndpoints = {
	create: "/emergency-contacts",
	getUsersContacts: "/emergency-contacts",
	getContactById: (id: string) => `/emergency-contacts/${id}`,
	updateContact: (id: string) => `/emergency-contacts/${id}`,
	deleteContact: (id: string) => `/emergency-contacts/${id}`,
	getCommonContacts: "/emergency-contacts/common",
};

export const feedbackEndpoints = {};

export const serviceProviderEndpoints = {
	register: "/service-provider/register",
	login: "/service-provider/login",
	logout: "/service-provider/logout",
	verify: "/service-provider/verify",
	resetPassword: "/service-provider/reset-password",
	changePassword: "/service-provider/change-password",
	getProfile: "/service-provider/profile",
	forgotPassword: "/service-provider/forgot-password",
	getById: (id: string) => `/service-provider/${id}`,
	update: "/service-provider/update",
};

export const mapsEndpoints = {
	getAutoComplete: (query: string, lat: number, lng: number) => `/maps/autocomplete?q=${query}&lat=${lat}&lng=${lng}`,
	getOptimalRoute: (origin: string, destination: string) =>
		`/maps/optimal-route?origin=${origin}&destination=${destination}`,
};
