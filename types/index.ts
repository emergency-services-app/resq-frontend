export interface RegisterProps {
	name: string;
	age: number;
	email: string;
	phoneNumber: string;
	primaryAddress: string;
	password: string;
}

export interface LoginProps {
	phoneNumber: string;
	password: string;
}
