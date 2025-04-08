/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			fontFamily: {
				Laila: ["Laila-Regular", "sans-serif"],
				LailaLight: ["Laila-Light", "sans-serif"],
				LailaMedium: ["Laila-Medium", "sans-serif"],
				LailaBold: ["Laila-Bold", "sans-serif"],
				LailaSemiBold: ["Laila-SemiBold", "sans-serif"],
			},
			colors: {
				primary: "#E13333",
				primaryLight: "#F6A1A1",
				primaryDark: "#B12B2B",
				secondary: "#FFC107",
				secondaryLight: "#FFECB3",
				secondaryDark: "#C79100",
				accent: "#4CAF50",
				accentLight: "#81C784",
				accentDark: "#388E3C",
				neutral: "#F5F5F5",
				neutralDark: "#212121",
				textPrimary: "#212121",
				textSecondary: "#757575",
				success: "#4CAF50",
				warning: "#FF9800",
				error: "#F44336",
				info: "#2196F3",
				background: "#FFFFFF",
			},
		},
	},
	plugins: [],
};
