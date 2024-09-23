import { Node, Edge } from "reactflow";
import {
	CodeRunData,
	ElementItem,
	Item,
	ModuleComponent,
	RegistryComponent,
	SessionData,
} from "@/types/frontend";
import { createWithEqualityFn } from "zustand/traditional";
import { IGCNodeProps } from "@/IGCItems/nodes/BaseNode";
import { IGCRelationshipProps } from "@/IGCItems/relationships/BaseRelationship";
import { IGCViewProps } from "@/IGCItems/views/BaseView";
import { Cache, GetFileContentResponse } from "shared";
import { getFileContent } from "@/requests";

interface FileHistory {
	lastSavedTimestamp: number;
	lastSavedContent: string;
}
type ThemeMode = "light" | "dark";

type Callback = () => void;

type RegisteredNode = IGCNodeProps & RegistryComponent;
type RegisteredRelationship = IGCRelationshipProps & RegistryComponent;
type RegisteredView = IGCViewProps & RegistryComponent;

interface State {
	// VARIABLES
	selectedFile: string | null;
	setSelectedFile: (updater: (prev: string | null) => string | null) => void;

	projectDirectory: string | null;
	setProjectDirectory: (
		updater: (prev: string | null) => string | null,
	) => void;

	fileContent: string | null;
	updateFileContent: (
		updater: (prev: string | null) => string | null,
	) => void;

	fileChanged: number;
	// localContentBuffer: string | null;
	// setLocalContentBuffer: (
	// 	updater: (prev: string | null) => string | null,
	// ) => void;

	fileHistory: { [key: string]: FileHistory };
	setFileHistory: (
		updater: (prev: { [key: string]: FileHistory }) => {
			[key: string]: FileHistory;
		},
	) => void;

	isIGCFile: boolean; // THIS WILL UPDATE ONLY JUST AFTER THE FILE SELECTED IS CHANGED

	selectedItems: Item[];
	setSelectedItems: (updater: (prev: Item[]) => Item[]) => void;

	selectedItem: Item | null;
	setSelectedItem: (updater: (prev: Item | null) => Item | null) => void;

	hasEditor: { [fileKey: string]: boolean };
	setHasEditorCreated: (fileKey: string) => void;
	setHasEditorInitialized: (fileKey: string) => void;

	nodes: { [file: string]: Node[] };
	setNodes: (file: string, updater: (prev: Node[]) => Node[]) => void;
    getNodes: (file: string) => Node[];
	savedNodes: { [file: string]: { [id: string]: Node } };
	setSavedNodes: (
		file: string,
		updater: (prev: { [id: string]: Node }) => { [id: string]: Node },
	) => void;

	edges: { [file: string]: Edge[] };
	setEdges: (file: string, updater: (prev: Edge[]) => Edge[]) => void;
    getEdges: (file: string) => Edge[];
	savedEdges: { [file: string]: { [id: string]: Edge } };
	setSavedEdges: (
		file: string,
		updater: (prev: { [id: string]: Edge }) => { [id: string]: Edge },
	) => void;

	currentSessionId: string | null;
	setCurrentSessionId: (
		updater: (prev: string | null) => string | null,
	) => void;

	sessions: Map<string, SessionData>;
	setSessions: (
		updater: (prev: Map<string, SessionData>) => Map<string, SessionData>,
	) => void;

	codeRunData: Map<string, CodeRunData>;
	setCodeRunData: (
		updater: (prev: Map<string, CodeRunData>) => Map<string, CodeRunData>,
	) => void;

	mode: ThemeMode;
	setMode: (updater: (prev: ThemeMode) => ThemeMode) => void;

	// Registry for Node, Relationship, and View Components
	nodeTypes: ModuleComponent<RegisteredNode>;
	setNodeTypes: (
		updater: (
			prev: ModuleComponent<RegisteredNode>,
		) => ModuleComponent<RegisteredNode>,
	) => void;
	relationshipTypes: ModuleComponent<RegisteredRelationship>;
	setRelationshipTypes: (
		updater: (
			prev: ModuleComponent<RegisteredRelationship>,
		) => ModuleComponent<RegisteredRelationship>,
	) => void;
	viewTypes: ModuleComponent<RegisteredView>;
	setViewTypes: (
		updater: (
			prev: ModuleComponent<RegisteredView>,
		) => ModuleComponent<RegisteredView>,
	) => void;

