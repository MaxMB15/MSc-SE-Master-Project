import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import ConfigurationDisplay from "../ConfigurationDisplay";
import CustomSelect from "../CustomSelect";
import styles from "./ConfigurationOverview.module.css";
import useStore from "@/store/store";
import { getEdgeId } from "../EditorPane/components/utils/utils";

interface ConfigurationOverviewProps {
	openTextDialog: (defaultName: string) => Promise<string | null>;
}

const ConfigurationOverview: React.FC<ConfigurationOverviewProps> = ({
	openTextDialog,
}) => {
	const {
		isIGCFile,
		setEdges,
		currentSessionId,
		setCurrentSessionId,
		sessions,
		setSessions,
	} = useStore();
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
		null,
	);

	useEffect(() => {
		if (isIGCFile) {
			setSelectedSessionId(currentSessionId);
		}
	}, [currentSessionId, isIGCFile]);

	const handleSessionChange = (value: string) => {
		setCurrentSessionId(() => value);
		setEdges((prevEdges) => {
			let filteredEdges = prevEdges.filter(
				(edge) => edge.type !== "executionRelationship",
			);

			const session = sessions.get(value);
			if (session) {
				for (let i = 0; i < session.executionPath.length - 1; i++) {
					const source = session.executionPath[i];
					const target = session.executionPath[i + 1];
					filteredEdges.push({
						id: getEdgeId(source, target, filteredEdges),
						source,
						target,
						type: "executionRelationship",
						data: { label: `${i + 1}` },
					});
				}
			}
			return filteredEdges;
		});
	};

	const handleStartNewSession = async () => {
		const defaultSessionName = `IGC_${new Intl.DateTimeFormat("en-GB", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		})
			.format(new Date())
			.replace(/,/, "")
			.replace(/\//g, "-")
			.replace(" ", "_")}`;

		const sessionName = await openTextDialog(defaultSessionName);
		if (sessionName) {
			setSessions((prevSessions) =>
				new Map(prevSessions).set(sessionName, {
					configuration: {},
					executionPath: ["start"],
				}),
			);
			setCurrentSessionId(() => sessionName);
			setEdges((prevEdges) =>
				prevEdges.filter(
					(edge) => edge.type !== "executionRelationship",
				),
			);
		}
	};

	return (
		<Box className={styles.configurationOverview}>
			<Typography
				variant="h6"
				className={styles.configurationOverviewTitle}
			>
				Session Configuration
			</Typography>
			<Box className={styles.configurationOverviewControls}>
				<Button
					variant="contained"
					onClick={handleStartNewSession}
					className={styles.configurationOverviewButton}
					// disabled={selectedSessionId === null}
				>
					{/* {selectedSessionId === null
						? "New Session Active"
						: "Start New Session"} */}
					Start New Session
				</Button>
				<CustomSelect
					id="session-select"
					label="Select Session"
					options={[...sessions.keys()].map((sessionId) => ({
						className: "",
						value: sessionId,
						label: sessionId,
					}))}
					value={selectedSessionId || ""}
					onChange={(e) => handleSessionChange(e)}
				/>
			</Box>
			{selectedSessionId ? (
				<ConfigurationDisplay
					data={sessions.get(selectedSessionId)?.configuration}
				/>
			) : (
				<Typography className={styles.configurationPlaceholder}>
					No Configurations
				</Typography>
			)}
		</Box>
	);
};

export default ConfigurationOverview;
