import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { STYLES } from "./constants";

const defaultTheme: ThemeOptions = {
	palette: {
		primary: {
			main: "#0096ed",
		},
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: {
					transition: "all 0.3s ease",
				},
			},
		},
	},
};

// Light Theme
export const lightTheme: Theme = createTheme(
	deepmerge(defaultTheme, {
		palette: {
			mode: "light",
			background: {
				default: STYLES.mainBackgroundAccentColorLight,
				paper: STYLES.mainBackgroundColorLight,
			},
			text: {
				primary: STYLES.mainFontColorLight,
                secondary: STYLES.mainFontAccentColorLight,
			},
		},
	}),
);

// Dark Theme
export const darkTheme: Theme = createTheme(
	deepmerge(defaultTheme, {
		palette: {
			mode: "dark",
			background: {
				default: STYLES.mainBackgroundAccentColorDark,
				paper: STYLES.mainBackgroundColorDark,
			},
			text: {
				primary: STYLES.mainFontColorDark,
                secondary: STYLES.mainFontAccentColorDark,
			},
		},
	}),
);

// const theme = createTheme({
// 	palette: {
// 		mode: "light",
// 		// mode: "dark",
// 		primary: {
// 			main: "#0096ed",
// 		},
// 		background: {
// 			default: STYLES.mainBackgroundAccentColor,
// 			paper: STYLES.mainBackgroundColor,
// 		},
// 		text: {
// 			primary: STYLES.mainFontColor,
// 		},
// 	},
// 	components: {
// 		MuiIconButton: {
// 			styleOverrides: {
// 				root: {
// 					color: STYLES.mainFontColor,
// 					borderRadius: "4px",
// 				},
// 			},
// 		},
// 		MuiCheckbox: {
// 			styleOverrides: {
// 				root: {
// 					// color: "#ffffff",
// 					// "&.Mui-checked": {
// 					// 	color: "#3f51b5",
// 					// },
// 				},
// 			},
// 		},
// 		MuiPaper: {
// 			styleOverrides: {
// 				root: {
// 					backgroundColor: STYLES.mainBackgroundColor,
// 					color: STYLES.mainFontColor,
// 				},
// 			},
// 		},
// 		MuiSvgIcon: {
// 			// styleOverrides: {
// 			// 	root: {
// 			// 		color: "#3f86b5",
// 			// 	},
// 			// },
// 		},
// 	},
// });
