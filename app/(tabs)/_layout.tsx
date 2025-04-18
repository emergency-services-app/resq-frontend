import React from "react";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";

const _layout = () => {
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;

	return (
		<Tabs
			screenOptions={{
				tabBarStyle: {
					height: 60,
					paddingBottom: 8,
					paddingTop: 8,
					backgroundColor: theme.background,
					borderTopWidth: 1,
					borderTopColor: theme.border,
					elevation: 8,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: isDarkMode ? 0.3 : 0.1,
					shadowRadius: 4,
				},
				tabBarActiveTintColor: theme.primary,
				tabBarInactiveTintColor: theme.textSecondary,
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					tabBarIcon: ({ focused, color }) => (
						<Ionicons
							name={focused ? "home" : "home-outline"}
							size={24}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="emergency-numbers"
				options={{
					title: "Contacts",
					tabBarIcon: ({ focused, color }) => (
						<Ionicons
							name={focused ? "call" : "call-outline"}
							size={24}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ focused, color }) => (
						<Ionicons
							name={focused ? "person" : "person-outline"}
							size={24}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
};

export default _layout;
