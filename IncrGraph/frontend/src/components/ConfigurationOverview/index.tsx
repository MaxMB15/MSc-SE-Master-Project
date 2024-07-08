import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import ConfigurationDisplay from "../ConfigurationDisplay"; // Adjust the path as needed
import CustomSelect from "../CustomSelect"; // Adjust the path as needed
import "./ConfigurationOverview.css";
import useStore from "@/store/store";

const ConfigurationOverview: React.FC = () => {
	const { currentSessionId, setCurrentSessionId, sessions } = useStore();
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
		null,
	);

	useEffect(() => {
		setSelectedSessionId(currentSessionId);
	}, [currentSessionId]);

	const handleSessionChange = (value: string) => {
		setSelectedSessionId(value);
		setCurrentSessionId(() => value);
	};

	const handleStartNewSession = () => {
		setCurrentSessionId(() => null); // Set current session to null initially
	};

	return (
		<Box className="configuration-overview">
			<Typography variant="h6" className="configuration-overview-title">
				Session Configuration
			</Typography>
			<Box className="configuration-overview-controls">
				<Button
					variant="contained"
					// color={selectedSessionId === null ? "secondary" : "primary"}
					onClick={handleStartNewSession}
					className="configuration-overview-button"
					disabled={selectedSessionId === null}
				>
					{selectedSessionId === null
						? "New Session Active"
						: "Start New Session"}
				</Button>
				<CustomSelect
					id="session-select"
					label="Select Session"
					options={[...sessions.keys()].map((sessionId) => ({
						value: sessionId,
						label: sessionId,
						className: "", // Add any class name if needed for color coding
					}))}
					value={selectedSessionId || ""}
					onChange={handleSessionChange}
				/>
			</Box>
			{selectedSessionId && (
				<ConfigurationDisplay data={sessions.get(selectedSessionId)} />
			)}
			{selectedSessionId === null && (
				<Typography className="configuration-placeholder">
					No Configurations
				</Typography>
			)}
		</Box>
	);
};

export default ConfigurationOverview;
