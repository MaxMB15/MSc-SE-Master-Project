import { serializeGraphData } from "@/IGCItems/utils/serialization";
import {
	getSessionData,
	deleteNodeInSession,
	deleteExecutionInSession,
	getFileContent,
    callExecuteMany,
} from "@/requests";
import useStore from "@/store/store";
import { FileIdCodeList } from "shared";
import { Node } from "reactflow";
import { IGCCodeNodeData } from "@/IGCItems/nodes/CodeNode";

// This should update all the session and run data associated with the IGC file
export const loadSessionData = async (filePath: string) => {
	const sessionData = await getSessionData(filePath);
	useStore.getState().setSessionData(filePath, () => sessionData);
};

export const removeNodeInSession = async (filePath: string, nodeId: string) => {
	const affectedSessions = await deleteNodeInSession(filePath, nodeId);
	const sessionData = await getSessionData(filePath);
	const currentSessionId = useStore.getState().currentSessionId;
	if (
		currentSessionId !== null &&
		affectedSessions.includes(currentSessionId)
	) {
		useStore.getState().setCurrentSessionId(() => null);
	}
	useStore.getState().setSessionData(filePath, () => sessionData);
};

export const removeExecutionInSession = async (
	filePath: string,
	sessionId: string,
	executionNumber: number,
) => {
	// Remove execution data but keep the path
	const newExecutionPath = await deleteExecutionInSession(
		filePath,
		sessionId,
		executionNumber,
	);

	// Update the session data
    const newExecutionData = await createExecutionData(filePath, newExecutionPath);
    callExecuteMany(newExecutionData, "python", filePath, sessionId);

    // Update session data
    loadSessionData(filePath);
};
export const getExecutionPathFromSession = (
	filePath: string,
	sessionId: string,
): string[] => {
	const sessionData = useStore.getState().getSessionData(filePath);
	if (sessionData === undefined || !(sessionId in sessionData.sessions)) {
		return [];
	}
	const executionPaths = sessionData.sessions[sessionId].executions.map(
		(execution) => {
			// Make sure this is in order
			return execution.nodeId;
		},
	);

	return executionPaths;
};

export const createExecutionData = async (
	filePath: string,
	executionPath: string[],
): Promise<FileIdCodeList> => {
	const returnData: FileIdCodeList = {
		filePath: filePath,
		elements: [],
	};
	const fileContent = await getFileContent(filePath);
	const serializedGraphData = serializeGraphData(fileContent.content);
	const nodes = serializedGraphData.nodes;
	for (const nodeId in executionPath) {
		for (let i = 0; i < nodes.length; i++) {
			// Check which type of node
			let node: Node = nodes[i];
			if (node.id === nodeId) {
				// Code node
				if (node.data.codeData !== undefined) {
					returnData.elements.push({
						id: nodeId,
						data: node.data.codeData.code,
					});
				} else if (node.data.filePath !== undefined) {
					const newExecutionData = getExecutionPathFromSession(
						node.data.filePath,
						node.data.selectedSession,
					);
					if (newExecutionData.length > 0) {
						returnData.elements.push({
							id: nodeId,
							data: await createExecutionData(
								node.data.filePath,
								newExecutionData,
							),
						});
					}
				} else {
					console.error("Unknown node type! Please check...");
				}
				break;
			}
		}
	}
	return returnData;
};
