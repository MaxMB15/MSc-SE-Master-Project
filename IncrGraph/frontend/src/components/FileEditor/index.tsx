import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
} from "react";
import { Box, Tab, Tabs } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PlayArrow } from "@mui/icons-material";
import { ResizableBox } from "react-resizable";
import { Editor, Monaco } from "@monaco-editor/react";
import "react-resizable/css/styles.css";
import "./FileEditor.css";
import { SaveFilePathRequest } from "shared";
import SelectionPane from "../SelectionPane";
import useStore from "@/store/store";
// import { useStoreWithEqualityFn } from "zustand/traditional";
import { Node, Edge } from "reactflow";
import { applyFilter, mergeChanges } from "@/utils/json";
import { useAxiosRequest } from "@/utils/requests";
import { showSuggestionSnippet } from "@/utils/codeTemplates";
import filterRulesIGC from "@/utils/filterRulesIGC.json";
import { runCode } from "@/utils/codeExecution";
import { FitAddon } from "@xterm/addon-fit";
import TabbedCodeOutput from "../TabbedCodeOutput";
import MarkdownDisplay from "../MarkdownDisplay";
import {
	getIncomingNodes,
	isComponentOfType,
} from "../../IGCItems/utils/utils";
import style from "./FileEditor.module.css";
import { STYLES } from "@/styles/constants";
import { IGCViewProps, RegisteredView } from "@/IGCItems/views/BaseView";
import { nodeTypes } from "@/IGCItems/utils/types";
import { IGCNodeProps } from "@/IGCItems/nodes/BaseNode";
import { RegistryComponent } from "@/types/frontend";
import _ from "lodash";
import { serializeGraphData } from "@/IGCItems/utils/serialization";
import { loadSessionData } from "@/utils/sessionHandler";

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
	// const {
	// 	error: readFileError,
	// 	loading: readFileLoading,
	// 	sendRequest: readFileSendRequest,
	// } = useAxiosRequest<GetFilePathRequest, GetFilePathResponse>();
	// Request for saving file content
	// const { error: saveFileError, sendRequest: saveFileSendRequest } =
	// 	useAxiosRequest<SaveFilePathRequest, null>();
	// References to the console terminal
	// const fitAddons = useRef<(FitAddon | null)[]>([]);

	const selectedFile = useStore((state) => state.selectedFile);
	const fileContent = useStore((state) => state.fileContent);
	const fileChanged = useStore((state) => state.fileChanged);
	const setHasEditorInitialized = useStore(
		(state) => state.setHasEditorInitialized,
	);
	const isIGCFile = useStore((state) => state.isIGCFile);
	const setSavedNodes = useStore((state) => state.setSavedNodes);
	const setSavedEdges = useStore((state) => state.setSavedEdges);

	const navBarContainer = useStore((state) => state.navBarContainer);
	const setNavBarContainer = useStore((state) => state.setNavBarContainer);

	const selectedItem = useStore(
		(state) => state.selectedItem,
		(prevItem, nextItem) => prevItem?.id === nextItem?.id, // Only re-render if id changes
	);
	// STATE
	const [isCollapsed, setIsCollapsed] = useState<boolean>(false); // State for collapsing the file editor
	const [width, setWidth] = useState(500); // State for the width of the file editor
	const [activeTab, setActiveTab] = useState(0);
	const [views, setViews] = useState<(IGCViewProps & RegistryComponent)[]>(
		[],
	);
	// UTIL FUNCTIONS

	// // INITIALIZE MODELS
	// const checkInitializeModels = () => {
	// 	if (selectedFile !== null && localContentBuffer !== null) {
	// 		if (!isIGCFile) {
	// 			if (!modelExists(EditorDisplayContentType.NORMAL)) {
	// 				createModel(selectedFile, localContentBuffer, "text");
	// 				// showModel(EditorDisplayContentType.NORMAL);
	// 			} else {
	// 				tryShowModel();
	// 			}
	// 		} else {
	// 			if (!modelExists(EditorDisplayContentType.IGC_NORMAL)) {
	// 				const serializedData =
	// 					serializeGraphData(localContentBuffer);
	// 				setNodes(() => serializedData.nodes);
	// 				setEdges(() => serializedData.edges);
	// 			} else {
	// 				tryShowModel();
	// 			}
	// 		}
	// 	}
	// };
	// // UPDATE MODEL FUNCTIONS FROM NODE/EDGE CHANGES
	// // Update all code models
	// const updateAllCodeModels = () => {
	// 	// Note, for this to work, the model has to be initialized when the selected node is chosen

	// 	if (selectedFile === null) {
	// 		throw new Error(
	// 			"Selected file does not exist! This should not happen!",
	// 		);
	// 	}
	// 	// Go through every node to see if it is in the models map
	// 	setModels((prev) => {
	// 		for (const node of nodes) {
	// 			const codeKey = generateCodeKey(selectedFile, node.id);
	// 			if (prev.has(codeKey)) {
	// 				const model = prev.get(codeKey);
	// 				model.pushEditOperations(
	// 					[],
	// 					[
	// 						{
	// 							range: model.getFullModelRange(),
	// 							text: node.data.code,
	// 						},
	// 					],
	// 					() => null,
	// 				);
	// 				prev.set(codeKey, model);
	// 			}
	// 		}
	// 		return new Map(prev);
	// 	});
	// };
	// // Update the filter model
	// const updateFilterModel = () => {
	// 	if (selectedFile === null) {
	// 		throw new Error(
	// 			"Selected file does not exist! This should not happen!",
	// 		);
	// 	}
	// 	setModels((prev) => {
	// 		const filteredKey = `${selectedFile}-filtered`;
	// 		const model = prev.get(filteredKey);
	// 		if (model) {
	// 			model.pushEditOperations(
	// 				[],
	// 				[
	// 					{
	// 						range: model.getFullModelRange(),
	// 						text: filteredIGCVersion(),
	// 					},
	// 				],
	// 				() => null,
	// 			);
	// 			prev.set(filteredKey, model);
	// 		} else {
	// 			throw new Error(
	// 				"Model does not exist! This should not happen!",
	// 			);
	// 		}
	// 		return new Map(prev);
	// 	});
	// };
	// // Update the IGC model
	// const updateIGCModel = () => {
	// 	if (selectedFile === null) {
	// 		throw new Error(
	// 			"Selected file does not exist! This should not happen!",
	// 		);
	// 	}
	// 	setModels((prev) => {
	// 		const model = prev.get(selectedFile);
	// 		if (model) {
	// 			model.pushEditOperations(
	// 				[],
	// 				[
	// 					{
	// 						range: model.getFullModelRange(),
	// 						text: deserializeGraphData(nodes, edges),
	// 					},
	// 				],
	// 				() => null,
	// 			);
	// 			prev.set(selectedFile, model);
	// 		} else {
	// 			throw new Error(
	// 				"Model does not exist! This should not happen!",
	// 			);
	// 		}
	// 		return new Map(prev);
	// 	});
	// };

	// const updateAllModels = (updateAll = false) => {
	// 	if (updateAll || changeFromType !== EditorDisplayContentType.CODE) {
	// 		updateAllCodeModels();
	// 	}
	// 	if (updateAll || changeFromType !== EditorDisplayContentType.FILTERED) {
	// 		updateFilterModel();
	// 	}
	// 	if (
	// 		updateAll ||
	// 		changeFromType !== EditorDisplayContentType.IGC_NORMAL
	// 	) {
	// 		updateIGCModel();
	// 	}
	// 	setChangeFromType(EditorDisplayContentType.NONE);
	// };

	// // Update the text editor with the current state of the nodes and edges
	// useEffect(() => {
	// 	if (isIGCFile && selectedFile !== null && localContentBuffer !== null) {
	// 		// setLocalContentBuffer(() => deserializeGraphData(nodes, edges));

	// 		if (modelExists(EditorDisplayContentType.IGC_NORMAL)) {
	// 			if (changeFromType === EditorDisplayContentType.NONE) {
	// 				setChangeFromType(EditorDisplayContentType.EDITOR);
	// 			} else {
	// 				updateAllModels();
	// 			}
	// 		} else {
	// 			// Initialize essential models
	// 			createModel(selectedFile, localContentBuffer, "json");
	// 			createModel(
	// 				`${selectedFile}-filtered`,
	// 				filteredIGCVersion(),
	// 				"json",
	// 			);
	// 		}
	// 		// Save icon logic
	// 		const fileHistory = fileHistories.get(selectedFile);
	// 		if (fileHistory) {
	// 			const psc = fileHistory.prevSavedContent;
	// 			const current = deserializeGraphData(nodes, edges);
	// 			if (psc !== current) {
	// 				setIsSaved(false);
	// 			} else {
	// 				setIsSaved(true);
	// 			}
	// 		}
	// 	}
	// }, [nodes, edges]);

	// useEffect(() => {
	// 	if (
	// 		isIGCFile &&
	// 		selectedFile !== null &&
	// 		localContentBuffer !== null &&
	// 		changeFromType === EditorDisplayContentType.EDITOR
	// 	) {
	// 		updateAllModels(true);
	// 	}
	// }, [changeFromType]);

	// const tryShowModel = () => {
	// 	if (selectedFile !== null && localContentBuffer !== null) {
	// 		const displayType = getDisplayType();
	// 		if (modelExists(displayType)) {
	// 			if (
	// 				editorRef.current.getModel() !==
	// 				models.get(getDisplayTypeRawContent(displayType).key)
	// 			) {
	// 				showModel(displayType);
	// 			} else {
	// 				console.log("Model already is being shown!");
	// 			}
	// 		}
	// 	}
	// };

	// useEffect(() => {
	// 	if (selectedFile !== null && localContentBuffer !== null) {
	// 		checkInitializeModels();
	// 	}
	// }, [localContentBuffer]);

	// // WHEN SPECIFIC METHODS CHANGE TEXT HANDLERS
	// // When code changes
	// const codeChange = (changeValue: string) => {
	// 	setChangeFromType(EditorDisplayContentType.CODE);
	// 	// Needs to be called every update of the editor to make sure we do not lose the changes
	// 	const codeIGCContent: string = models
	// 		.get(getDisplayTypeRawContent(EditorDisplayContentType.CODE).key)
	// 		.getValue();

	// 	// Update the code in the selected node
	// 	setNodes((prevNodes) =>
	// 		prevNodes.map((node) => {
	// 			if (node.id === selectedItem?.id) {
	// 				node.data.code = codeIGCContent;
	// 			}
	// 			return node;
	// 		}),
	// 	);

	// 	// If empty, add suggestions
	// 	if (
	// 		changeValue === "" &&
	// 		monacoRef.current &&
	// 		editorRef.current &&
	// 		selectedItem !== null
	// 	) {
	// 		showSuggestionSnippet(
	// 			selectedItem.item.type || null,
	// 			"python",
	// 			monacoRef.current,
	// 			editorRef.current,
	// 		);
	// 	}
	// };
	// // When filtered text changes
	// const filterChange = () => {
	// 	setChangeFromType(EditorDisplayContentType.FILTERED);
	// 	// Needs to be called every update of the editor to make sure we do not lose the changes
	// 	const filteredIGCContent: string = models
	// 		.get(
	// 			getDisplayTypeRawContent(EditorDisplayContentType.FILTERED).key,
	// 		)
	// 		.getValue();
	// 	if (!isValidJSON(filteredIGCContent)) {
	// 		return;
	// 	}

	// 	// Merge to the raw IGC data
	// 	const jsonIGCContent = serializeGraphData(
	// 		deserializeGraphData(nodes, edges),
	// 	);
	// 	console.log("jsonIGCContent\n", jsonIGCContent);
	// 	const jsonFilteredIGCContent = JSON.parse(filteredIGCContent);
	// 	console.log("jsonFilteredIGCContent\n", jsonFilteredIGCContent);
	// 	const newIGCContent = mergeChanges(
	// 		jsonIGCContent,
	// 		jsonFilteredIGCContent,
	// 	);
	// 	console.log("newIGCContent\n", newIGCContent);

	// 	// Update Nodes and Edges to the newIGCContent
	// 	setNodes(() => newIGCContent.nodes);
	// 	setEdges(() => newIGCContent.edges);
	// };
	// // When normal IGC Text changes
	// const normalIGCChange = () => {
	// 	setChangeFromType(EditorDisplayContentType.IGC_NORMAL);
	// 	// Update the nodes/edges from raw IGC content
	// 	const rawIGCKey = getDisplayTypeRawContent(
	// 		EditorDisplayContentType.IGC_NORMAL,
	// 	).key;
	// 	const rawIGCModel = models.get(rawIGCKey);
	// 	const rawIGCContent: string = rawIGCModel.getValue();
	// 	if (!isValidJSON(rawIGCContent)) {
	// 		return;
	// 	}
	// 	const newIGCContent = JSON.parse(rawIGCContent);
	// 	setNodes(() => newIGCContent.nodes);
	// 	setEdges(() => newIGCContent.edges);
	// };

	// // GET DISPLAY TYPE VALUE FUNCTIONS
	// // Get filtered version of the JSON content
	// const filteredIGCVersion = (): string => {
	// 	const currentIGCContent = JSON.parse(
	// 		deserializeGraphData(nodes, edges),
	// 	);
	// 	return JSON.stringify(
	// 		applyFilter(currentIGCContent, filterRulesIGC),
	// 		null,
	// 		4,
	// 	);
	// };
	// // Get the code of the selected item
	// const codeVersion = (): string => {
	// 	return selectedItem?.item.type === "node"
	// 		? selectedItem.item.object.data.code
	// 		: "THIS SHOULD NOT HAPPEN, SELECTED ITEM IS NOT VALID OR NOT A NODE!";
	// };
	// const getDisplayType = (): EditorDisplayContentType => {
	// 	if (selectedFile === null) {
	// 		throw new Error("Selected file is null, this should not happen!");
	// 	}
	// 	if (!isIGCFile) {
	// 		return EditorDisplayContentType.NORMAL;
	// 	} else if (selectedItem?.item.type === "node") {
	// 		return EditorDisplayContentType.CODE;
	// 	} else if (filterContent) {
	// 		return EditorDisplayContentType.FILTERED;
	// 	}
	// 	return EditorDisplayContentType.IGC_NORMAL;
	// };

	// const getDisplayTypeRawContent = (
	// 	displayType: EditorDisplayContentType,
	// ): { key: string; rawValueFunc: () => string } => {
	// 	if (selectedFile === null || fileContent === null) {
	// 		throw new Error(
	// 			"Selected file or file content is null, this should not happen!",
	// 		);
	// 	}
	// 	if (displayType === EditorDisplayContentType.NORMAL) {
	// 		return { key: selectedFile, rawValueFunc: () => fileContent };
	// 	} else if (displayType === EditorDisplayContentType.IGC_NORMAL) {
	// 		return {
	// 			key: selectedFile,
	// 			rawValueFunc: () => deserializeGraphData(nodes, edges),
	// 		};
	// 	} else if (displayType === EditorDisplayContentType.FILTERED) {
	// 		return {
	// 			key: `${selectedFile}-filtered`,
	// 			rawValueFunc: filteredIGCVersion,
	// 		};
	// 	} else if (displayType === EditorDisplayContentType.CODE) {
	// 		if (selectedItem === null) {
	// 			throw new Error(
	// 				"THIS SHOULD NOT HAPPEN, SELECTED ITEM CANNOT BE NULL HERE!",
	// 			);
	// 		}
	// 		if (selectedItem.item.type !== "node") {
	// 			throw new Error(
	// 				"THIS SHOULD NOT HAPPEN, SELECTED ITEM MUST BE A NODE HERE!",
	// 			);
	// 		}
	// 		return {
	// 			key: generateCodeKey(selectedFile, selectedItem.id),
	// 			rawValueFunc: codeVersion,
	// 		};
	// 	} else {
	// 		throw new Error("Display type not recognized");
	// 	}
	// };

	// Toggle the visibility of the file editor
	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	// MONACO EDITOR FUNCTIONS
	// const handleEditorMount = (editor: any, monaco: Monaco) => {
	// 	monacoRef.current = monaco;
	// 	editorRef.current = editor;

	// 	// Make sure there is an update for when editor.current is updated
	// 	checkInitializeModels();
	// };
	// const handleResize = useCallback(() => {
	// 	// if (editorRef.current) {
	// 	// 	editorRef.current.layout();
	// 	// }
	// 	fitAddons.current.forEach((fitAddon) => fitAddon?.fit());
	// }, []);

	// Resizing the editor
	// useEffect(() => {
	// 	// Window resize event listener
	// 	window.addEventListener("resize", handleResize);

	// 	return () => {
	// 		window.removeEventListener("resize", handleResize);
	// 	};
	// }, [handleResize]);

	// // Event listener for keydown
	// const handleKeyDown = (event: KeyboardEvent) => {
	// 	// Setting the filter to false
	// 	if ((event.ctrlKey || event.metaKey) && event.code === "Backslash") {
	// 		event.preventDefault();
	// 		if (filterContent) {
	// 			setFilterContent(false);
	// 		} else {
	// 			setFilterContent(true);
	// 		}
	// 	}
	// 	// For saving the file
	// 	if ((event.ctrlKey || event.metaKey) && event.key === "s") {
	// 		event.preventDefault();
	// 		saveChanges();
	// 	}
	// };

	// useEffect(() => {
	// 	window.addEventListener("keydown", handleKeyDown);

	// 	return () => {
	// 		window.removeEventListener("keydown", handleKeyDown);
	// 	};
	// }, [handleKeyDown]);

	// // Overall change handler from editor
	// const handleEditorChange = (value: string | undefined) => {
	// 	// Check history if the file is the previously saved file
	// 	const fileHistory = fileHistories.get(selectedFile || "");
	// 	if (fileHistory) {
	// 		if (isIGCFile) {
	// 			// Logic should happen after node/edge change
	// 		} else if (fileHistory.prevSavedContent !== value) {
	// 			setIsSaved(false);
	// 		} else {
	// 			setIsSaved(true);
	// 		}
	// 	} else {
	// 		throw new Error(
	// 			"File history does not exist, this should not happen!",
	// 		);
	// 	}

	// 	// Update the local content buffer
	// 	setLocalContentBuffer(() => value || "");

	// 	// Update the Node/Edge data from the change;
	// 	if (changeFromType !== EditorDisplayContentType.EDITOR)
	// 		if (getDisplayType() === EditorDisplayContentType.CODE) {
	// 			codeChange(value || "");
	// 		} else if (getDisplayType() === EditorDisplayContentType.FILTERED) {
	// 			filterChange();
	// 		} else if (
	// 			getDisplayType() === EditorDisplayContentType.IGC_NORMAL
	// 		) {
	// 			normalIGCChange();
	// 		} else if (getDisplayType() === EditorDisplayContentType.NORMAL) {
	// 		} else {
	// 			console.error("Display type not recognized");
	// 		}
	// 	else {
	// 		setChangeFromType(EditorDisplayContentType.NONE);
	// 	}
	// };

	// // Checks if a model exists corrospoinding to the display type
	// const modelExists = (displayType: EditorDisplayContentType): boolean => {
	// 	// Get the key of the model
	// 	const { key } = getDisplayTypeRawContent(displayType);

	// 	return models.has(key);
	// };

	// // Create model
	// const createModel = (key: string, value: string, language = "python") => {
	// 	const debug = false; // Debugging flag
	// 	if (!monacoRef.current || !editorRef.current) {
	// 		debug &&
	// 			console.log(
	// 				"Monaco editor or monaco instance is not available",
	// 			);
	// 		return;
	// 	}

	// 	debug && console.log("Creating new model: ", key);
	// 	const model = monacoRef.current.editor.createModel(value, language);
	// 	setModels((prevModels) => new Map(prevModels.set(key, model)));

	// 	return model;
	// };

	// // Update the Monaco Editor with the model from the given display type
	// const showModel = (displayType: EditorDisplayContentType) => {
	// 	const debug = true; // Debugging flag

	// 	if (!monacoRef.current || !editorRef.current) {
	// 		debug &&
	// 			console.log(
	// 				"Monaco editor or monaco instance is not available",
	// 			);
	// 		return;
	// 	}

	// 	// Get the key of the model to show
	// 	const { key } = getDisplayTypeRawContent(displayType);

	// 	// Get the model
	// 	let model = models.get(key);
	// 	debug && console.log("\n\nTrying to show model: ", key);

	// 	// If it does not exist, throw an error
	// 	if (!model) {
	// 		debug && console.log("Cannot find model:", key);
	// 		throw new Error("Model not found");
	// 	} else {
	// 		debug && console.log("Found model: ", key);
	// 	}

	// 	// Set the model to the editor
	// 	if (editorRef.current) {
	// 		debug && console.log("Setting model to editor");
	// 		editorRef.current.setModel(model);
	// 		if (
	// 			displayType === EditorDisplayContentType.CODE &&
	// 			selectedItem !== null
	// 		) {
	// 			showRelaventDocumentation(selectedItem.item.object as Node);
	// 			setShowTerminal(true);
	// 			if (model.getValue() === "" && model.languageId === "python") {
	// 				showSuggestionSnippet(
	// 					selectedItem.item.type || null,
	// 					"python",
	// 					monacoRef.current,
	// 					editorRef.current,
	// 				);
	// 			}
	// 		} else {
	// 			setShowTerminal(false);
	// 			showRelaventDocumentation(null);
	// 		}
	// 	}
	// };

	// // Show only connected documentation nodes
	// const showRelaventDocumentation = (node: Node | null): void => {
	// 	if (node === null) {
	// 		setNodes((prevNodes) =>
	// 			prevNodes.map((n) => {
	// 				if (n.type === "DocumentationNode") {
	// 					n.hidden = true;
	// 				}
	// 				return n;
	// 			}),
	// 		);
	// 		return;
	// 	}
	// 	setNodes((prevNodes) => {
	// 		let nodesToShow: string[] = [];
	// 		if (node.type === "DocumentationNode") {
	// 			nodesToShow.push(node.id);
	// 		} else {
	// 			const incomingDocumentationNodes = getIncomingNodes(
	// 				node.id,
	// 				nodes,
	// 				edges,
	// 				(node) => node.type === "DocumentationNode",
	// 			);
	// 			if (incomingDocumentationNodes.length !== 0) {
	// 				nodesToShow.push(incomingDocumentationNodes[0].id);
	// 			}
	// 		}

	// 		return prevNodes.map((n) => {
	// 			if (nodesToShow.includes(n.id)) {
	// 				n.hidden = false;
	// 			} else if (n.type === "DocumentationNode") {
	// 				n.hidden = true;
	// 			}
	// 			return n;
	// 		});
	// 	});
	// };

	// // If the selected item changes, ensure it has a model
	// useEffect(() => {
	// 	if (
	// 		isIGCFile &&
	// 		selectedFile !== null &&
	// 		localContentBuffer !== null &&
	// 		selectedItem !== null &&
	// 		selectedItem.item.type === "node"
	// 	) {
	// 		const codeKey = generateCodeKey(selectedFile, selectedItem.id);
	// 		if (!models.has(codeKey)) {
	// 			createModel(
	// 				codeKey,
	// 				selectedItem.item.object.data.code,
	// 				selectedItem.item.object.data.language
	// 					? selectedItem.item.object.data.language
	// 					: "python",
	// 			);
	// 		}
	// 		// Show any documentation if it exists
	// 		//showRelaventDocumentation(selectedItem.item as Node);
	// 	} else if (
	// 		isIGCFile &&
	// 		selectedFile !== null &&
	// 		localContentBuffer !== null
	// 	) {
	// 		// showRelaventDocumentation(null);
	// 	}
	// }, [selectedItem]);

	// useEffect(() => {
	// 	tryShowModel();
	// }, [filterContent, selectedItem, models]);

	useEffect(() => {
		const hasEditor = useStore.getState().hasEditor;
		if (
			fileContent !== null &&
			isIGCFile &&
			selectedFile !== null &&
			selectedFile in hasEditor &&
			!hasEditor[selectedFile]
		) {
			setHasEditorInitialized(selectedFile);
			const serializedData = serializeGraphData(fileContent);
			useStore
				.getState()
				.setNodes(selectedFile, () => serializedData.nodes);
			useStore
				.getState()
				.setEdges(selectedFile, () => serializedData.edges);
			// Need a copy of the data to prevent references
			const serializedData2 = serializeGraphData(fileContent);

			setSavedNodes(selectedFile, () =>
				serializedData2.nodes.reduce<{ [id: string]: Node }>(
					(acc, node) => {
						acc[node.id] = node;
						return acc;
					},
					{},
				),
			);

			setSavedEdges(selectedFile, () =>
				serializedData2.edges.reduce<{ [id: string]: Edge }>(
					(acc, edge) => {
						acc[edge.id] = edge;
						return acc;
					},
					{},
				),
			);

			loadSessionData(selectedFile);
		}
	}, [fileChanged]);

	// FILE OPERATION FUNCTIONS
	// const saveChanges = () => {
	// 	if (localContentBuffer !== null && selectedFile !== null) {
	// 		let saveContent = localContentBuffer;
	// 		if (isIGCFile) {
	// 			saveContent = deserializeGraphData(nodes, edges);
	// 		}
	// 		saveFileSendRequest({
	// 			method: "POST",
	// 			data: { path: selectedFile, content: saveContent },
	// 			route: "/api/file-explorer/file-content",
	// 			useJWT: false,
	// 		}).then(() => {
	// 			console.log("File saved");
	// 			setIsSaved(true);
	// 			const currentTime = Date.now();
	// 			setFileHistories(
	// 				() =>
	// 					new Map(
	// 						fileHistories.set(selectedFile, {
	// 							lastSavedTimestamp: currentTime,
	// 							prevContent: saveContent,
	// 							prevSavedContent: saveContent,
	// 						}),
	// 					),
	// 			);
	// 			// Update the file content with what was saved
	// 			setFileContent(() => saveContent);
	// 		});
	// 	}
	// };

	// // Fetch the file content
	// const fetchFileContent = async () => {
	// 	// Make sure a file is valid
	// 	if (selectedFile === null) {
	// 		return;
	// 	}
	// 	// Read the new file content
	// 	try {
	// 		const response = await readFileSendRequest({
	// 			method: "GET",
	// 			data: { path: selectedFile },
	// 			route: "/api/file-explorer/file-content",
	// 			useJWT: false,
	// 		});

	// 		const { content, lastModified } = response;
	// 		const fileHistory = fileHistories.get(selectedFile);
	// 		const previousTimestamp = fileHistory?.lastSavedTimestamp;

	// 		// Push the file content to the store
	// 		setFileContent(() => content);

	// 		// Check if the file has changed externally
	// 		if (previousTimestamp && lastModified > previousTimestamp) {
	// 			const shouldRefresh = await openConfirmDialog(
	// 				"The file has changed externally. Would you like to refresh?",
	// 				"Refresh",
	// 				"Keep Changes",
	// 			);
	// 			if (shouldRefresh) {
	// 				setLocalContentBuffer(() => content);
	// 				setIsSaved(true);
	// 				setFileHistories(
	// 					() =>
	// 						new Map(
	// 							fileHistories.set(selectedFile, {
	// 								lastSavedTimestamp: lastModified,
	// 								prevContent: content,
	// 								prevSavedContent: content,
	// 							}),
	// 						),
	// 				);
	// 			}
	// 		}
	// 		// Check if there was previous history of the file
	// 		else if (fileHistory) {
	// 			setLocalContentBuffer(() => fileHistory.prevContent);
	// 			if (content !== fileHistory.prevContent) {
	// 				setIsSaved(false);
	// 			} else {
	// 				setIsSaved(true);
	// 			}
	// 		} else {
	// 			setLocalContentBuffer(() => content);
	// 			setIsSaved(true);
	// 			setFileHistories(
	// 				() =>
	// 					new Map(
	// 						fileHistories.set(selectedFile, {
	// 							lastSavedTimestamp: lastModified,
	// 							prevContent: content,
	// 							prevSavedContent: content,
	// 						}),
	// 					),
	// 			);
	// 		}
	// 	} catch (error) {
	// 		console.error("Error fetching the file:", error);
	// 	}
	// };
	// If the selected file changes, fetch the new file content
	// useEffect(() => {
	// 	if (selectedFile !== null) {
	// 		fetchFileContent();
	// 	}
	// }, [selectedFile]);

	const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
		// if(fitAddons.current && newValue <2){
		//     fitAddons.current[newValue]?.fit();
		// }
		setActiveTab(newValue);
	};

	const createTabs = (
		views: (IGCViewProps & RegistryComponent)[],
	): JSX.Element => {
		if (views.length <= 0) {
			// Change to 1 later
			return <></>;
		}
		return (
			<div style={{ overflowX: "scroll", scrollbarWidth: "none" }}>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					className={style.tabs}
					sx={{
						padding: "0px 10px",
						height: STYLES.tabHeight,
						minHeight: STYLES.tabHeight,
						display: "inline-flex",
					}}
				>
					{views.map((view, index) => {
						return <Tab label={view.displayName} key={index} />;
					})}
				</Tabs>
			</div>
		);
	};
	const createTabContent = (view: IGCViewProps[]): JSX.Element => {
		if (view.length === 0) {
			return <></>;
		}
		const Component = view[activeTab];
		return <Component />;
	};
	const componentIncludes = (
		component: RegistryComponent,
		forComponents: RegistryComponent[],
	): boolean => {
		for (let i = 0; i < forComponents.length; i++) {
			const ref = forComponents[i];
			if (isComponentOfType(component, ref)) {
				return true;
			}
		}
		return false;
	};
	const validView = (view: RegisteredView): boolean => {
		const viewTypes = useStore.getState().viewTypes;
		return view.key in viewTypes && viewTypes[view.key].enabled;
	};
	const getViews = (): (IGCViewProps & RegistryComponent)[] => {
		const selectedComponent = selectedItem?.item;
		const nodeTypes = useStore.getState().nodeTypes;
		const relationshipTypes = useStore.getState().relationshipTypes;
		const viewTypes = useStore.getState().viewTypes;
		const allViews = Object.values(viewTypes)
			.map((vt) => vt.object)
			.filter((v) => validView(v));
		// General views
		if (selectedComponent === undefined) {
			return allViews.filter((view) => view.forComponents.length === 0);
		} else {
			const componentType = selectedComponent.object.type;
			if (
				componentType === undefined ||
				(selectedComponent.type === "node" &&
					!(componentType in nodeTypes) &&
					nodeTypes[componentType].enabled) ||
				(selectedComponent.type === "relationship" &&
					!(componentType in relationshipTypes) &&
					relationshipTypes[componentType].enabled)
			) {
				return allViews.filter(
					(view) => view.forComponents.length === 0,
				);
			}
			const realComponent: RegistryComponent =
				selectedComponent.type === "node"
					? nodeTypes[componentType].object
					: relationshipTypes[componentType].object;
			const views = allViews.filter((view) =>
				componentIncludes(realComponent, view.forComponents),
			);
			return views.length > 0
				? views
				: allViews.filter((view) => view.forComponents.length === 0);
		}
		// else if (selectedComponent.type === "node") {
		// 	const componentType = selectedComponent.object.type;
		// 	if (componentType === undefined || !(componentType in nodeTypes)) {
		// 		return [];
		// 	}
		// 	const realComponent: IGCNodeProps & RegistryComponent =
		// 		nodeTypes[componentType].object;
		// 	return allViews.filter((view) =>
		// 		componentIncludes(realComponent, view.forComponents),
		// 	);
		// } else if (selectedComponent.type === "relationship") {
		// 	const componentType = selectedComponent.object.type;
		// 	if (
		// 		componentType === undefined ||
		// 		!(componentType in relationshipTypes)
		// 	) {
		// 		return [];
		// 	}
		// 	const realComponent = relationshipTypes[componentType].object;
		// 	return allViews.filter((view) =>
		// 		view.forComponents.includes(realComponent),
		// 	);
		// }
		// return [];
	};
	useEffect(() => {
		const v = getViews().sort((v1, v2) => v1.weight - v2.weight);
		// Clean the nav bar elements
		if (
			!_.isEqual(
				v.map((v2) => v2.key),
				views.map((v2) => v2.key),
			)
		) {
			setNavBarContainer(() => []);
		}
		setViews(v);
	}, [selectedItem?.id, selectedItem?.item.type, fileChanged]);

	const navBarElements = navBarContainer
		.sort((a, b) => a.weight - b.weight)
		.map((element) => element.element);

	return (
		<ResizableBox
			width={isCollapsed ? 40 : width}
			height={Infinity}
			axis="x"
			minConstraints={[40, Infinity]}
			maxConstraints={[800, Infinity]}
			onResize={(_, { size }) => setWidth(size.width)}
			// onResizeStop={handleResize}
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
					<div
						className={`navbar-component ${
							isCollapsed ? "collapsed" : ""
						}`}
					>
						{!isCollapsed && (
							<>
								<span className="navbar-component-title">
									Code Editor
								</span>
								{navBarElements}
								{/* {selectedFile && (
									
								)} */}
								<span className="take-full-width"></span>
								{/* {isIGCFile &&
									selectedItem &&
									projectDirectory !== null &&
									selectedItem.type === "Node" &&
									selectedItem.item.type !==
										"DocumentationNode" && (
										<button
											className="icon-button"
											title="Run Code"
											onClick={() =>
												runCode(
													selectedItem.item.data.code,
													selectedItem.id,
                                                    selectedItem.item.data.scope,
												)
											}
											disabled={
												selectedItem.item.data.code ===
													"" ||
												currentSessionId === null
											}
										>
											<PlayArrow />
										</button>
									)} */}
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
					<div
						style={{
							// flexGrow: 1,
							// overflowY: "auto",
							display: isCollapsed ? "none" : "flex",
							flexDirection: "column",
							height: "100vh",
							overflow: "hidden",
                            paddingLeft: "2px",
						}}
					>
						<div className={style.tabsContainer}>{createTabs(views)}</div>
						<Box
							sx={{
								flexGrow: 1,
								overflow: "hidden",
								position: "relative",
							}}
						>
							{createTabContent(views)}
						</Box>
						<div>
							<SelectionPane />
						</div>
					</div>
					{/* <Box
						sx={{
							flexGrow: 1,
							overflowY: "auto",
							display: isCollapsed ? "none" : "block",
						}}
					>
						{readFileLoading && <div>Loading...</div>}
						{readFileError !== null && (
							<div>Error: {readFileError}</div>
						)}
						{isIGCFile &&
							selectedFile !== null &&
							fileContent !== null &&
							selectedItem !== null &&
							selectedItem.type === "Node" &&
							selectedItem.item.type !== "DocumentationNode" && (
								<MarkdownDisplay
									node={selectedItem.item as Node}
								/>
							)}
						<div
							style={{ height: "100%" }}
							hidden={selectedFile === null}
						>
							<Editor
								height="100%"
								// theme="vs-dark"
								theme={mode === "light" ? "light" : "vs-dark"}
								options={{ readOnly: false }}
								onMount={handleEditorMount}
								onChange={handleEditorChange}
								loading={<div>Loading...</div>}
							/>
						</div>

						{!selectedFile && (
							<div style={{ textAlign: "center" }}>
								Select a file to view its content.
							</div>
						)}
					</Box> */}
					{/* {showTerminal &&
						selectedItem !== null &&
						codeRunData.get(selectedItem.id) !== undefined && (
							<TabbedCodeOutput
								codeRunData={codeRunData.get(selectedItem.id)}
								fitAddons={fitAddons}
							/>
						)}

					<div
						className="selection-pane-container"
						style={{ display: isCollapsed ? "none" : "block" }}
					>
						<SelectionPane />
					</div> */}
				</div>
			</div>
		</ResizableBox>
	);
};
// FileEditor.whyDidYouRender = true;

export default FileEditor;
