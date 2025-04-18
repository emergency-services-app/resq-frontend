import { View, Text } from "react-native";
import React from "react";

type ServiceCardProps = {
	icon: React.ReactNode;
	title: string;
};

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title }) => {
	return (
		<View className="w-full ">
			{icon}
			<Text className="">{title}</Text>
		</View>
	);
};

export default ServiceCard;
