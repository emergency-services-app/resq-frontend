import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	StatusBar,
	TouchableOpacity,
	RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeStore } from "../../store/themeStore";
import { lightTheme, darkTheme } from "../../constants/theme";

interface IRequest {
	id: string;
	userId: string;
	userName: string;
	userPhone: string;
	status: "pending" | "accepted" | "rejected";
	location: {
		latitude: number;
		longitude: number;
	};
	createdAt: string;
}

const ServiceProviderDashboard = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;

	const [requests, setRequests] = useState<IRequest[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const fetchRequests = async () => {
		try {
			// TODO: Implement API call to fetch requests
			// const response = await getServiceProviderRequests();
			// setRequests(response.data);
		} catch (error) {
			console.error("Error fetching requests:", error);
		}
	};

	const handleAcceptRequest = async (requestId: string) => {
		try {
			// TODO: Implement API call to accept request
			// await acceptRequest(requestId);
			// Update local state
			setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "accepted" } : req)));
		} catch (error) {
			console.error("Error accepting request:", error);
		}
	};

	const handleRejectRequest = async (requestId: string) => {
		try {
			// TODO: Implement API call to reject request
			// await rejectRequest(requestId);
			// Update local state
			setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" } : req)));
		} catch (error) {
			console.error("Error rejecting request:", error);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchRequests();
		setRefreshing(false);
	};

	useEffect(() => {
		fetchRequests();
	}, []);

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
				backgroundColor={theme.background}
			/>
			<ScrollView
				style={[styles.container, { backgroundColor: theme.background }]}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={theme.primary}
					/>
				}
			>
				<LinearGradient
					colors={[theme.background, theme.surface]}
					style={styles.header}
				>
					<Text style={[styles.headerText, { color: theme.text }]}>Service Provider Dashboard</Text>
					<Text style={[styles.headerSubtext, { color: theme.textSecondary }]}>Manage emergency requests</Text>
				</LinearGradient>

				<View style={styles.content}>
					{requests.length === 0 ? (
						<View style={styles.emptyState}>
							<Ionicons
								name="alert-circle-outline"
								size={48}
								color={theme.textSecondary}
							/>
							<Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>No pending requests</Text>
						</View>
					) : (
						requests.map((request) => (
							<View
								key={request.id}
								style={[styles.requestCard, { backgroundColor: theme.surface }]}
							>
								<View style={styles.requestHeader}>
									<View style={styles.userInfo}>
										<Icon
											name="user"
											size={20}
											color={theme.text}
											style={styles.userIcon}
										/>
										<Text style={[styles.userName, { color: theme.text }]}>{request.userName}</Text>
									</View>
									<Text
										style={[
											styles.requestStatus,
											{
												color:
													request.status === "pending"
														? theme.warning
														: request.status === "accepted"
														? theme.success
														: theme.error,
											},
										]}
									>
										{request.status.charAt(0).toUpperCase() + request.status.slice(1)}
									</Text>
								</View>

								<View style={styles.requestDetails}>
									<View style={styles.detailRow}>
										<Icon
											name="phone"
											size={16}
											color={theme.textSecondary}
										/>
										<Text style={[styles.detailText, { color: theme.text }]}>{request.userPhone}</Text>
									</View>
									<View style={styles.detailRow}>
										<Icon
											name="clock-o"
											size={16}
											color={theme.textSecondary}
										/>
										<Text style={[styles.detailText, { color: theme.text }]}>
											{new Date(request.createdAt).toLocaleString()}
										</Text>
									</View>
								</View>

								{request.status === "pending" && (
									<View style={styles.actionButtons}>
										<TouchableOpacity
											style={[styles.actionButton, { backgroundColor: theme.success }]}
											onPress={() => handleAcceptRequest(request.id)}
										>
											<Text style={styles.actionButtonText}>Accept</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={[styles.actionButton, { backgroundColor: theme.error }]}
											onPress={() => handleRejectRequest(request.id)}
										>
											<Text style={styles.actionButtonText}>Reject</Text>
										</TouchableOpacity>
									</View>
								)}
							</View>
						))
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
	},
	header: {
		padding: 15,
		paddingTop: 15,
		paddingBottom: 15,
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
		marginBottom: 20,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
	},
	headerSubtext: {
		fontSize: 14,
		textAlign: "center",
		marginTop: 5,
	},
	content: {
		padding: 20,
	},
	emptyState: {
		alignItems: "center",
		justifyContent: "center",
		padding: 40,
	},
	emptyStateText: {
		fontSize: 16,
		marginTop: 10,
	},
	requestCard: {
		borderRadius: 12,
		padding: 15,
		marginBottom: 15,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	requestHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	userInfo: {
		flexDirection: "row",
		alignItems: "center",
	},
	userIcon: {
		marginRight: 8,
	},
	userName: {
		fontSize: 16,
		fontWeight: "600",
	},
	requestStatus: {
		fontSize: 14,
		fontWeight: "600",
	},
	requestDetails: {
		marginBottom: 15,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 5,
	},
	detailText: {
		fontSize: 14,
		marginLeft: 8,
	},
	actionButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	actionButton: {
		flex: 1,
		height: 40,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginHorizontal: 5,
	},
	actionButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
});

export default ServiceProviderDashboard;
