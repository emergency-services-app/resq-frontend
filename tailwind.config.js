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
			colors: {},
		},
	},
	plugins: [],
};
