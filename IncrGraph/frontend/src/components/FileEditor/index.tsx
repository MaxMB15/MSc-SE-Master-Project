import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ResizableBox } from "react-resizable";
import { Editor, Monaco } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";
import "react-resizable/css/styles.css";
import "./FileEditor.css";
import { useAxiosRequest } from "@/utils/requests";
import { SaveFilePathRequest } from "@/types/common";
import SelectionPane from "../SelectionPane";
import useStore from "@/store/store";
import { Node, Edge } from "reactflow";
import { applyFilter, mergeChanges } from "@/utils/json";
import {
	disposeAllProviders,
	showSuggestionSnippet,
	getSuggestions,
} from "@/utils/codeTemplates";
import filterRulesIGC from "@/utils/filterRulesIGC.json";
import { PlayArrow } from "@mui/icons-material";

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
enum EditorDisplayContentType {
	NORMAL,
	IGC_NORMAL,
	FILTERED,
	CODE,
	NONE,
	EDITOR,
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
		selectedItem,
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
	const [filterContent, setFilterContent] = useState<boolean>(true);
	const [changeFromType, setChangeFromType] =
		useState<EditorDisplayContentType>(EditorDisplayContentType.NONE);

	// UTIL FUNCTIONS
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
	const serializeGraphData = (
		content: string,
	): { nodes: Node[]; edges: Edge[] } => {
		console.log("Serializing graph data");
		try {
			const data = JSON.parse(content);
			return { nodes: data.nodes, edges: data.edges };
		} catch (error) {
			console.error("Error parsing IGC content:", error);
			throw new Error(`Error parsing IGC content: ${error}`);
		}
	};
	// Deserialize the graph data into a string
	const deserializeGraphData = (nodes: Node[], edges: Edge[]): string => {
		let data = { nodes: nodes, edges: edges };
		return JSON.stringify(data, null, 4); // Pretty print the JSON
	};

	const generateCodeKey = (selectedFile: string, nodeId: string) => {
		return `${selectedFile}-Node-${nodeId}`;
	};

	// INITIALIZE MODELS
	const checkInitializeModels = () => {
		if (selectedFile !== null && localContentBuffer !== null) {
			if (!isIGCFile) {
				if (!modelExists(EditorDisplayContentType.NORMAL)) {
					createModel(selectedFile, localContentBuffer);
					// showModel(EditorDisplayContentType.NORMAL);
				} else {
					tryShowModel();
				}
			} else {
				if (!modelExists(EditorDisplayContentType.IGC_NORMAL)) {
					const serializedData =
						serializeGraphData(localContentBuffer);
					setNodes(() => serializedData.nodes);
					setEdges(() => serializedData.edges);
				} else {
					tryShowModel();
				}
			}
		}
	};
	// UPDATE MODEL FUNCTIONS FROM NODE/EDGE CHANGES
	// Update all code models
	const updateAllCodeModels = () => {
		// Note, for this to work, the model has to be initialized when the selected node is chosen

		if (selectedFile === null) {
			throw new Error(
				"Selected file does not exist! This should not happen!",
			);
		}
		// Go through every node to see if it is in the models map
		setModels((prev) => {
			for (const node of nodes) {
				const codeKey = generateCodeKey(selectedFile, node.id);
				if (prev.has(codeKey)) {
					const model = prev.get(codeKey);
					model.pushEditOperations(
						[],
						[
							{
								range: model.getFullModelRange(),
								text: node.data.code,
							},
						],
						() => null,
					);
					prev.set(codeKey, model);
				}
			}
			return new Map(prev);
		});
	};
	// Update the filter model
	const updateFilterModel = () => {
		if (selectedFile === null) {
			throw new Error(
				"Selected file does not exist! This should not happen!",
			);
		}
		setModels((prev) => {
			const filteredKey = `${selectedFile}-filtered`;
			const model = prev.get(filteredKey);
			if (model) {
				model.pushEditOperations(
					[],
					[
						{
							range: model.getFullModelRange(),
							text: filteredIGCVersion(),
						},
					],
					() => null,
				);
				prev.set(filteredKey, model);
			} else {
				throw new Error(
					"Model does not exist! This should not happen!",
				);
			}
			return new Map(prev);
		});
	};
	// Update the IGC model
	const updateIGCModel = () => {
		if (selectedFile === null) {
			throw new Error(
				"Selected file does not exist! This should not happen!",
			);
		}
		setModels((prev) => {
			const model = prev.get(selectedFile);
			if (model) {
				model.pushEditOperations(
					[],
					[
						{
							range: model.getFullModelRange(),
							text: deserializeGraphData(nodes, edges),
						},
					],
					() => null,
				);
				prev.set(selectedFile, model);
			} else {
				throw new Error(
					"Model does not exist! This should not happen!",
				);
			}
			return new Map(prev);
		});
	};

