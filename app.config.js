export default {
	expo: {
		name: "ResQ",
		slug: "resq",
		scheme: "resq",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/images/logo.png",
		userInterfaceStyle: "automatic",
		splash: {
			image: "./assets/images/logo.png",
			resizeMode: "contain",
			backgroundColor: "#ffffff",
		},
		assetBundlePatterns: ["**/*"],
		ios: {
			supportsTablet: true,
			bundleIdentifier: "com.resq.app",
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/logo.png",
				backgroundColor: "#ffffff",
			},
			package: "com.resq.app",
		},
		web: {
			favicon: "./assets/images/logo.png",
		},
		plugins: ["expo-router"],
		experiments: {
			tsconfigPaths: true,
			typedRoutes: true,
		},
	},
};
