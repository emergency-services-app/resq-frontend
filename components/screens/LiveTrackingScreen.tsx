import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { useSocketStore } from "@/store/socketStore";
import { SocketEventEnums } from "@/constants";

interface ILocation {
	latitude: number;
	longitude: number;
}

const LiveTrackingScreen = () => {
	const { emergencyResponseId, userLat, userLng, providerLat, providerLng } = useLocalSearchParams();

	const [providerLocation, setProviderLocation] = useState<ILocation>({
		latitude: parseFloat(providerLat as string),
		longitude: parseFloat(providerLng as string),
	});
	const currentLocation = {
		latitude: parseFloat(userLat as string),
		longitude: parseFloat(userLng as string),
	};
	const { socket, joinEmergencyRoom } = useSocketStore();

	useEffect(() => {
		if (!socket || !emergencyResponseId) return;

		// Join the emergency room
		joinEmergencyRoom(emergencyResponseId as string, "user-id", "provider-id");

		socket.on(SocketEventEnums.UPDATE_LOCATION, (data) => {
			console.log("📍 Provider Location Update:", data);
			setProviderLocation(data.location);
		});

		return () => {
			socket.off(SocketEventEnums.UPDATE_LOCATION);
		};
	}, [socket, emergencyResponseId]);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<Text style={styles.header}>Live Tracking</Text>
			<MapView
				style={{ flex: 1 }}
				initialRegion={{
					...currentLocation,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				}}
			>
				<Marker
					coordinate={currentLocation}
					title="You"
					pinColor="blue"
				/>

				<Marker
					coordinate={providerLocation}
					title="Provider"
					pinColor="red"
				/>
				<Polyline
					coordinates={[currentLocation, providerLocation]}
					strokeWidth={4}
					strokeColor="#007AFF"
				/>
			</MapView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	header: {
		textAlign: "center",
		fontWeight: "bold",
		fontSize: 16,
		padding: 10,
	},
});

export default LiveTrackingScreen;
