import { Box, Typography } from "@mui/material";

// Configuration display component (simplified for the example)
const ConfigurationDisplay: React.FC<{ data: any }> = ({ data }) => {
	return (
		<Box
			sx={{
				overflowY: "auto",
				height: "100%",
				backgroundColor: "#1e1e1e",
				color: "white",
				padding: "16px",
				boxSizing: "border-box", // Ensure padding does not exceed the container
                width: "100%",
			}}
		>
			{data ? (
				<pre>{JSON.stringify(data, null, 2)}</pre>
			) : (
				<Typography>No Configurations</Typography>
			)}
		</Box>
	);
};

export default ConfigurationDisplay;
