import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";

interface Props {
	icon: React.ComponentProps<typeof Icon>["name"];
	label: string;
	onPress?: () => void;
	hasSwitch?: boolean;
	switchValue?: boolean;
	onToggleSwitch?: (value: boolean) => void;
	isExpandable?: boolean;
}

const ProfileItem: React.FC<Props> = ({
	icon,
	label,
	onPress,
	hasSwitch,
	switchValue,
	onToggleSwitch,
	isExpandable,
}) => {
	return (
		<TouchableOpacity
			style={styles.item}
			onPress={onPress}
			activeOpacity={hasSwitch ? 1 : 0.7}
		>
			<View style={styles.left}>
				<Icon
					name={icon}
					size={18}
					style={styles.icon}
				/>
				<Text style={styles.label}>{label}</Text>
			</View>

			{hasSwitch ? (
				<Switch
					value={switchValue}
					onValueChange={onToggleSwitch}
				/>
			) : (
				<Icon
					name={isExpandable ? "chevron-down" : "angle-right"}
					size={16}
				/>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	item: {
		paddingVertical: 14,
		paddingHorizontal: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottomWidth: 0.5,
		borderColor: "#ccc",
	},
	left: {
		flexDirection: "row",
		alignItems: "center",
	},
	icon: {
		width: 25,
	},
	label: {
		marginLeft: 10,
		fontSize: 15,
	},
});

export default ProfileItem;
