import { Node, Edge } from "reactflow";
import { CodeRunData, Item, SessionData } from "@/types/frontend";
import { create } from "zustand";

interface FileHistory {
	lastSavedTimestamp: number;
	prevContent: string;
	prevSavedContent: string;
}

interface State {
	selectedFile: string | null;
	setSelectedFile: (updater: (prev: string | null) => string | null) => void;

	fileContent: string | null;
	setFileContent: (updater: (prev: string | null) => string | null) => void;

	localContentBuffer: string | null;
	setLocalContentBuffer: (
		updater: (prev: string | null) => string | null,
	) => void;

	fileHistories: Map<string, FileHistory>;
	setFileHistories: (
		updater: (prev: Map<string, FileHistory>) => Map<string, FileHistory>,
	) => void;

	isIGCFile: boolean; // THIS WILL UPDATE ONLY JUST AFTER THE FILE SELECTED IS CHANGED

	selectedItems: Item[];
	setSelectedItems: (updater: (prev: Item[]) => Item[]) => void;

	selectedItem: Item | null;
	setSelectedItem: (updater: (prev: Item | null) => Item | null) => void;

	nodes: Node[];
	setNodes: (updater: (prev: Node[]) => Node[]) => void;

	edges: Edge[];
	setEdges: (updater: (prev: Edge[]) => Edge[]) => void;

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
}

const useStore = create<State>((set) => ({
	selectedFile: null,
	setSelectedFile: (updater: (prev: string | null) => string | null) =>
		set((state) => {
			// Update the file
			const updatedFile = updater(state.selectedFile);

			// Save the previous file history
			if (
				state.selectedFile !== null &&
				state.localContentBuffer !== null
			) {
				const prevFileHistory = state.fileHistories.get(
					state.selectedFile,
				);
				if (prevFileHistory) {
					return {
						selectedFile: updatedFile,
						isIGCFile:
							updatedFile !== null &&
							updatedFile.endsWith(".igc"),
						fileHistories: new Map(
							state.fileHistories.set(state.selectedFile, {
								lastSavedTimestamp:
									prevFileHistory.lastSavedTimestamp,
								prevContent: state.localContentBuffer,
								prevSavedContent:
									prevFileHistory.prevSavedContent,
							}),
						),
					};
				}
			}
			// Without the updated file history
			return {
				selectedFile: updatedFile,
				isIGCFile: updatedFile !== null && updatedFile.endsWith(".igc"),
			};
		}),

	fileContent: null,
	setFileContent: (updater: (prev: string | null) => string | null) =>
		set((state) => ({ fileContent: updater(state.fileContent) })),

	localContentBuffer: null,
	setLocalContentBuffer: (updater: (prev: string | null) => string | null) =>
		set((state) => ({
			localContentBuffer: updater(state.localContentBuffer),
		})),

	fileHistories: new Map<string, FileHistory>(),
	setFileHistories: (
		updater: (prev: Map<string, FileHistory>) => Map<string, FileHistory>,
	) => set((state) => ({ fileHistories: updater(state.fileHistories) })),

	isIGCFile: false,

	selectedItems: [],
	setSelectedItems: (updater: (prev: Item[]) => Item[]) =>
		set((state) => ({ selectedItems: updater(state.selectedItems) })),

	selectedItem: null,
	setSelectedItem: (updater: (prev: Item | null) => Item | null) =>
		set((state) => ({ selectedItem: updater(state.selectedItem) })),

	nodes: [],
	setNodes: (updater: (prev: Node[]) => Node[]) =>
		set((state) => ({ nodes: updater(state.nodes) })),

	edges: [],
	setEdges: (updater: (prev: Edge[]) => Edge[]) =>
		set((state) => ({ edges: updater(state.edges) })),

	currentSessionId: null,
	setCurrentSessionId: (updater: (prev: string | null) => string | null) =>
		set((state) => ({ currentSessionId: updater(state.currentSessionId) })),

	sessions: new Map<string, SessionData>(),
	setSessions: (updater: (prev: Map<string, SessionData>) => Map<string, SessionData>) =>
		set((state) => ({ sessions: updater(state.sessions) })),

	codeRunData: new Map<string, CodeRunData>(),
	setCodeRunData: (
		updater: (prev: Map<string, CodeRunData>) => Map<string, CodeRunData>,
	) => set((state) => ({ codeRunData: updater(state.codeRunData) })),
}));

export default useStore;
