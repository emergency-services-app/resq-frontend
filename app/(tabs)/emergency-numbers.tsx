import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Linking,
	SafeAreaView,
	StatusBar,
	ActivityIndicator,
	Alert,
} from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "../../store/themeStore";
import { lightTheme, darkTheme } from "../../constants/theme";
import { getUsersContacts, deleteContact } from "../../services/api/emergency-contacts";

const EmergencyContactsScreen = () => {
	const router = useRouter();
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const [userContacts, setUserContacts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadContacts();
	}, []);

	const loadContacts = async () => {
		try {
			setLoading(true);
			const response = await getUsersContacts();
			setUserContacts(response.data.data);
			setError(null);
		} catch (err) {
			setError("Failed to load contacts");
			console.log("Contacts fetch error:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteContact = async (id: string) => {
		Alert.alert("Delete Contact", "Are you sure you want to delete this contact?", [
			{
				text: "Cancel",
				style: "cancel",
			},
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteContact(id);
						Alert.alert("Success", "Contact deleted successfully");
						loadContacts(); // Reload the contacts list
					} catch (error) {
						Alert.alert("Error", "Failed to delete contact");
					}
				},
			},
		]);
	};

	const emergencyServices = [
		{
			title: "Police",
			description: "Emergency Response",
			number: "100",
			icon: "shield" as const,
			color: theme.primary,
		},
		{
			title: "Ambulance",
			description: "Medical Emergency",
			number: "108",
			icon: "ambulance" as const,
			color: theme.primary,
		},
		{
			title: "Fire Brigade",
			description: "Fire Emergency",
			number: "101",
			icon: "fire-extinguisher" as const,
			color: theme.primary,
		},
	];

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
				backgroundColor={theme.background}
			/>
			<ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
				<LinearGradient
					colors={[theme.background, theme.surface]}
					style={styles.header}
				>
					{/* <TouchableOpacity
						style={styles.backButton}
						onPress={() => router.back()}
					>
						<Ionicons
							name="arrow-back"
							size={24}
							color={theme.text}
						/>
					</TouchableOpacity> */}
					<Text style={[styles.headerText, { color: theme.text }]}>Emergency Contacts</Text>
					<Text style={[styles.headerSubtext, { color: theme.textSecondary }]}>Quick access to emergency services</Text>
				</LinearGradient>

				<View style={styles.content}>
					<Text style={[styles.sectionTitle, { color: theme.text }]}>Emergency Services</Text>
					{emergencyServices.map((service, index) => (
						<TouchableOpacity
							key={index}
							style={[styles.card, { backgroundColor: theme.surface }]}
							onPress={() => Linking.openURL(`tel:${service.number}`)}
						>
							<View style={[styles.iconContainer, { backgroundColor: service.color }]}>
								<Icon
									name={service.icon}
									size={24}
									color="#fff"
								/>
							</View>
							<View style={styles.serviceInfo}>
								<Text style={[styles.cardTitle, { color: theme.text }]}>{service.title}</Text>
								<Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{service.description}</Text>
								<Text style={[styles.cardNumber, { color: service.color }]}>{service.number}</Text>
							</View>
							<TouchableOpacity
								style={[styles.callButton, { backgroundColor: service.color }]}
								onPress={() => Linking.openURL(`tel:${service.number}`)}
							>
								<Icon
									name="phone"
									size={20}
									color="#fff"
								/>
							</TouchableOpacity>
						</TouchableOpacity>
					))}

					<View style={styles.closeContactsHeader}>
						<Text style={[styles.sectionTitle, { color: theme.text }]}>User Contacts</Text>
						<TouchableOpacity onPress={() => router.push("/add-emergency-contact")}>
							<Text style={[styles.addText, { color: theme.primary }]}>+Add</Text>
						</TouchableOpacity>
					</View>

					{loading ? (
						<ActivityIndicator
							size="large"
							color={theme.primary}
						/>
					) : error ? (
						<Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
					) : userContacts.length === 0 ? (
						<Text style={[styles.emptyText, { color: theme.textSecondary }]}>No user contacts found</Text>
					) : (
						userContacts.map((contact) => (
							<View
								key={contact.id}
								style={[styles.card, { backgroundColor: theme.surface }]}
							>
								<View style={styles.contactInfo}>
									<View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
										<Icon
											name="user-o"
											size={24}
											color="#fff"
										/>
									</View>
									<View>
										<Text style={[styles.contactName, { color: theme.text }]}>{contact.name}</Text>
										<Text style={[styles.contactRelation, { color: theme.textSecondary }]}>{contact.relationship}</Text>
										<Text style={[styles.contactRelation, { color: theme.textSecondary }]}>{contact.phoneNumber}</Text>
									</View>
								</View>
								<View style={styles.contactActions}>
									<TouchableOpacity
										style={[styles.actionButton, { backgroundColor: theme.primary }]}
										onPress={() => router.push(`/edit-emergency-contact?id=${contact.id}`)}
									>
										<Icon
											name="edit"
											size={16}
											color="#fff"
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.actionButton, { backgroundColor: theme.error }]}
										onPress={() => handleDeleteContact(contact.id)}
									>
										<Icon
											name="trash"
											size={16}
											color="#fff"
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.callButton, { backgroundColor: theme.primary }]}
										onPress={() => Linking.openURL(`tel:${contact.phoneNumber}`)}
									>
										<Icon
											name="phone"
											size={20}
											color="#fff"
										/>
									</TouchableOpacity>
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
	backButton: {
		position: "absolute",
		left: 15,
		top: 15,
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
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 15,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		padding: 20,
		borderRadius: 16,
		marginBottom: 15,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	iconContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 15,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
	},
	serviceInfo: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "600",
	},
	cardSubtitle: {
		fontSize: 14,
		marginTop: 4,
	},
	cardNumber: {
		fontSize: 16,
		fontWeight: "bold",
		marginTop: 4,
	},
	closeContactsHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 20,
		marginBottom: 15,
	},
	addText: {
		fontWeight: "600",
		fontSize: 14,
	},
	contactInfo: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
	},
	contactName: {
		fontSize: 16,
		fontWeight: "600",
	},
	contactRelation: {
		fontSize: 14,
		marginTop: 4,
	},
	contactActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	actionButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
	callButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 16,
		fontWeight: "500",
		textAlign: "center",
		marginTop: 20,
	},
	emptyText: {
		fontSize: 16,
		fontWeight: "500",
		textAlign: "center",
		marginTop: 20,
	},
});

export default EmergencyContactsScreen;
