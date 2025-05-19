import { SocketEventEnums } from "@/constants";
import { darkTheme, lightTheme } from "@/constants/theme";
import { defineServiceStatus } from "@/lib/utils";
import { updateServiceProviderStatus } from "@/services/api/service-provider";
import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";
import { useThemeStore } from "@/store/themeStore";
import { Fragment, useEffect, useState } from "react";
import { View, Text, Switch, StyleSheet, Alert } from "react-native";

const ServiceProviderStatus = () => {
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;

	const user = useAuthStore((state) => state.serviceProvider);
	const isAvailable = useAuthStore((state) => state.serviceProvider.serviceStatus === "available");
	const setProviderStatus = useAuthStore((state) => state.setProviderStatus);

	const { socket } = useSocketStore();

	const [isUpdating, setIsUpdating] = useState(false);

	const handleStatusChange = async (newStatus: boolean) => {
		try {
			setIsUpdating(true);
			const status = newStatus ? "available" : "off_duty";
			await updateServiceProviderStatus({ status });
			setProviderStatus(status);
		} catch (error: any) {
			Alert.alert("Error", error.response?.data?.message || "Failed to update status. Please try again.");
		} finally {
			setIsUpdating(false);
		}
	};

	useEffect(() => {
		if (!socket) {
			return;
		}

		const handleStatusUpdate = (data: { status: string }) => {
			console.log("[ServiceProviderDashboard] Status update received:", data);
			const newStatus = data.status === "available";
			setProviderStatus(data.status);
		};

		socket.on(SocketEventEnums.PROVIDER_STATUS_UPDATED, handleStatusUpdate);

		return () => {
			socket.off(SocketEventEnums.PROVIDER_STATUS_UPDATED, handleStatusUpdate);
		};
	}, [socket]);

	return (
		<Fragment>
			<View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
				<View style={styles.statusHeader}>
					<Text style={[styles.statusTitle, { color: theme.text }]}>Service Status</Text>
					<Switch
						value={isAvailable}
						onValueChange={handleStatusChange}
						trackColor={{ false: theme.border, true: theme.primary }}
						thumbColor={isAvailable ? "#fff" : "#f4f3f4"}
						disabled={isUpdating}
					/>
				</View>
				<Text style={[styles.statusText, { color: isAvailable ? theme.success : theme.error }]}>
					{isAvailable ? "Available for Service" : "Currently Unavailable"}
				</Text>
			</View>
		</Fragment>
	);
};

const styles = StyleSheet.create({
	statusCard: {
		padding: 20,
		borderRadius: 12,
		marginBottom: 20,
	},
	statusHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	statusTitle: {
		fontSize: 18,
		fontWeight: "600",
	},
	statusText: {
		fontSize: 16,
	},
});

export default ServiceProviderStatus;
