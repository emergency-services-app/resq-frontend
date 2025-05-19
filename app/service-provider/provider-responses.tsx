import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	StatusBar,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { getEmergencyResponses, getProviderResponses } from "@/services/api/emergency-response";
import { format } from "date-fns";

interface EmergencyResponse {
	id: string;
	emergencyRequestId: string;
	serviceProviderId: string;
	statusUpdate: string;
	originLocation: {
		latitude: string;
		longitude: string;
	};
	destinationLocation: {
		latitude: string;
		longitude: string;
	};
	assignedAt: string;
	respondedAt: string;
	updateDescription: string | null;
	createdAt: string;
	updatedAt: string;
}

const ProviderResponsesScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const [responses, setResponses] = useState<EmergencyResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchResponses();
	}, []);

	const fetchResponses = async () => {
		try {
			setIsLoading(true);
			const data = await getProviderResponses();
			setResponses(data.data.data);
		} catch (error) {
			console.error("Error fetching responses:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return theme.success;
			case "rejected":
				return theme.error;
			case "arrived":
				return theme.primary;
			default:
				return theme.textSecondary;
		}
	};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
				backgroundColor={theme.background}
			/>
			<LinearGradient
				colors={[theme.background, theme.surface]}
				style={styles.header}
			>
				<View style={styles.headerContent}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}
					>
						<Ionicons
							name="arrow-back"
							size={24}
							color={theme.text}
						/>
					</TouchableOpacity>
					<Text style={[styles.headerText, { color: theme.text }]}>Response History</Text>
				</View>
			</LinearGradient>

			<ScrollView
				style={[styles.container, { backgroundColor: theme.background }]}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.content}>
					{isLoading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator
								size="large"
								color={theme.primary}
							/>
						</View>
					) : responses.length === 0 ? (
						<View style={styles.emptyContainer}>
							<Ionicons
								name="time-outline"
								size={64}
								color={theme.textSecondary}
							/>
							<Text style={[styles.emptyText, { color: theme.textSecondary }]}>No response history yet</Text>
						</View>
					) : (
						responses.map((response) => (
							<View
								key={response.id}
								style={[styles.responseCard, { backgroundColor: theme.surface }]}
							>
								<View style={styles.responseHeader}>
									<View style={styles.emergencyType}>
										<Ionicons
											name="alert-circle"
											size={20}
											color={theme.primary}
										/>
										<Text style={[styles.emergencyTypeText, { color: theme.text }]}>Emergency Response</Text>
									</View>
									<View style={[styles.statusBadge, { backgroundColor: getStatusColor(response.statusUpdate) }]}>
										<Text style={styles.statusText}>{response.statusUpdate}</Text>
									</View>
								</View>

								<View style={styles.responseDetails}>
									<View style={styles.detailRow}>
										<Ionicons
											name="location"
											size={16}
											color={theme.textSecondary}
										/>
										<Text style={[styles.detailText, { color: theme.text }]}>
											Origin: {response.originLocation.latitude}, {response.originLocation.longitude}
										</Text>
									</View>
									<View style={styles.detailRow}>
										<Ionicons
											name="location"
											size={16}
											color={theme.textSecondary}
										/>
										<Text style={[styles.detailText, { color: theme.text }]}>
											Destination: {response.destinationLocation.latitude}, {response.destinationLocation.longitude}
										</Text>
									</View>
									{response.updateDescription && (
										<View style={styles.detailRow}>
											<Ionicons
												name="information-circle"
												size={16}
												color={theme.textSecondary}
											/>
											<Text style={[styles.detailText, { color: theme.text }]}>{response.updateDescription}</Text>
										</View>
									)}
								</View>

								<View style={styles.responseFooter}>
									<Text style={[styles.timestamp, { color: theme.textSecondary }]}>
										Assigned: {format(new Date(response.assignedAt), "MMM dd, yyyy hh:mm a")}
									</Text>
									<Text style={[styles.timestamp, { color: theme.textSecondary }]}>
										Responded: {format(new Date(response.respondedAt), "MMM dd, yyyy hh:mm a")}
									</Text>
								</View>
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
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	backButton: {
		marginRight: 15,
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
	},
	content: {
		padding: 20,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	emptyText: {
		fontSize: 16,
		marginTop: 10,
	},
	responseCard: {
		padding: 15,
		borderRadius: 12,
		marginBottom: 15,
	},
	responseHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	emergencyType: {
		flexDirection: "row",
		alignItems: "center",
	},
	emergencyTypeText: {
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 5,
	},
	statusBadge: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 12,
	},
	statusText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	responseDetails: {
		marginBottom: 10,
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
	responseFooter: {
		borderTopWidth: 1,
		borderTopColor: "rgba(0,0,0,0.1)",
		paddingTop: 10,
	},
	timestamp: {
		fontSize: 12,
	},
});

export default ProviderResponsesScreen;
