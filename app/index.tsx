import { Image, StyleSheet, Platform, Text } from 'react-native';
import { useEffect, useState } from 'react';

import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function HomeScreen() {
	const [location, setLocation] = useState<Location.LocationObject | null>(
		null
	);
	const [errorMsg, setErrorMsg] = useState<String | null>(null);

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				setErrorMsg('Permission to access location not granted');
				return;
			}

			let location = await Location.getCurrentPositionAsync();
			setLocation(location);
		})();
	}, []);

	return (
		<>
			<Text className="text-red-400 font-thin">
				{errorMsg ? errorMsg : 'Location Loaded'}
			</Text>
			{location && (
				<MapView
					style={styles.map}
					initialRegion={{
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					}}
				>
					<Marker
						coordinate={{
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
						}}
						title="You are here"
						description="This is your current location"
					/>
				</MapView>
			)}
			<MapView style={styles.map} />
		</>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	map: {
		width: '100%',
		height: '100%',
	},
});
