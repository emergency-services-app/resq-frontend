import { LoginProps, RegisterProps } from "@/types";
import { createContext, useContext, useState } from "react";
import { loginUser, logoutUser, registerUser } from "@/services/api/auth";
import { TOKEN_KEY } from "@/constants";
import * as SecureStore from "expo-secure-store";

interface IAuthContext {
	authState?: { token: string | null; authenticated: boolean | null };
	registerAction?: ({
		name,
		age,
		email,
		phoneNumber,
		primaryAddress,
		password,
	}: RegisterProps) => Promise<any>;
	loginAction?: ({ phoneNumber, password }: LoginProps) => Promise<any>;
	logOutAction?: () => Promise<any>;
}

const AuthContext = createContext<IAuthContext>({});

export const useAuth = () => {
	const value = useContext(AuthContext);
	if (process.env.NODE_ENV !== "production") {
		if (!value) {
			throw new Error("useSession must be wrapped in a <SessionProvider />");
		}
	}
	return value;
};

export const AuthProvider = ({ children }: any) => {
	const [authState, setAuthState] = useState<{
		token: string | null;
		authenticated: boolean | null;
	}>({
		token: null,
		authenticated: null,
	});

	const loginHandler = async (data: LoginProps) => {
		try {
			const response = await loginUser(data);
			const token = response.data.token;
			await SecureStore.setItemAsync(TOKEN_KEY, token);
			setAuthState({ token, authenticated: true });
			return response.message || "Login successful!";
		} catch (error: any) {
			console.log("Error logging in:", error.message);
			throw error;
		}
	};

	const logoutHandler = async () => {
		try {
			const response = await logoutUser();
			await SecureStore.deleteItemAsync(TOKEN_KEY);
			setAuthState({ token: null, authenticated: false });
		} catch (error: any) {
			console.log("Error logging out:", error.message);
			throw error;
		}
	};

	const registerHandler = async (data: RegisterProps) => {
		try {
			const response = await registerUser(data);
			return response.message || "Registration successful!";
		} catch (error: any) {
			console.log("Error registering:", error.message);
			throw error;
		}
	};

	const value: IAuthContext = {
		authState,
		loginAction: loginHandler,
		registerAction: registerHandler,
		logOutAction: logoutHandler,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
