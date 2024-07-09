import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#0096ed",
		},
		background: {
			default: "#252526",
			paper: "#2a2a2b",
		},
		text: {
			primary: "#ffffff",
		},
	},
	components: {
		MuiIconButton: {
			styleOverrides: {
				root: {
					color: "#ffffff",
					borderRadius: "4px",
				},
			},
		},
		MuiCheckbox: {
			styleOverrides: {
				root: {
					// color: "#ffffff",
					// "&.Mui-checked": {
					// 	color: "#3f51b5",
					// },
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundColor: "#252526",
					color: "#ffffff",
				},
			},
		},
		MuiSvgIcon: {
			// styleOverrides: {
			// 	root: {
			// 		color: "#3f86b5",
			// 	},
			// },
		},
	},
});

export default theme;
