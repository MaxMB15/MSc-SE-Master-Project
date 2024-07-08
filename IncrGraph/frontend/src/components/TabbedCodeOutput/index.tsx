import React, { useEffect, useRef, useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import ConfigurationDisplay from "../ConfigurationDisplay";
import { CodeRunData } from "@/types/frontend";
import "@xterm/xterm/css/xterm.css";
import "./TabbedCodeOutput.css";

interface TabbedCodeOutputProps {
	codeRunData: CodeRunData | undefined;
	fitAddons: React.MutableRefObject<(FitAddon | null)[]>;
}

const TabbedCodeOutput: React.FC<TabbedCodeOutputProps> = ({
	codeRunData,
	fitAddons,
}) => {
	const [activeTab, setActiveTab] = useState(0);
	const terminalRefs = useRef<(HTMLDivElement | null)[]>([]);
	const terminals = useRef<(Terminal | null)[]>([]);

	useEffect(() => {
		terminalRefs.current.forEach((ref, index) => {
			if (ref && !terminals.current[index]) {
				console.log(`Initializing terminal ${index}`);
				terminals.current[index] = new Terminal({
					theme: {
						background: "#1a1a1a",
						cursor: "#1a1a1a",
					},
					cursorStyle: "block",
					cursorBlink: false,
				});

				fitAddons.current[index] = new FitAddon();
				terminals.current[index]?.loadAddon(fitAddons.current[index]!);
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
				fitAddons.current[index]?.fit();
			}
		});

		return () => {
			terminals.current.forEach((terminal) => terminal?.dispose());
		};
	}, []);

    useEffect(() => {
        // Example: Write to the terminal
        terminals.current.forEach((terminal, index) => {
            if (index === 0) {
                terminals.current[index]?.writeln(
                    codeRunData && codeRunData.stdout ? codeRunData.stdout : "<No output>",
                );
            } else if (index === 1) {
                terminals.current[index]?.writeln(
                    codeRunData && codeRunData.stderr ? codeRunData.stderr : "<No errors>",
                );
            }
        });
    }, [codeRunData]);

	// useEffect(() => {
	// 	fitAddons.current.forEach((fitAddon) => fitAddon?.fit());
	// }, [activeTab]);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	return (
		<Box className="tabbed-code-output">
			<Tabs
				value={activeTab}
				onChange={handleTabChange}
				className="tabbed-code-output-tabs"
			>
				<Tab label="Output" className="tabbed-code-output-tab" />
				<Tab label="Errors" className="tabbed-code-output-tab" />
				<Tab label="Configuration" className="tabbed-code-output-tab" />
				<Tab label="Metrics" className="tabbed-code-output-tab" />
			</Tabs>
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
							codeRunData
								? codeRunData.configuration
								: "No Configuration Available"
						}
					/>
				)}
				{activeTab === 3 && (
					<ConfigurationDisplay
						data={
							codeRunData
								? codeRunData.metrics
								: "No Metrics Available"
						}
					/>
				)}
			</Box>
		</Box>
	);
};

export default TabbedCodeOutput;
