import { View, Text, Alert, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import RequestServiceScreen from "@/components/screens/RequestServiceScreen";
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import { useLocationStore } from "@/store/locationStore";

const ServiceCurrent = () => {
	const router = useRouter();
	const params = useGlobalSearchParams();

	const { requestId, assignedProvider } = useLocalSearchParams();
	console.log(requestId, assignedProvider);

	const serviceType = params.id;
	if (!serviceType || typeof serviceType !== "string") {
		Alert.alert("No service type found");
		router.push("/(tabs)/home");
		return null;
	}

	const { location, getLocation } = useLocationStore();

	useEffect(() => {
		const fetchLocation = async () => {
			if (!location) {
				await getLocation();
			}
		};
		fetchLocation();
	}, [location]);

	if (!location) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator
					size="large"
					color="#0000ff"
				/>
				<Text>Accessing your location. Please wait.</Text>
			</View>
		);
	}

	return <RequestServiceScreen selectedServiceType={serviceType} />;
};

export default ServiceCurrent;