	const updateAllModels = (updateAll = false) => {
		if (updateAll || changeFromType !== EditorDisplayContentType.CODE) {
			updateAllCodeModels();
		}
		if (updateAll || changeFromType !== EditorDisplayContentType.FILTERED) {
			updateFilterModel();
		}
		if (
			updateAll ||
			changeFromType !== EditorDisplayContentType.IGC_NORMAL
		) {
			updateIGCModel();
		}
		setChangeFromType(EditorDisplayContentType.NONE);
	};

	// Update the text editor with the current state of the nodes and edges
	useEffect(() => {
		if (isIGCFile && selectedFile !== null && localContentBuffer !== null) {
			// setLocalContentBuffer(() => deserializeGraphData(nodes, edges));

			if (modelExists(EditorDisplayContentType.IGC_NORMAL)) {
				if (changeFromType === EditorDisplayContentType.NONE) {
					setChangeFromType(EditorDisplayContentType.EDITOR);
				} else {
					updateAllModels();
				}
			} else {
				// Initialize essential models
				createModel(selectedFile, localContentBuffer);
				createModel(`${selectedFile}-filtered`, filteredIGCVersion());
			}
			// Save icon logic
			const fileHistory = fileHistories.get(selectedFile);
			if (fileHistory) {
				const psc = fileHistory.prevSavedContent;
				const current = deserializeGraphData(nodes, edges);
				if (psc !== current) {
					setIsSaved(false);
				} else {
					setIsSaved(true);
				}
			}
		}
	}, [nodes, edges]);

	useEffect(() => {
		if (
			isIGCFile &&
			selectedFile !== null &&
			localContentBuffer !== null &&
			changeFromType === EditorDisplayContentType.EDITOR
		) {
			updateAllModels(true);
		}
	}, [changeFromType]);

	const tryShowModel = () => {
		if (selectedFile !== null && localContentBuffer !== null) {
			const displayType = getDisplayType();
			if (modelExists(displayType)) {
				if (
					editorRef.current.getModel() !==
					models.get(getDisplayTypeRawContent(displayType).key)
				) {
					showModel(displayType);
				} else {
					console.log("Model already is being shown!");
				}
			}
		}
	};

	useEffect(() => {
		if (selectedFile !== null && localContentBuffer !== null) {
			checkInitializeModels();
		}
	}, [localContentBuffer]);

	// WHEN SPECIFIC METHODS CHANGE TEXT HANDLERS
	// When code changes
	const codeChange = (changeValue: string) => {
		setChangeFromType(EditorDisplayContentType.CODE);
		// Needs to be called every update of the editor to make sure we do not lose the changes
		const codeIGCContent: string = models
			.get(getDisplayTypeRawContent(EditorDisplayContentType.CODE).key)
			.getValue();

		// Update the code in the selected node
		setNodes((prevNodes) =>
			prevNodes.map((node) => {
				if (node.id === selectedItem?.id) {
					node.data.code = codeIGCContent;
				}
				return node;
			}),
		);

		// If empty, add suggestions
		if (
			changeValue === "" &&
			monacoRef.current &&
			editorRef.current &&
			selectedItem !== null
		) {
			showSuggestionSnippet(
				selectedItem.item.type || null,
				"python",
				monacoRef.current,
				editorRef.current,
			);
		}
	};
	// When filtered text changes
	const filterChange = () => {
		setChangeFromType(EditorDisplayContentType.FILTERED);
		// Needs to be called every update of the editor to make sure we do not lose the changes
		const filteredIGCContent: string = models
			.get(
				getDisplayTypeRawContent(EditorDisplayContentType.FILTERED).key,
			)
			.getValue();
		if (!isValidJSON(filteredIGCContent)) {
			return;
		}

		// Merge to the raw IGC data
		const jsonIGCContent = serializeGraphData(
			deserializeGraphData(nodes, edges),
		);
		console.log("jsonIGCContent\n", jsonIGCContent);
		const jsonFilteredIGCContent = JSON.parse(filteredIGCContent);
		console.log("jsonFilteredIGCContent\n", jsonFilteredIGCContent);
		const newIGCContent = mergeChanges(
			jsonIGCContent,
			jsonFilteredIGCContent,
		);
		console.log("newIGCContent\n", newIGCContent);

		// Update Nodes and Edges to the newIGCContent
		setNodes(() => newIGCContent.nodes);
		setEdges(() => newIGCContent.edges);
	};
	// When normal IGC Text changes
	const normalIGCChange = () => {
		setChangeFromType(EditorDisplayContentType.IGC_NORMAL);
		// Update the nodes/edges from raw IGC content
		const rawIGCKey = getDisplayTypeRawContent(
			EditorDisplayContentType.IGC_NORMAL,
		).key;
		const rawIGCModel = models.get(rawIGCKey);
		const rawIGCContent: string = rawIGCModel.getValue();
		if (!isValidJSON(rawIGCContent)) {
			return;
		}
		const newIGCContent = JSON.parse(rawIGCContent);
		setNodes(() => newIGCContent.nodes);
		setEdges(() => newIGCContent.edges);
	};

