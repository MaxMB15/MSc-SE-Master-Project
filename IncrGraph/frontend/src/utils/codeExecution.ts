import {
	CodeAnalysisRequest,
	CodeAnalysisResponse,
	CodeExecutionRequest,
	CodeExecutionResponse,
} from "shared";
import { UseAxiosRequestOptions } from "./requests";
import { CodeRunData } from "@/types/frontend";
import { Edge, Node } from "reactflow";
import {
	addEdge,
	getEdgeId,
} from "@/components/EditorPane/components/utils/utils";

// const getNodeMetaData = (node: Node) => {
//     if(node.type === "classNode"){
//        return {"class": node.data?.class ? node.data.class : ""}
//     }
//     else if(node.type === "methodNode"){
//         return {"method": node.data?.method ? node.data.method : ""}
//     }
//     return {}
// }

// If the node is a method node, apply the transformation to the code to allow it to attach to the class node
// const applyCodeTransformation = (node: Node, metaNodeData: any) => {

// Run the code analysis on the node
export const runAnalysis = (
	runAnalysisSendRequest: (
		options: UseAxiosRequestOptions<CodeAnalysisRequest>,
	) => Promise<CodeAnalysisResponse>,
	node: Node,
	setNodes: (updater: (prev: Node[]) => Node[]) => void,
) => {
	if (
		node.type !== "documentationNode" &&
		node.data !== undefined &&
		node.data.code !== undefined &&
		node.data.code !== ""
	) {
		runAnalysisSendRequest({
			method: "POST",
			data: {
				code: node.data.code,
				language: "python",
			},
			route: "/api/code-handler/analyze",
			useJWT: false,
		}).then((response: CodeAnalysisResponse) => {
			setNodes((prevNodes) => {
				return prevNodes.map((n) => {
					if (node.id === n.id) {
						n.data = { ...n.data, response };
					}
					return n;
				});
			});
		});
	}
};

export const runAllAnalysis = async (
	runAnalysisSendRequest: (
		options: UseAxiosRequestOptions<CodeAnalysisRequest>,
	) => Promise<CodeAnalysisResponse>,
	nodes: Node[],
	setNodes: (updater: (prev: Node[]) => Node[]) => void,
) => {
	const analysisPromises = nodes.map((node) => {
		if (
			node.type !== "documentationNode" &&
			node.data !== undefined &&
			node.data.code !== undefined &&
			node.data.code !== ""
		) {
			return runAnalysisSendRequest({
				method: "POST",
				data: {
					code: node.data.code,
					language: "python",
				},
				route: "/api/code-handler/analyze",
				useJWT: false,
			})
				.then((response: CodeAnalysisResponse) => {
					console.log(
						`Received analysis for node ${node.id}:`,
						response,
					);
					return { nodeId: node.id, response };
				})
				.catch((error) => {
					console.error(`Error analyzing node ${node.id}:`, error);
					return null;
				});
		} else {
			console.log(
				`Skipping node ${node.id} (no code or documentation node).`,
			);
			return Promise.resolve(null);
		}
	});

	const analysisResults = await Promise.all(analysisPromises);

	console.log("All analysis results:", analysisResults);

	setNodes((prevNodes) => {
		return prevNodes.map((node) => {
			const analysisResult = analysisResults.find(
				(result) => result && result.nodeId === node.id,
			);
			if (analysisResult) {
				node.data = { ...node.data, response: analysisResult.response };
				console.log(`Node ${node.id} updated with analysis result.`);
			} else {
				console.log(`No analysis result for node ${node.id}.`);
			}
			return node;
		});
	});
};

export const applyCodeAnalysis = (
	nodeid: string,
	setNodes: (updater: (prev: Node[]) => Node[]) => void,
	metaNodeData: any,
) => {
	setNodes((prevNodes) => {
		return prevNodes.map((node) => {
			if (node.id === nodeid) {
				if (node.type === "classNode" && node.data !== undefined) {
					if (
						metaNodeData &&
						metaNodeData.new_definitions &&
						metaNodeData.new_definitions.classes &&
						metaNodeData.new_definitions.classes.length > 0
					) {
						node.data["class"] =
							metaNodeData.new_definitions.classes[0];
						node.data["label"] =
							metaNodeData.new_definitions.classes[0];
					}
				} else if (
					node.type === "methodNode" &&
					node.data !== undefined
				) {
					if (
						metaNodeData &&
						metaNodeData.new_definitions &&
						metaNodeData.new_definitions.functions &&
						metaNodeData.new_definitions.functions.length > 0
					) {
						node.data["method"] =
							metaNodeData.new_definitions.functions[0];
						node.data["label"] =
							metaNodeData.new_definitions.functions[0];
					}
				}
				node.data = { ...node.data, metaNodeData };
			}
			return node;
		});
	});
};

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
	_: Node[],
	setNodes: (updater: (prev: Node[]) => Node[]) => void,
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
				configuration: response.configuration,
				metrics: {
					executionTime: response.executionTime,
					sessionId: response.sessionId,
				},
			}),
		);
		applyCodeAnalysis(nodeId, setNodes, response.metaNodeData);
		setSessions((prevSessions) => {
			const prevSession:
				| { configuration: any; executionPath: string[] }
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
				configuration: response.configuration,
				executionPath: executionPath,
			});
		});
		setCurrentSessionId(() => response.sessionId);
	});
};
