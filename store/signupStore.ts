import { create } from "zustand";

interface SignUpFormData {
	name: string;
	age: string;
	email: string;
	phoneNumber: string;
	primaryAddress: string;
	password: string;
	confirmPassword: string;
	acceptedTerms: boolean;
}

interface SignUpStore {
	formData: SignUpFormData;
	setFormData: (data: Partial<SignUpFormData>) => void;
	resetForm: () => void;
}

const initialFormData: SignUpFormData = {
	name: "",
	age: "",
	email: "",
	phoneNumber: "",
	primaryAddress: "",
	password: "",
	confirmPassword: "",
	acceptedTerms: false,
};

export const useSignUpStore = create<SignUpStore>((set) => ({
	formData: initialFormData,
	setFormData: (data) =>
		set((state) => ({
			formData: { ...state.formData, ...data },
		})),
	resetForm: () => set({ formData: initialFormData }),
}));
