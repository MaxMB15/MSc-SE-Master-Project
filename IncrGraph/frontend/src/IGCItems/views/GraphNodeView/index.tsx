import { IGCViewProps } from "../BaseView";
import { createView } from "@/utils/componentCache";
import { RegistryComponent } from "@/types/frontend";

import useStore from "@/store/store";
import { Node } from "reactflow";

import React, { useEffect, useRef, useState } from "react";
import { fileExists } from "@/requests";
import AttachFileIcon from "@mui/icons-material/AttachFile"; // This is the file icon
import {
	Box,
	TextField,
	Tooltip,
	Typography,
	InputAdornment,
	IconButton,
} from "@mui/material";
import GraphNode, { GraphNodeData } from "@/IGCItems/nodes/GraphNode";
import path from "path-browserify";
import CustomSelect from "@/components/CustomSelect";

interface Session {
	id: string;
	name: string;
}

const RawGraphNodeView: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [filePath, setFilePath] = useState<string>("");
	const [goodIGCFile, setGoodIGCFile] = useState<string | null>(null);
	const [sessions, setSessions] = useState<Session[]>([]);
	const [selectedSession, setSelectedSession] = useState<string>("");
	const [isFocused, setIsFocused] = useState(false);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleFileInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file && file.name.endsWith(".igc")) {
			const formData = new FormData();
			formData.append("file", file);

			setSelectedFile(file);
			// onFileChange(file); // Trigger the logic for updating sessions related to the file
			// Simulating the updating of sessions (replace this with actual session update logic)
		}
	};

	const handleSessionChange = (sessionId: string) => {
		setSelectedSession(sessionId);
		// onSessionChange(sessionId); // Trigger the session change logic
	};
	const handlePathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilePath(event.target.value);
		// handleFilePathChange(event); // Propagate the change
	};

    const loadFileData = async () => {
        const curFile = useStore.getState().selectedFile;
        const selectedItem = useStore.getState().selectedItem;
        if(curFile !== null && selectedItem !== null){
            const igcFile = path.join(curFile, filePath);
            if(igcFile.endsWith(".igc")){
                // Check if the file exists
                const fileExistsPromise = await fileExists(igcFile);
                if(fileExistsPromise){
                    console.log("Debounced action triggered with path:", igcFile);
                    useStore.getState().setNodes(curFile, (prevNodes) => prevNodes.map((node) => {
                        if(node.id === selectedItem.id){
                            (node as Node<GraphNodeData>).data.filePath = path.basename(igcFile);
                        }
                        return node;
                    }));
                    setGoodIGCFile(igcFile);
                }
            }
        }

    };
    useEffect(() => {
        setSessions([
            { id: "1", name: "Session 1" },
            { id: "2", name: "Session 2" },
            { id: "3", name: "Session 3" },
        ]);
    }, [goodIGCFile]);

    useEffect(() => {
        setGoodIGCFile(null);
        if(filePath === ""){
            return;
        }
        // Clear the previous timeout if any
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
    
        // Set a new timeout
        timeoutRef.current = setTimeout(() => {
            loadFileData(); // Trigger the function after 2 seconds
        }, 1000);
        
        // Clean up the timeout when the component unmounts or the value changes
        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }, [filePath]); // Re-run the effect whenever `value` changes

	return (
		<Box sx={{ padding: "20px" }}>
			{/* File Input */}
			<Box sx={{ mb: 2 }}>
				<Typography variant="h6" gutterBottom>
					File
				</Typography>
				<TextField
					value={selectedFile ? selectedFile.name : filePath}
					onChange={handlePathChange}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					fullWidth
					placeholder="Enter relative/absolute path or select a file"
					slotProps={{
						input: {
							endAdornment: (
								<InputAdornment position="end"             >
									<Tooltip
										title={
											selectedFile
												? selectedFile.name
												: "Select a .igc file"
										}
									>
										<IconButton
											component="label"
											className="icon-button"
										>
											<input
												type="file"
												accept=".igc"
												hidden
												onChange={handleFileInputChange}
											/>
											<AttachFileIcon />
										</IconButton>
									</Tooltip>
								</InputAdornment>
							),
						},
					}}
					sx={{
						"& .MuiOutlinedInput-root": {
							border: isFocused
								? (goodIGCFile ? "1px solid var(--primary)" : "1px solid red")
								: "none",
							backgroundColor:
								"var(--mui-palette-background-default)",
						},
						"& .MuiOutlinedInput-input": {
							padding: "10px",
						},
					}}
				/>
			</Box>

			{/* Session Selection */}
			<Box sx={{ mb: 2 }}>
				<Typography variant="h6" gutterBottom>
					Session
				</Typography>
				<CustomSelect
					id={""}
					options={sessions.map((session) => {
						return {
							value: session.id,
							label: session.name,
							style: {},
						};
					})}
					value={selectedSession}
					onChange={handleSessionChange}
					disabled={goodIGCFile === null}
				/>
				{/* <TextField
					select
					fullWidth
					label="Select Session"
					value={selectedSession}
					// onChange={handleSessionChange}
					disabled={!selectedFile} // Disable if no file is selected
				>
					{sessions.map((session) => (
						<MenuItem key={session.id} value={session.id}>
							{session.name}
						</MenuItem>
					))}
				</TextField> */}
			</Box>

			{/* Basic Info Box */}
			<Box
				sx={{
					mt: 2,
					p: 2,
					border: "1px solid gray",
					borderRadius: 2,
					bgcolor: selectedSession ? "inherit" : "gray",
				}}
			>
				<Typography
					variant="body1"
					color={selectedSession ? "textPrimary" : "textSecondary"}
				>
					Selected Session ID: {selectedSession || "None Selected"}
				</Typography>
				<Typography variant="body2" color="textSecondary">
					{/* Customize this area to display specific session information */}
					This is where the basic info related to the session will go.
				</Typography>
			</Box>
		</Box>
	);
};

const GraphNodeView: IGCViewProps & RegistryComponent = createView(
	RawGraphNodeView,
	"GraphNodeView",
	"Graph Node View",
	[GraphNode],
	{},
);

export default GraphNodeView;
