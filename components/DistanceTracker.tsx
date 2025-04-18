import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import * as Location from 'expo-location';

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
	const r = 6371; // Earth's radius in kilometers
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) *
			Math.cos(toRad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = r * c; // Distance in kilometers
	return d;
};

const toRad = (value: number) => (value * Math.PI) / 180;

const DistanceTracker = () => {
	const [location, setLocation] =
		useState<Location.LocationObjectCoords | null>(null);

	const [distance, setDistance] = useState(0);
	const [prevLocation, setPrevLocation] =
		useState<Location.LocationObjectCoords | null>(null);

	useEffect(() => {
		const getLocationAsync = async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				console.log('debieeed');
			}
			let locations = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Balanced,
					timeInterval: 10000,
					distanceInterval: 1,
				},
				(loc) => setLocation(loc.coords)
			);
		};

		getLocationAsync();
	}, []);

	useEffect(() => {
		if (location && prevLocation) {
			const { latitude: lat1, longitude: lon1 } = prevLocation;
			const { latitude: lat2, longitude: lon2 } = location;
			const newDistance = distance + haversine(lat1, lon1, lat2, lon2);
			setDistance(newDistance);
		}
		setPrevLocation(location);
	}, [location]);

	return <Text>Distance traveled: {distance.toFixed(2)} km</Text>;
};

export default DistanceTracker;