	// GET DISPLAY TYPE VALUE FUNCTIONS
	// Get filtered version of the JSON content
	const filteredIGCVersion = (): string => {
		const currentIGCContent = JSON.parse(
			deserializeGraphData(nodes, edges),
		);
		return JSON.stringify(
			applyFilter(currentIGCContent, filterRulesIGC),
			null,
			4,
		);
	};
	// Get the code of the selected item
	const codeVersion = (): string => {
		return selectedItem?.type === "Node"
			? selectedItem.item.data.code
			: "THIS SHOULD NOT HAPPEN, SELECTED ITEM IS NOT VALID OR NOT A NODE!";
	};
	const getDisplayType = (): EditorDisplayContentType => {
		if (selectedFile === null) {
			throw new Error("Selected file is null, this should not happen!");
		}
		if (!isIGCFile) {
			return EditorDisplayContentType.NORMAL;
		} else if (selectedItem?.type === "Node") {
			return EditorDisplayContentType.CODE;
		} else if (filterContent) {
			return EditorDisplayContentType.FILTERED;
		}
		return EditorDisplayContentType.IGC_NORMAL;
	};

	const getDisplayTypeRawContent = (
		displayType: EditorDisplayContentType,
	): { key: string; rawValueFunc: () => string } => {
		if (selectedFile === null || fileContent === null) {
			throw new Error(
				"Selected file or file content is null, this should not happen!",
			);
		}
		if (displayType === EditorDisplayContentType.NORMAL) {
			return { key: selectedFile, rawValueFunc: () => fileContent };
		} else if (displayType === EditorDisplayContentType.IGC_NORMAL) {
			return {
				key: selectedFile,
				rawValueFunc: () => deserializeGraphData(nodes, edges),
			};
		} else if (displayType === EditorDisplayContentType.FILTERED) {
			return {
				key: `${selectedFile}-filtered`,
				rawValueFunc: filteredIGCVersion,
			};
		} else if (displayType === EditorDisplayContentType.CODE) {
			if (selectedItem === null) {
				throw new Error(
					"THIS SHOULD NOT HAPPEN, SELECTED ITEM CANNOT BE NULL HERE!",
				);
			}
			if (selectedItem.type !== "Node") {
				throw new Error(
					"THIS SHOULD NOT HAPPEN, SELECTED ITEM MUST BE A NODE HERE!",
				);
			}
			return {
				key: generateCodeKey(selectedFile, selectedItem.id),
				rawValueFunc: codeVersion,
			};
		} else {
			throw new Error("Display type not recognized");
		}
	};

	// Toggle the visibility of the file editor
	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	// MONACO EDITOR FUNCTIONS
	const handleEditorMount = (editor: any, monaco: Monaco) => {
		monacoRef.current = monaco;
		editorRef.current = editor;

		// Make sure there is an update for when editor.current is updated
		checkInitializeModels();
	};
	const handleResize = useCallback(() => {
		if (editorRef.current) {
			editorRef.current.layout();
		}
	}, []);

	// Resizing the editor
	useEffect(() => {
		// Window resize event listener
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [handleResize]);

	// Event listener for keydown
	const handleKeyDown = (event: KeyboardEvent) => {
		// Setting the filter to false
		if ((event.ctrlKey || event.metaKey) && event.code === "Backslash") {
			event.preventDefault();
			if (filterContent) {
				setFilterContent(false);
			} else {
				setFilterContent(true);
			}
		}
		// For saving the file
		if ((event.ctrlKey || event.metaKey) && event.key === "s") {
			event.preventDefault();
			saveChanges();
		}
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleKeyDown]);

	// Overall change handler from editor
	const handleEditorChange = (value: string | undefined) => {
		// Check history if the file is the previously saved file
		const fileHistory = fileHistories.get(selectedFile || "");
		if (fileHistory) {
			if (isIGCFile) {
				// Logic should happen after node/edge change
			} else if (fileHistory.prevSavedContent !== value) {
				setIsSaved(false);
			} else {
				setIsSaved(true);
			}
		} else {
			throw new Error(
				"File history does not exist, this should not happen!",
			);
		}

		// Update the local content buffer
		setLocalContentBuffer(() => value || "");

		// Update the Node/Edge data from the change;
		if (changeFromType !== EditorDisplayContentType.EDITOR)
			if (getDisplayType() === EditorDisplayContentType.CODE) {
				codeChange(value || "");
			} else if (getDisplayType() === EditorDisplayContentType.FILTERED) {
				filterChange();
			} else if (
				getDisplayType() === EditorDisplayContentType.IGC_NORMAL
			) {
				normalIGCChange();
			} else if (getDisplayType() === EditorDisplayContentType.NORMAL) {
			} else {
				console.error("Display type not recognized");
			}
		else {
			setChangeFromType(EditorDisplayContentType.NONE);
		}
	};

