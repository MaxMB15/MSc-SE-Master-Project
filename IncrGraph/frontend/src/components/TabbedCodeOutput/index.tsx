import React, { useEffect, useRef, useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import ConfigurationDisplay from "../ConfigurationDisplay";
import "@xterm/xterm/css/xterm.css";
import "./TabbedCodeOutput.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNodeExecution } from "shared";
import useStore from "@/store/store";

interface TabbedCodeOutputProps {
	executionData: IGCCodeNodeExecution | undefined;
	// fitAddons: React.MutableRefObject<(FitAddon | null)[]>;
}

const TabbedCodeOutput: React.FC<TabbedCodeOutputProps> = ({
	executionData,
	// fitAddons,
}) => {
	const [activeTab, setActiveTab] = useState(0);
	const terminalRefs = useRef<(HTMLDivElement | null)[]>([]);
	const terminals = useRef<(Terminal | null)[]>([]);
    const theme = useStore(state => state.mode);


	useEffect(() => {
		terminalRefs.current.forEach((ref, index) => {
			if (ref && !terminals.current[index]) {
				console.log(`Initializing terminal ${index}`);
				terminals.current[index] = new Terminal({
					theme: {
						background: theme === "light" ? STYLES.mainBackgroundColorLight : STYLES.mainBackgroundColorDark,
						cursor: theme === "light" ? STYLES.mainBackgroundColorLight : STYLES.mainBackgroundColorDark,
					},
					cursorStyle: "block",
					cursorBlink: false,
				});

				// fitAddons.current[index] = new FitAddon();
				// terminals.current[index]?.loadAddon(fitAddons.current[index]!);
				terminals.current[index]?.open(ref);

				const terminalElement: HTMLElement | null =
					ref?.querySelector(".xterm-viewport");
				if (terminalElement) {
					// terminalElement.style.paddingRight = '40px';
				}
				const terminal: HTMLElement | null =
					ref?.querySelector(".xterm");
				if (terminal) {
					terminal.style.paddingRight = "20px";
				}
				// fitAddons.current[index]?.fit();
			}
		});

		return () => {
			terminals.current.forEach((terminal) => terminal?.dispose());
		};
	}, [theme]);

	useEffect(() => {
		// Example: Write to the terminal
		terminals.current.forEach((terminal, index) => {
			terminal?.clear();
			if (index === 0) {
				terminal?.writeln(
					executionData !== undefined && executionData.stdout !== ""
						? `${theme === "light" ? "\x1b[30m": ""}${executionData.stdout}`
						: `${theme === "light" ? "\x1b[30m": ""}<No output>`,
				);
			} else if (index === 1) {
				terminal?.writeln(
					executionData !== undefined && executionData.stderr !== ""
						? `${theme === "light" ? "\x1b[30m": ""}${executionData.stderr}`
						: `${theme === "light" ? "\x1b[30m": ""}<No errors>`,
				);
			}
		});
	}, [executionData, theme]);

	// useEffect(() => {
	// 	fitAddons.current.forEach((fitAddon) => fitAddon?.fit());
	// }, [activeTab]);

	const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
		// if(fitAddons.current && newValue <2){
		//     fitAddons.current[newValue]?.fit();
		// }
		setActiveTab(newValue);
	};

	return (
		<Box className="tabbed-code-output">
			<div style={{ whiteSpace: "nowrap" }}>
				<div style={{ overflowX: "scroll", scrollbarWidth: "none" }}>
					<Tabs
						value={activeTab}
						onChange={handleTabChange}
						className="tabbed-code-output-tabs"
					>
						<Tab
							label="Output"
							className="tabbed-code-output-tab"
						/>
						<Tab
							label="Errors"
							className="tabbed-code-output-tab"
						/>
						<Tab
							label="Configuration"
							className="tabbed-code-output-tab"
						/>
						<Tab
							label="Metrics"
							className="tabbed-code-output-tab"
						/>
					</Tabs>
				</div>
			</div>

			<Box className="tabbed-code-output-container">
				<Box
					ref={(el: HTMLDivElement | null) =>
						(terminalRefs.current[0] = el)
					}
					className={`tabbed-code-output-terminal ${
						activeTab === 0 ? "" : "hidden"
					}`}
				/>
				<Box
					ref={(el: HTMLDivElement | null) =>
						(terminalRefs.current[1] = el)
					}
					className={`tabbed-code-output-terminal ${
						activeTab === 1 ? "" : "hidden"
					}`}
				/>
				{activeTab === 2 && (
					<ConfigurationDisplay
						data={
							executionData !== undefined
								? executionData.configuration
								: "No Configuration Available"
						}
					/>
				)}
				{activeTab === 3 && (
					<ConfigurationDisplay
						data={
							executionData !== undefined
								? executionData.metrics
								: "No Metrics Available"
						}
					/>
				)}
			</Box>
		</Box>
	);
};

export default TabbedCodeOutput;
