import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import ConfigurationDisplay from "../ConfigurationDisplay"; // Adjust the path as needed
import CustomSelect from "../CustomSelect"; // Adjust the path as needed
import "./ConfigurationOverview.css";
import useStore from "@/store/store";
import { addEdge, getEdgeId } from "../EditorPane/components/utils/utils";

const ConfigurationOverview: React.FC = () => {
	const { setEdges, currentSessionId, setCurrentSessionId, sessions } =
		useStore();
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
		null,
	);

	useEffect(() => {
		setSelectedSessionId(currentSessionId);
	}, [currentSessionId]);

	const handleSessionChange = (value: string) => {
		setSelectedSessionId(value);
		setCurrentSessionId(() => value);
		// Remove all execution relationship edges
		setEdges((prevEdges) =>
			prevEdges.filter((edge) => edge.type !== "executionRelationship"),
		);
		// Restore the edges from the selected session
		const sessionEdges = sessions.get(value)?.executionPath || [];
		setEdges((prevEdges) =>
			sessionEdges.reduce((acc, nodeId, index) => {
				if (index === 0) {
					return acc;
				}
				return addEdge(
					{
						source: sessionEdges[index - 1],
						target: nodeId,
						sourceHandle: null,
						targetHandle: null,
						type: "executionRelationship",
						id: getEdgeId({
							source: sessionEdges[index - 1],
							target: nodeId,
							sourceHandle: null,
							targetHandle: null,
						}),
						data: { label: index },
					},
					acc,
				);
			}, prevEdges),
		);
	};

	const handleStartNewSession = () => {
		setCurrentSessionId(() => null); // Set current session to null initially
		// Remove all execution relationship edges
		setEdges((prevEdges) =>
			prevEdges.filter((edge) => edge.type !== "executionRelationship"),
		);
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
				<ConfigurationDisplay
					data={sessions.get(selectedSessionId)?.state}
				/>
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