	// Checks if a model exists corrospoinding to the display type
	const modelExists = (displayType: EditorDisplayContentType): boolean => {
		// Get the key of the model
		const { key } = getDisplayTypeRawContent(displayType);

		return models.has(key);
	};

	// Create model
	const createModel = (key: string, value: string, language = "python") => {
		const debug = false; // Debugging flag
		if (!monacoRef.current || !editorRef.current) {
			debug &&
				console.log(
					"Monaco editor or monaco instance is not available",
				);
			return;
		}

		debug && console.log("Creating new model: ", key);
		const model = monacoRef.current.editor.createModel(value, language);
		setModels((prevModels) => new Map(prevModels.set(key, model)));

		return model;
	};

	// Update the Monaco Editor with the model from the given display type
	const showModel = (displayType: EditorDisplayContentType) => {
		const debug = true; // Debugging flag

		if (!monacoRef.current || !editorRef.current) {
			debug &&
				console.log(
					"Monaco editor or monaco instance is not available",
				);
			return;
		}

		// Get the key of the model to show
		const { key } = getDisplayTypeRawContent(displayType);

		// Get the model
		let model = models.get(key);
		debug && console.log("\n\nTrying to show model: ", key);

		// If it does not exist, throw an error
		if (!model) {
			debug && console.log("Cannot find model:", key);
			throw new Error("Model not found");
		} else {
			debug && console.log("Found model: ", key);
		}

		// Set the model to the editor
		if (editorRef.current) {
			debug && console.log("Setting model to editor");
			editorRef.current.setModel(model);
			if (
				displayType === EditorDisplayContentType.CODE &&
				selectedItem !== null
			) {
				if (model.getValue() === "") {
					showSuggestionSnippet(
						selectedItem.item.type || null,
						"python",
						monacoRef.current,
						editorRef.current,
					);
				}
			}
		}
	};

	// If the selected item changes, ensure it has a model
	useEffect(() => {
		if (
			isIGCFile &&
			selectedFile !== null &&
			localContentBuffer !== null &&
			selectedItem !== null &&
			selectedItem.type === "Node"
		) {
			const codeKey = generateCodeKey(selectedFile, selectedItem.id);
			if (!models.has(codeKey)) {
				createModel(codeKey, selectedItem.item.data.code);
			}
		}
	}, [selectedItem]);

	useEffect(() => {
		tryShowModel();
	}, [filterContent, selectedItem, models]);

	// FILE OPERATION FUNCTIONS
	const saveChanges = () => {
		if (localContentBuffer !== null && selectedFile !== null) {
			let saveContent = localContentBuffer;
			if (isIGCFile) {
				saveContent = deserializeGraphData(nodes, edges);
			}
			saveFileSendRequest({
				method: "POST",
				data: { path: selectedFile, content: saveContent },
				route: "/api/file-explorer/file-content",
				useJWT: false,
			}).then(() => {
				console.log("File saved");
				setIsSaved(true);
				const currentTime = Date.now();
				setFileHistories(
					() =>
						new Map(
							fileHistories.set(selectedFile, {
								lastSavedTimestamp: currentTime,
								prevContent: saveContent,
								prevSavedContent: saveContent,
							}),
						),
				);
				// Update the file content with what was saved
				setFileContent(() => saveContent);
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
								{selectedItem &&
									selectedItem.type === "Node" && (
										<button
											className="icon-button"
											title="Toggle Visibility"
											onClick={toggleCollapse}
										>
											<PlayArrow />
										</button>
									)}
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
					<Box
						sx={{
							flexGrow: 1,
							backgroundColor: "#1e1e1e",
							overflowY: "auto",
							display: isCollapsed ? "none" : "block",
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
									loading={<div>Loading...</div>}
								/>
							)}
						{!selectedFile && (
							<div style={{ textAlign: "center" }}>
								Select a file to view its content.
							</div>
						)}
					</Box>

					<div
						className="selection-pane-container"
						style={{ display: isCollapsed ? "none" : "block" }}
					>
						<SelectionPane />
					</div>
				</div>
			</div>
		</ResizableBox>
	);
};

export default FileEditor;
