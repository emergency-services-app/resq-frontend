import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Icon from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { capitalizeFirstLetter } from "@/lib/utils";

interface ILocation {
	latitude: number;
	longitude: number;
	latitudeDelta?: number;
	longitudeDelta?: number;
}

interface EmergencyMapScreenProps {
	selectedServiceType?: string;
	currentLocation: ILocation;
	destinationLocation?: ILocation;
}

const EmergencyMapScreen: React.FC<EmergencyMapScreenProps> = ({
	selectedServiceType = "ambulance",
	currentLocation,
	destinationLocation,
}) => {
	const router = useRouter();
	console.log(currentLocation, "location");

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text onPress={() => router.back()}>
					<Ionicons
						name="arrow-back-outline"
						size={24}
						color="black"
					/>
				</Text>
				<Text style={styles.headerText}>Emergency Services</Text>
			</View>

			<MapView
				style={styles.map}
				initialRegion={{
					latitude: currentLocation.latitude,
					longitude: currentLocation.longitude,
					latitudeDelta: currentLocation.latitudeDelta || 0.0922,
					longitudeDelta: currentLocation.longitudeDelta || 0.0421,
				}}
			>
				<Marker coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }} />
				{/* <Marker coordinate={{ latitude: 17.39, longitude: 78.49 }} /> */}
			</MapView>

			<View style={styles.card}>
				<Text style={styles.label}>Pick up</Text>
				<View style={styles.inputBox}>
					<Icon
						name="map-marker"
						size={24}
						color="#444"
					/>
					<TextInput
						style={styles.input}
						placeholder="Siddhartha Model School..."
					/>
				</View>

				<Text style={styles.label}>Selected Service:</Text>
				<View style={styles.inputBox}>
					<Icon
						name="lock"
						size={18}
						color="#444"
					/>
					<Text style={styles.input}>{capitalizeFirstLetter(selectedServiceType) || "None"}</Text>
				</View>

				<TouchableOpacity style={styles.requestBtn}>
					<Text style={styles.requestText}>Request Service</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default EmergencyMapScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f8f8",
	},
	header: {
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 14,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	headerText: {
		fontSize: 16,
		fontWeight: "600",
	},
	map: {
		flex: 1,
	},
	card: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "white",
		padding: 16,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 10,
	},
	label: {
		fontWeight: "bold",
		marginTop: 8,
	},
	inputBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: "#f2f2f2",
		borderRadius: 10,
		paddingHorizontal: 14,
		paddingVertical: 6,
		marginTop: 6,
	},
	input: {
		flex: 1,
	},
	feedback: {
		marginTop: 10,
		color: "#777",
		fontStyle: "italic",
	},
	requestBtn: {
		marginTop: 14,
		backgroundColor: "#ddd",
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: "center",
	},
	requestText: {
		fontWeight: "600",
	},
	bottomNav: {
		flexDirection: "row",
		justifyContent: "space-around",
		backgroundColor: "white",
		paddingVertical: 10,
		borderTopColor: "#ccc",
		borderTopWidth: 1,
	},
});
