import { AVAILABLE_SERVICES } from "@/constants";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useRouter } from "expo-router";

const services = AVAILABLE_SERVICES.map((service) => ({
	title: capitalizeFirstLetter(service).replace("_", " "),
	// iconPath: require(`@/assets/images/${service}.png`),
	iconPath: "",
}));

const EmergencyServicesScreen = () => {
	const router = useRouter();
	const services: { name: string; icon: "ambulance" | "fire-extinguisher" | "shield" | "car" }[] = [
		{ name: "Ambulance", icon: "ambulance" },
		{ name: "Fire brigade", icon: "fire-extinguisher" },
		{ name: "Police", icon: "shield" },
		{ name: "Rescue", icon: "car" },
	];

	const pastServices = [
		{ name: "Ambulance", time: "2023-10-27 10:30 AM" },
		{ name: "Police", time: "2023-10-25 03:15 PM" },
		{ name: "Fire Brigade", time: "2023-10-20 08:00 AM" },
	];

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Emergency Services</Text>
			</View>

			<View style={styles.greetingContainer}>
				<Text style={styles.welcome}>Welcome,</Text>
				<Text style={styles.username}>Anuska</Text>
			</View>

			<Text style={styles.title}>Are you in emergency?</Text>
			<Text style={styles.subtitle}>Select the service you need assistance with.</Text>

			<View style={styles.serviceGrid}>
				{services.map((service, index) => (
					<TouchableOpacity
						key={index}
						style={styles.serviceButton}
						onPress={() => router.push(`/service/${service.name}`)}
					>
						<Icon
							name={service.icon}
							size={30}
							color="#000"
						/>
						<Text style={styles.serviceText}>{service.name}</Text>
					</TouchableOpacity>
				))}
			</View>

			<View style={styles.pastContainer}>
				<Text style={styles.pastTitle}>Past Emergency Services</Text>
				{pastServices.map((item, index) => (
					<Text
						key={index}
						style={styles.pastItem}
					>
						{item.name} <Text style={styles.pastTime}>{item.time}</Text>
					</Text>
				))}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		padding: 16,
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	backArrow: {
		fontSize: 20,
		marginRight: 10,
	},
	headerText: {
		fontSize: 18,
		fontWeight: "bold",
	},
	greetingContainer: {
		marginBottom: 10,
	},
	welcome: {
		fontSize: 22,
		fontWeight: "bold",
	},
	username: {
		fontSize: 18,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginVertical: 10,
	},
	subtitle: {
		fontSize: 14,
		color: "#555",
		marginBottom: 20,
	},
	serviceGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	serviceButton: {
		width: "47%",
		backgroundColor: "#ddd",
		borderRadius: 12,
		padding: 20,
		alignItems: "center",
		marginBottom: 15,
	},
	serviceText: {
		marginTop: 10,
		fontSize: 16,
		fontWeight: "500",
	},
	pastContainer: {
		backgroundColor: "#eee",
		borderRadius: 12,
		padding: 16,
		marginTop: 20,
	},
	pastTitle: {
		fontWeight: "bold",
		fontSize: 16,
		marginBottom: 10,
	},
	pastItem: {
		fontSize: 14,
		marginBottom: 6,
	},
	pastTime: {
		color: "#444",
		fontSize: 13,
	},
});

export default EmergencyServicesScreen;
