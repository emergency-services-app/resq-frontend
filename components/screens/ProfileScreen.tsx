import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import ProfileItem from "@/components/ui/ProfileItem";
import Icon from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

const ProfileScreen = () => {
	const [darkMode, setDarkMode] = useState(false);
	const router = useRouter();

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text
					style={styles.backArrow}
					onPress={() => router.back()}
				>
					<Ionicons
						name="arrow-back-outline"
						size={24}
						color="black"
					/>
				</Text>
				<Text style={styles.headerText}>Profile</Text>
			</View>

			<View style={styles.avatarContainer}>
				<View style={styles.avatar} />
				<Text style={styles.name}>Anuska G.C.</Text>
				<Text style={styles.phone}>9851349206</Text>
			</View>

			<Text style={styles.section}>Account Settings</Text>

			<ProfileItem
				icon="user-o"
				label="Personal Information"
				onPress={() => Alert.alert("Personal Info")}
			/>

			<ProfileItem
				icon="lock"
				label="Change Password"
				onPress={() => Alert.alert("Change Password")}
			/>

			<Text style={styles.section}>Preference</Text>
			<ProfileItem
				icon="moon-o"
				label="Dark Mode"
				hasSwitch
				switchValue={darkMode}
				onToggleSwitch={setDarkMode}
			/>
			<ProfileItem
				icon="bell-o"
				label="Notification"
				isExpandable
				onPress={() => Alert.alert("Notification Settings")}
			/>

			<Text style={styles.section}>Support</Text>
			<ProfileItem
				icon="file-text-o"
				label="Terms and Condition"
				onPress={() => Alert.alert("Terms")}
			/>
			<ProfileItem
				icon="question-circle-o"
				label="Help Center"
				onPress={() => Alert.alert("Help Center")}
			/>
			<ProfileItem
				icon="commenting-o"
				label="Feedback"
				onPress={() => Alert.alert("Feedback")}
			/>

			<TouchableOpacity
				style={styles.logoutBtn}
				onPress={() => Alert.alert("Logged Out")}
			>
				<Icon
					name="sign-out"
					size={18}
				/>
				<Text style={styles.logoutText}>Log Out</Text>
			</TouchableOpacity>
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
		marginBottom: 20,
	},
	backArrow: {
		fontSize: 20,
		marginRight: 10,
	},
	headerText: {
		fontSize: 18,
		fontWeight: "bold",
	},
	avatarContainer: {
		alignItems: "center",
		marginBottom: 20,
	},
	avatar: {
		width: 80,
		height: 80,
		backgroundColor: "#ccc",
		borderRadius: 40,
		marginBottom: 10,
	},
	name: {
		fontSize: 16,
		fontWeight: "bold",
	},
	phone: {
		color: "#666",
	},
	section: {
		fontWeight: "bold",
		fontSize: 14,
		marginTop: 20,
		marginBottom: 10,
	},
	logoutBtn: {
		marginTop: 30,
		marginBottom: 40,
		backgroundColor: "#eee",
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
		gap: 10,
	},
	logoutText: {
		fontSize: 16,
	},
});

export default ProfileScreen;
