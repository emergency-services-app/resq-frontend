import React from "react";
import { Redirect, Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/authContext";

const _layout = () => {
	return (
		<Tabs
			screenOptions={{
				tabBarShowLabel: false,
				tabBarStyle: {
					width: "100%",
					justifyContent: "center",
					alignItems: "center",
					borderTopLeftRadius: 50,
					borderTopRightRadius: 50,
				},
				tabBarIconStyle: {},
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name="home-outline"
							size={24}
							color={focused ? "blue" : "black"}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name="person-outline"
							size={24}
							color={focused ? "blue" : "black"}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="emergencyNumbers"
				options={{
					title: "Emergency Numbers",
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name="call-outline"
							size={24}
							color={focused ? "blue" : "black"}
						/>
					),
				}}
			/>
		</Tabs>
	);
};

export default _layout;
