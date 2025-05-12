import React, { useState, useCallback } from "react";
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { searchLocation } from "@/services/api/location";
import Icon from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";

interface LocationSearchProps {
	onLocationSelect: (location: { lat: string; lon: string; display_name: string }) => void;
	placeholder?: string;
}

interface LocationResult {
	place_id: string;
	display_name: string;
	lat: string;
	lon: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect, placeholder = "Search location..." }) => {
	const { isDarkMode } = useThemeStore();
	const theme = isDarkMode ? darkTheme : lightTheme;
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<LocationResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSearch = useCallback(async (query: string) => {
		if (!query.trim()) {
			setResults([]);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			const response = await searchLocation(query);
			setResults(response.data.data);
		} catch (error) {
			console.error("Error searching location:", error);
			setError("Failed to search location. Please try again.");
			setResults([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleLocationSelect = (location: LocationResult) => {
		onLocationSelect({
			lat: location.lat,
			lon: location.lon,
			display_name: location.display_name,
		});
		setSearchQuery(location.display_name);
		setResults([]);
	};

	return (
		<View style={styles.container}>
			<View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
				<Icon
					name="search"
					size={20}
					color={theme.text}
					style={styles.searchIcon}
				/>
				<TextInput
					style={[styles.input, { color: theme.text }]}
					placeholder={placeholder}
					placeholderTextColor={theme.textSecondary}
					value={searchQuery}
					onChangeText={(text) => {
						setSearchQuery(text);
						handleSearch(text);
					}}
				/>
				{isLoading && (
					<ActivityIndicator
						size="small"
						color={theme.primary}
						style={styles.loader}
					/>
				)}
				{searchQuery.length > 0 && (
					<TouchableOpacity
						onPress={() => {
							setSearchQuery("");
							setResults([]);
						}}
						style={styles.clearButton}
					>
						<Ionicons
							name="close-circle"
							size={20}
							color={theme.textSecondary}
						/>
					</TouchableOpacity>
				)}
			</View>

			{error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}

			{results.length > 0 && (
				<FlatList
					style={[styles.resultsList, { backgroundColor: theme.surface }]}
					data={results}
					keyExtractor={(item) => item.place_id}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={[styles.resultItem, { borderBottomColor: theme.border }]}
							onPress={() => handleLocationSelect(item)}
						>
							<Ionicons
								name="location"
								size={20}
								color={theme.primary}
								style={styles.locationIcon}
							/>
							<Text
								style={[styles.resultText, { color: theme.text }]}
								numberOfLines={2}
							>
								{item.display_name}
							</Text>
						</TouchableOpacity>
					)}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		position: "relative",
		zIndex: 1,
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 8,
		paddingHorizontal: 12,
		height: 48,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
	},
	searchIcon: {
		marginRight: 8,
	},
	input: {
		flex: 1,
		height: "100%",
		fontSize: 16,
	},
	loader: {
		marginLeft: 8,
	},
	clearButton: {
		padding: 4,
	},
	resultsList: {
		position: "absolute",
		top: "100%",
		left: 0,
		right: 0,
		maxHeight: 200,
		borderRadius: 8,
		marginTop: 4,
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	resultItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderBottomWidth: 1,
	},
	locationIcon: {
		marginRight: 8,
	},
	resultText: {
		flex: 1,
		fontSize: 14,
	},
	errorText: {
		marginTop: 4,
		fontSize: 12,
	},
});

export default LocationSearch;
