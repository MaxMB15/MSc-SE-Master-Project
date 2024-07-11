import { CodeExecutionRequest, CodeExecutionResponse } from "@/types/common";
import { UseAxiosRequestOptions } from "./requests";
import { CodeRunData } from "@/types/frontend";
import { Edge } from "reactflow";
import {
	addEdge,
	getEdgeId,
} from "@/components/EditorPane/components/utils/utils";

// export const runCodeAnalysis = (
// 	runCodeSendRequest: (options: UseAxiosRequestOptions<CodeExecutionRequest>) => Promise<CodeExecutionResponse>,
// 	code: string,
// ) => {
//     runCodeSendRequest({
//         method: "POST",
//         data: { code, language: "python"},
//         route: "/api/file-explorer/file-content",
//         useJWT: false,
//     }).then((response: CodeExecutionResponse) => {
//         console.log(response)
//     });
// };

export const runCode = (
	runCodeSendRequest: (
		options: UseAxiosRequestOptions<CodeExecutionRequest>,
	) => Promise<CodeExecutionResponse>,
	code: string,
	nodeId: string,
	setRunCodeData: (
		updater: (prev: Map<string, CodeRunData>) => Map<string, CodeRunData>,
	) => void,
	currentSessionId: string | null,
	setCurrentSessionId: (
		updater: (prev: string | null) => string | null,
	) => void,
	setSessions: (
		updater: (prev: Map<string, any>) => Map<string, any>,
	) => void,
	setEdges: (updater: (prev: Edge[]) => Edge[]) => void,
): void => {
	runCodeSendRequest({
		method: "POST",
		data: {
			code,
			language: "python",
			sessionId: currentSessionId !== null ? currentSessionId : undefined,
		},
		route: "/api/code-handler/execute",
		useJWT: false,
	}).then((response: CodeExecutionResponse) => {
		setRunCodeData((prevData) =>
			prevData.set(nodeId, {
				stdout: response.output,
				stderr: response.error,
				configuration: response.state,
				metrics: {
					executionTime: response.executionTime,
					sessionId: response.sessionId,
				},
			}),
		);
		setSessions((prevSessions) => {
			const prevSession:
				| { state: any; executionPath: string[] }
				| undefined = prevSessions.get(response.sessionId);
			let executionPath: string[] | undefined =
				prevSession?.executionPath;
			// Add the node to the execution path
			if (executionPath === undefined) {
				executionPath = ["start", nodeId];
			} else {
				executionPath.push(nodeId);
			}
			// Create a new edge for the execution path
			setEdges((eds) => {
				const params = {
					source: executionPath[executionPath.length - 2],
					target: nodeId,
					sourceHandle: null,
					targetHandle: null,
				};
				return addEdge(
					{
						...params,
						type: "executionRelationship",
						id: getEdgeId(params.source, params.target, eds),
						data: { label: executionPath.length - 1 },
					},
					eds.map((e) => {
						e.selected = false;
						return e;
					}),
				);
			});

			return prevSessions.set(response.sessionId, {
				state: response.state,
				executionPath: executionPath,
			});
		});
		setCurrentSessionId(() => response.sessionId);
	});
};
