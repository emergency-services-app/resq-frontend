import { useAuth } from "@/context/authContext";
import { Redirect, Stack } from "expo-router";
import React from "react";

const Index = () => {
	const { authState } = useAuth();

	if (!authState?.authenticated) {
		return (
			<Redirect
				href="/sign-in"
				relativeToDirectory={false}
			/>
		);
	}

	return (
		<Redirect
			href="/(tabs)/home"
			relativeToDirectory={false}
		/>
	);
};

export default Index;
