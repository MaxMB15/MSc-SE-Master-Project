import { Box, Typography } from "@mui/material";
import styles from "./ConfigurationDisplay.module.css";

const ConfigurationDisplay: React.FC<{ data: any }> = ({ data }) => {
	return (
		<Box className={styles.container}>
			{data ? (
				<pre>{JSON.stringify(data, null, 2)}</pre>
			) : (
				<Typography>No Configurations</Typography>
			)}
		</Box>
	);
};

export default ConfigurationDisplay;