	moduleData: Cache;
	setModuleData: (updater: (prev: Cache) => Cache) => void;

	navBarContainer: ElementItem[];
	setNavBarContainer: (
		updater: (prev: ElementItem[]) => ElementItem[],
	) => void;

	// HOOKS
	listenersEdgeTypeUpdate: Map<string, Set<Callback>>;
	triggerEdgeTypeUpdate: (id: string) => void;
	subscribeEdgeTypeUpdate: (id: string, callback: Callback) => () => void;
}

const useStore = createWithEqualityFn<State>((set, get) => ({
	// VARIABLES
	selectedFile: null,
	setSelectedFile: async (
		updater: (prev: string | null) => string | null,
	) => {
		// Initialize variables
		let fileContent: GetFileContentResponse | null = null;

		// Perform a synchronous update for selectedFile and get the updated file
		const updatedFile = updater(useStore.getState().selectedFile);

		// Await the async operation
		if (updatedFile !== null) {
			fileContent = await getFileContent(updatedFile);
		}
		const newFileHistoryElement = {
			lastSavedTimestamp: fileContent?.lastModified || 0,
			lastSavedContent: fileContent?.content || "",
		};

		set((state) => {
			// Save the previous file history
			if (updatedFile !== null && fileContent !== null) {
				const fileHistory: { [key: string]: FileHistory } = {};
				fileHistory[updatedFile] = newFileHistoryElement;

				return {
					fileHistory: { ...state.fileHistory, ...fileHistory },
					selectedFile: updatedFile,
					fileContent: fileContent.content,
					isIGCFile:
						updatedFile !== null && updatedFile.endsWith(".igc"),
					fileChanged: Date.now(),
				};
			}
			// If selected file is null, then we don't need to save the file history
			return {
				selectedFile: updatedFile,
				fileContent: fileContent?.content || null,
				isIGCFile: updatedFile !== null && updatedFile.endsWith(".igc"),
				fileChanged: Date.now(),
			};
		});
	},

	projectDirectory:
		"/Users/maxboksem/Documents/Master's Thesis/MSc-SE-Master-Project/content",
	setProjectDirectory: (updater: (prev: string | null) => string | null) =>
		set((state) => {
			state.setSelectedFile(() => null); // Reset the selected file
			return { projectDirectory: updater(state.projectDirectory) };
		}),

	fileContent: null,
	updateFileContent: (updater: (prev: string | null) => string | null) =>
		set((state) => {
			const fileContent = updater(state.fileContent);
			// Save the previous file history
			if (state.selectedFile !== null && fileContent !== null) {
				const newFileHistoryElement = {
					lastSavedTimestamp: Date.now(),
					lastSavedContent: fileContent,
				};
				const fileHistory: { [key: string]: FileHistory } = {};
				fileHistory[state.selectedFile] = newFileHistoryElement;

				return {
					fileHistory: { ...state.fileHistory, ...fileHistory },
					fileContent: fileContent,
					fileChanged: Date.now(),
				};
			}
			// If selected file is null, then we don't need to save the file history
			return {
				fileContent: fileContent,
				fileChanged: Date.now(),
			};
		}),
	fileChanged: Date.now(),
	// set((state) => ({ fileContent: updater(state.fileContent) })),

	// localContentBuffer: null,
	// setLocalContentBuffer: (updater: (prev: string | null) => string | null) =>
	// 	set((state) => ({
	// 		localContentBuffer: updater(state.localContentBuffer),
	// 	})),

	fileHistory: {},
	setFileHistory: (
		updater: (prev: { [key: string]: FileHistory }) => {
			[key: string]: FileHistory;
		},
	) => set((state) => ({ fileHistory: updater(state.fileHistory) })),

	isIGCFile: false,

	selectedItems: [],
	setSelectedItems: (updater: (prev: Item[]) => Item[]) =>
		set((state) => ({ selectedItems: updater(state.selectedItems) })),

	selectedItem: null,
	setSelectedItem: (updater: (prev: Item | null) => Item | null) =>
		set((state) => ({ selectedItem: updater(state.selectedItem) })),

	hasEditor: {},
	setHasEditorCreated: (fileKey: string) =>
		set((state) => {
			if (state.hasEditor[fileKey] === undefined) {
				state.hasEditor[fileKey] = false;
			}
			return state;
		}),
	setHasEditorInitialized: (fileKey: string) =>
		set((state) => {
			if (state.hasEditor[fileKey] !== undefined) {
				state.hasEditor[fileKey] = true;
			}
			return state;
		}),

	nodes: {},
	setNodes: (file, updater) =>
		set((state) => ({
			nodes: {
				...state.nodes,
				[file]: updater(state.nodes[file] || []),
			},
		})),
    getNodes: (file) => get().nodes[file] || [],

	savedNodes: {}, // Initial state for saved nodes
	setSavedNodes: (file, updater) =>
		set((state) => ({
			savedNodes: {
				...state.savedNodes,
				[file]: updater(state.savedNodes[file] || {}), // Apply updater to the file-specific saved nodes dictionary
			},
		})),

	edges: {},
	setEdges: (file, updater) =>
		set((state) => ({
			edges: {
				...state.edges,
				[file]: updater(state.edges[file] || []),
			},
		})),
    getEdges: (file) => get().edges[file] || [],
    
	savedEdges: {},
	setSavedEdges: (file, updater) =>
		set((state) => ({
			savedEdges: {
				...state.savedEdges,
				[file]: updater(state.savedEdges[file] || {}), // Apply updater to the file-specific saved nodes dictionary
			},
		})),

	currentSessionId: null,
	setCurrentSessionId: (updater: (prev: string | null) => string | null) =>
		set((state) => ({ currentSessionId: updater(state.currentSessionId) })),

	sessions: new Map<string, SessionData>(),
	setSessions: (
		updater: (prev: Map<string, SessionData>) => Map<string, SessionData>,
	) => set((state) => ({ sessions: updater(state.sessions) })),

	codeRunData: new Map<string, CodeRunData>(),
	setCodeRunData: (
		updater: (prev: Map<string, CodeRunData>) => Map<string, CodeRunData>,
	) => set((state) => ({ codeRunData: updater(state.codeRunData) })),

	// Registry for Node, Relationship, and View Components
	nodeTypes: {},
	setNodeTypes: (
		updater: (
			prev: ModuleComponent<RegisteredNode>,
		) => ModuleComponent<RegisteredNode>,
	) => set((state) => ({ nodeTypes: updater(state.nodeTypes) })),
	relationshipTypes: {},
	setRelationshipTypes: (
		updater: (
			prev: ModuleComponent<RegisteredRelationship>,
		) => ModuleComponent<RegisteredRelationship>,
	) =>
		set((state) => ({
			relationshipTypes: updater(state.relationshipTypes),
		})),
	viewTypes: {},
	setViewTypes: (
		updater: (
			prev: ModuleComponent<RegisteredView>,
		) => ModuleComponent<RegisteredView>,
	) => set((state) => ({ viewTypes: updater(state.viewTypes) })),

	moduleData: [],
	setModuleData: (updater: (prev: Cache) => Cache) =>
		set((state) => ({ moduleData: updater(state.moduleData) })),
	// HOOKS
	listenersEdgeTypeUpdate: new Map(),
	triggerEdgeTypeUpdate: (id: string) =>
		set((state) => {
			const listeners = state.listenersEdgeTypeUpdate.get(id);
			if (listeners) {
				listeners.forEach((listener) => listener());
			}
			return state;
		}),
	subscribeEdgeTypeUpdate: (id: string, callback: Callback) => {
		set((state) => {
			if (!state.listenersEdgeTypeUpdate.has(id)) {
				state.listenersEdgeTypeUpdate.set(id, new Set());
			}
			state.listenersEdgeTypeUpdate.get(id)!.add(callback);
			return state;
		});

		return () => {
			set((state) => {
				const listeners = state.listenersEdgeTypeUpdate.get(id);
				if (listeners) {
					listeners.delete(callback);
					if (listeners.size === 0) {
						state.listenersEdgeTypeUpdate.delete(id);
					}
				}
				return state;
			});
		};
	},

	mode: "light",
	setMode: (updater: (prev: ThemeMode) => ThemeMode) =>
		set((state) => ({ mode: updater(state.mode) })),

	navBarContainer: [],
	setNavBarContainer: (updater: (prev: ElementItem[]) => ElementItem[]) =>
		set((state) => ({ navBarContainer: updater(state.navBarContainer) })),
}));

export default useStore;
