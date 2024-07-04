import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ResizableBox } from "react-resizable";
import { Editor, Monaco } from "@monaco-editor/react";
import "react-resizable/css/styles.css";
import "./FileEditor.css";
import { useAxiosRequest } from "../../utils";
import { SaveFilePathRequest } from "@/types/common";
import SelectionPane from "../SelectionPane";
import useStore from "@/store/store";
import { Node, Edge } from "reactflow";

interface FileEditorProps {
	openConfirmDialog: (
		msg: string,
		buttonLabelConfirm: string,
		buttonLabelCancel: string,
	) => Promise<boolean>;
}

interface GetFilePathRequest {
	path: string;
}

interface GetFilePathResponse {
	content: string;
	lastModified: number;
}

const FileEditor: React.FC<FileEditorProps> = ({ openConfirmDialog }) => {
	// VARIABLES
	// Request for reading file content
	const {
		error: readFileError,
		loading: readFileLoading,
		sendRequest: readFileSendRequest,
	} = useAxiosRequest<GetFilePathRequest, GetFilePathResponse>();
	// Request for saving file content
	const { error: saveFileError, sendRequest: saveFileSendRequest } =
		useAxiosRequest<SaveFilePathRequest, null>();

	// References to monaco editor
	const editorRef = useRef<any>(null);
	const monacoRef = useRef<Monaco | null>(null);

	// Store variables
	const {
		selectedFile,
		fileContent,
		setFileContent,
		localContentBuffer,
		setLocalContentBuffer,
		fileHistories,
		setFileHistories,
		isIGCFile,
		nodes,
		setNodes,
		edges,
		setEdges,
	} = useStore();

	// STATE
	const [isCollapsed, setIsCollapsed] = useState(false); // State for collapsing the file editor
	const [width, setWidth] = useState(500); // State for the width of the file editor
	const [isSaved, setIsSaved] = useState<boolean>(true); // State for checking if the file is currently saved
	const [models, setModels] = useState(new Map<string, any>()); // State for storing the monaco models

	// Toggle the visibility of the file editor
	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	// MONACO EDITOR FUNCTIONS
	const handleEditorMount = (editor: any, monaco: Monaco) => {
		editorRef.current = editor;
		monacoRef.current = monaco;
		if (selectedFile && localContentBuffer !== null) {
			createOrReuseModel();
		}
	};
	const handleResize = useCallback(() => {
		if (editorRef.current) {
			editorRef.current.layout();
		}
	}, []);
	const handleEditorChange = (value: string | undefined) => {
		// Check history if the file is the previously saved file
		const fileHistory = fileHistories.get(selectedFile || "");
		if (fileHistory) {
			if (fileHistory.prevSavedContent !== value) {
				setIsSaved(false);
			} else {
				setIsSaved(true);
			}
		}

		// Update the local content buffer
		setLocalContentBuffer(() => value || "");
	};

	// IGC set data functions
	// Check if the string is a valid JSON
	const isValidJSON = (str: string) => {
		try {
			JSON.parse(str);
			return true;
		} catch (e) {
			return false;
		}
	};

	// Serialize the file content into graph data
	const serializeGraphData = (): { nodes: Node[]; edges: Edge[] } | null => {
		console.log("Serializing graph data");
		// Try to parse the IGC content
		if (localContentBuffer === null) {
			return null;
		}
		try {
			const data = JSON.parse(localContentBuffer);
			return { nodes: data.nodes, edges: data.edges };
		} catch (error) {
			console.error("Error parsing IGC content:", error);
		}
		return null;
	};

	// Create or reuse the model to use for the monaco editor
	const createOrReuseModel = () => {
		const debug = true; // Debugging flag
		if (
			!selectedFile ||
			localContentBuffer === null ||
			!monacoRef.current
		) {
			debug &&
				console.log("Selected file or local content buffer is null");
			return;
		}

		// Check if model exists
		let model = models.get(selectedFile);
		// If it does not, create one
		if (!model) {
			debug && console.log("Creating new model: ", selectedFile);
			model = monacoRef.current.editor.createModel(
				localContentBuffer,
				"python",
			);
			setModels(
				(prevModels) => new Map(prevModels.set(selectedFile, model)),
			);
		} else {
			debug && console.log("Reusing model: ", selectedFile);
			if (localContentBuffer !== model.getValue()) {
				debug && console.log("Pushing new value model value");
				model.pushEditOperations(
					[],
					[
						{
							range: model.getFullModelRange(),
							text: localContentBuffer,
						},
					],
					() => null,
				);
			}
		}

		// Set the model to the editor
		if (editorRef.current) {
			debug && console.log("Setting model to editor");
			editorRef.current.setModel(model);
		}
	};

	// When the content of the file changes
	useEffect(() => {
		// Change model once file content changes
		createOrReuseModel();
		// console.log("File content changed", localContentBuffer);

		// Event listener for saving the file
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();
				saveChanges();
			}
		};

		// Set graph data if the file is an IGC file
		if (isIGCFile && fileContent !== null && isValidJSON(fileContent)) {
			const serializedData = serializeGraphData();
			if (serializedData !== null) {
				setNodes(() => serializedData.nodes);
				setEdges(() => serializedData.edges);
			}
		}

		// Window keydown event listener
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [localContentBuffer]);

	// FILE OPERATION FUNCTIONS
	const saveChanges = () => {
		// if(selectedItem !== null && selectedItem.type === "Node") {
		//     setFileContent((prev))
		// }

		if (localContentBuffer !== null && selectedFile !== null) {
			saveFileSendRequest({
				method: "POST",
				data: { path: selectedFile, content: localContentBuffer },
				route: "/api/file-explorer/file-content",
				useJWT: false,
			}).then(() => {
				setIsSaved(true);
				const currentTime = Date.now();
				setFileHistories(
					() =>
						new Map(
							fileHistories.set(selectedFile, {
								lastSavedTimestamp: currentTime,
								prevContent: localContentBuffer,
								prevSavedContent: localContentBuffer,
							}),
						),
				);
				// Update the file content with what was saved
				setFileContent(() => localContentBuffer);
				// isIGCFile && pushFileContent(fileContent);
			});
		}
	};

	// Fetch the file content
	const fetchFileContent = async () => {
		// Make sure a file is valid
		if (selectedFile === null) {
			return;
		}
		// Read the new file content
		try {
			const response = await readFileSendRequest({
				method: "GET",
				data: { path: selectedFile },
				route: "/api/file-explorer/file-content",
				useJWT: false,
			});

			const { content, lastModified } = response;
			const fileHistory = fileHistories.get(selectedFile);
			const previousTimestamp = fileHistory?.lastSavedTimestamp;

			// Push the file content to the store
			setFileContent(() => content);

			// Check if the file has changed externally
			if (previousTimestamp && lastModified > previousTimestamp) {
				const shouldRefresh = await openConfirmDialog(
					"The file has changed externally. Would you like to refresh?",
					"Refresh",
					"Keep Changes",
				);
				if (shouldRefresh) {
					setLocalContentBuffer(() => content);
					setIsSaved(true);
					setFileHistories(
						() =>
							new Map(
								fileHistories.set(selectedFile, {
									lastSavedTimestamp: lastModified,
									prevContent: content,
									prevSavedContent: content,
								}),
							),
					);
				}
			}
			// Check if there was previous history of the file
			else if (fileHistory) {
				setLocalContentBuffer(() => fileHistory.prevContent);
				if (content !== fileHistory.prevContent) {
					setIsSaved(false);
				} else {
					setIsSaved(true);
				}
			} else {
				setLocalContentBuffer(() => content);
				setIsSaved(true);
				setFileHistories(
					() =>
						new Map(
							fileHistories.set(selectedFile, {
								lastSavedTimestamp: lastModified,
								prevContent: content,
								prevSavedContent: content,
							}),
						),
				);
			}
		} catch (error) {
			console.error("Error fetching the file:", error);
		}
	};
	// If the selected file changes, fetch the new file content
	useEffect(() => {
		if (selectedFile !== null) {
			fetchFileContent();
		}
	}, [selectedFile]);

	// Resizing the editor
	useEffect(() => {
		// Window resize event listener
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [handleResize]);

	// IGC File Functions
	// Update editor if the graph data changes
	useEffect(() => {
		if (isIGCFile) {
		}
	}, [nodes, edges]);

	// useEffect(() => {
	// 	if (selectedItem !== null && selectedItem.type === "Node") {
	// 		createOrReuseModel(
	// 			`${selectedFile}-code`,
	// 			selectedItem.item.data.code,
	// 		);
	// 	}
	// }, [selectedItem]);

	return (
		<ResizableBox
			width={isCollapsed ? 40 : width}
			height={Infinity}
			axis="x"
			minConstraints={[40, Infinity]}
			maxConstraints={[800, Infinity]}
			onResize={(_, { size }) => setWidth(size.width)}
			onResizeStop={handleResize}
			resizeHandles={["w"]}
			handle={
				<div className="resize-handle-container-left">
					<div
						className="resize-handle"
						style={{
							cursor: "ew-resize",
							height: "100%",
							width: "5px",
							position: "absolute",
							left: 0,
							top: 0,
							backgroundColor: "transparent",
						}}
					/>
				</div>
			}
		>
			<div className="file-editor-container">
				<div
					className={`file-editor ${isCollapsed ? "collapsed" : ""}`}
				>
					<div className={`navbar ${isCollapsed ? "collapsed" : ""}`}>
						{!isCollapsed && (
							<>
								<span className="navbar-title">
									Code Editor
								</span>
								{selectedFile && (
									<span
										className="navbar-circle-icon"
										style={{
											backgroundColor:
												saveFileError != null
													? "red"
													: isSaved
													? "green"
													: "orange",
										}}
									></span>
								)}
								<span className="take-full-width"></span>
							</>
						)}
						<button
							className="icon-button"
							title="Toggle Visibility"
							onClick={toggleCollapse}
						>
							<VisibilityIcon />
						</button>
					</div>
					{!isCollapsed && (
						<Box
							sx={{
								flexGrow: 1,
								backgroundColor: "#1e1e1e",
								overflowY: "auto",
							}}
						>
							{readFileLoading && <div>Loading...</div>}
							{readFileError !== null && (
								<div>Error: {readFileError}</div>
							)}
							{selectedFile !== null &&
								fileContent !== null &&
								readFileError === null && (
									<Editor
										height="100%"
										language="python"
										theme="vs-dark"
										options={{ readOnly: false }}
										onMount={handleEditorMount}
										onChange={handleEditorChange}
										loading={readFileLoading}
									/>
								)}
							{!selectedFile && (
								<div style={{ textAlign: "center" }}>
									Select a file to view its content.
								</div>
							)}
						</Box>
					)}
					<div className="selection-pane-container">
						<SelectionPane />
					</div>
				</div>
			</div>
		</ResizableBox>
	);
};

export default FileEditor;
