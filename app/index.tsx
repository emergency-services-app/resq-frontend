import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";
import React, { useState } from "react";

const Index = () => {
	const { isAuthenticated } = useAuthStore();

	if (!isAuthenticated) {
		return (
			<Redirect
				href="/(auth)/sign-in"
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
