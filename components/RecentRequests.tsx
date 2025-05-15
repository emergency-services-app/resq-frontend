import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { getRecentEmergencyRequests } from "@/services/api/emergency-request";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import type { IEmergencyRequest } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";

const RecentRequests = () => {
	const [recentRequests, setRecentRequests] = useState<IEmergencyRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const router = useRouter();

	useEffect(() => {
		fetchRecentRequests();
	}, []);

	const fetchRecentRequests = async () => {
		try {
			setLoading(true);
			const response = await getRecentEmergencyRequests();
			if (response) {
				setRecentRequests(response.data);
			}
		} catch (error) {
			setError("Failed to fetch recent requests");
			console.error("Error fetching recent requests:", error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return theme.warning;
			case "assigned":
				return theme.info;
			case "in_progress":
				return theme.primary;
			case "rejected":
				return theme.error;
			default:
				return theme.text;
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return "time";
			case "assigned":
				return "checkmark-circle";
			case "in_progress":
				return "car";
			case "rejected":
				return "close-circle";
			default:
				return "help-circle";
		}
	};

	const renderItem = ({ item }: { item: IEmergencyRequest }) => (
		<TouchableOpacity
			style={[styles.requestCard, { backgroundColor: theme.surface }]}
			onPress={() => router.push(`/(maps)/live-tracking?emergencyResponseId=${item.id}`)}
		>
			<View style={styles.cardHeader}>
				<View style={styles.serviceType}>
					<Text style={[styles.serviceTypeText, { color: theme.text }]}>{item.serviceType}</Text>
				</View>
				<View style={[styles.status, { backgroundColor: getStatusColor(item.requestStatus) }]}>
					<Ionicons
						name={getStatusIcon(item.requestStatus)}
						size={16}
						color="#fff"
						style={styles.statusIcon}
					/>
					<Text style={styles.statusText}>{item.requestStatus}</Text>
				</View>
			</View>

			<View style={styles.cardBody}>
				<Text style={[styles.timestamp, { color: theme.textSecondary }]}>
					{format(new Date(item.requestTime), "MMM d, yyyy h:mm a")}
				</Text>
				{item.description && (
					<Text
						style={[styles.description, { color: theme.text }]}
						numberOfLines={2}
					>
						{item.description}
					</Text>
				)}
			</View>
		</TouchableOpacity>
	);

	if (loading) {
		return (
			<View style={styles.centerContainer}>
				<ActivityIndicator
					size="large"
					color={theme.primary}
				/>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centerContainer}>
				<Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
				<TouchableOpacity
					style={[styles.retryButton, { backgroundColor: theme.primary }]}
					onPress={fetchRecentRequests}
				>
					<Text style={styles.retryButtonText}>Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={[styles.title, { color: theme.text }]}>Recent Requests</Text>
			<FlatList
				data={recentRequests}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.listContainer}
				ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textSecondary }]}>No recent requests</Text>}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 16,
	},
	listContainer: {
		flexGrow: 1,
	},
	requestCard: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	serviceType: {
		flex: 1,
	},
	serviceTypeText: {
		fontSize: 16,
		fontWeight: "600",
	},
	status: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusIcon: {
		marginRight: 4,
	},
	statusText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "500",
		textTransform: "capitalize",
	},
	cardBody: {
		gap: 8,
	},
	timestamp: {
		fontSize: 14,
	},
	description: {
		fontSize: 14,
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 16,
	},
	errorText: {
		fontSize: 16,
		marginBottom: 16,
		textAlign: "center",
	},
	retryButton: {
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "500",
	},
	emptyText: {
		textAlign: "center",
		fontSize: 16,
		marginTop: 24,
	},
});

export default RecentRequests;
