// import {
// 	CodeAnalysisResponse,
// 	CodeExecutionResponse,
// } from "shared";
// import { callAnalyze, callExecute } from "@/requests";
// import useStore from "@/store/store";
// import { IGCCodeNode } from "@/graphComponents/nodes/IGCNode";
// import DependencyRelationship from "@/graphComponents/relationships/DependencyRelationship";


// If the node is a method node, apply the transformation to the code to allow it to attach to the class node
// const applyCodeTransformation = (node: IGCNode, metaNodeData: any) => {


// export const runAllAnalysis = async () => {
// 	const { nodes, setNodes, edges, setEdges } = useStore.getState();

// 	// Get all analysis data for all nodes
// 	const nodeAnalysisData: { [nodeId: string]: CodeAnalysisResponse } = {};
// 	for (let node of nodes) {
// 		if (node instanceof IGCCodeNode) {
// 			try {
// 				const result = await callAnalyze({code: node.code, language: "python"});
// 				nodeAnalysisData[node.id] = result;
// 			} catch (error) {
// 				console.error(`Error analyzing node ${node.id}:`, error);
// 			}
// 		} else {
// 			console.log(
// 				`Skipping node ${node.id} (no code or documentation node).`,
// 			);
// 		}
// 	}

// 	setNodes((prevNodes) => {
// 		return prevNodes.map((node) => {
// 			if (node instanceof IGCCodeNode) {
// 				if (node.id in nodeAnalysisData) {
// 					if (
// 						node.data !== undefined &&
// 						node.data.scope !== undefined
// 					) {
// 						node.data = {
// 							...node.data,
// 							...nodeAnalysisData[node.id],
// 						};
// 					} else {
// 						node.data = {
// 							...node.data,
// 							...nodeAnalysisData[node.id],
// 						};
// 					}
// 					console.log(
// 						`Node ${node.id} updated with analysis result.`,
// 					);
// 				} else {
// 					console.log(`No analysis result for node ${node.id}.`);
// 				}
// 				if (node.analysis !== undefined) {
// 					return metaAnalysis(node, node.analysis);
// 				}
// 			}
// 			return node;
// 		});
// 	});

// 	setEdges((prevEdges => DependencyRelationship.createDependencyGraph(nodes, prevEdges)));
// };

// // Detects override relationships and inheritance relationships
// const detectRelationships = (node: IGCNode): IGCRelationship[] => {
// 	const relationships: IGCRelationship[] = [];
// 	relationships.push(...detectOverrideRelationships(node));
// 	relationships.push(...detectInheritanceRelationships(node));
// 	return relationships;
// };
// const detectOverrideRelationships = (node: IGCNode): IGCRelationship[] => {
// 	/** Override Relationships are detected by if the following path exists:
// 	 * Method Node -> (Method relationship) -> Class Node -> (Inheritance relationship) -> Class Node <- (Method relationship) <- Method Node (with the same name)
// 	 */
// };
// const detectInheritanceRelationships = (node: IGCNode): IGCRelationship[] => {
// 	// Inheritance relationships are detected by the class node having a class dependency
// };


// // Meta Analysis
// const metaAnalysis = (node: IGCCodeNode, metaNodeData: CodeAnalysisResponse) => {

// 	if (node.type === BaseNode.KEY) {
// 		if (
// 			metaNodeData.definitions !== undefined &&
// 			metaNodeData.definitions.classes.length > 0
// 		) {
// 			node.type = ClassNode.KEY;
// 			node.data["class"] = metaNodeData.definitions.classes[0];
// 			node.label = metaNodeData.definitions.classes[0];
// 		} else {
// 			if (metaNodeData.definitions !== undefined) {
// 				if (metaNodeData.definitions.functions.length > 0) {
// 					node.data["label"] = metaNodeData.definitions.functions[0];
// 				} else if (metaNodeData.definitions.variables.length > 0) {
// 					node.data["label"] = metaNodeData.definitions.variables[0];
// 				}
// 			}
// 			node.type = CodeFragmentNode.KEY;
// 		}
// 	} else if (node.type === ClassNode.KEY && node.data !== undefined) {
// 		if (
// 			metaNodeData &&
// 			metaNodeData.definitions &&
// 			metaNodeData.definitions.classes &&
// 			metaNodeData.definitions.classes.length > 0
// 		) {
// 			node.data["class"] = metaNodeData.definitions.classes[0];
// 			node.data["label"] = metaNodeData.definitions.classes[0];
// 		}
// 	} else if (node.type === MethodNode.KEY && node.data !== undefined) {
// 		if (
// 			metaNodeData &&
// 			metaNodeData.definitions &&
// 			metaNodeData.definitions.functions &&
// 			metaNodeData.definitions.functions.length > 0
// 		) {
// 			node.data["method"] = metaNodeData.definitions.functions[0];
// 			node.data["label"] = metaNodeData.definitions.functions[0];
// 		}
// 	}
// 	if (node.data !== undefined && node.data.scope !== undefined) {
// 		metaNodeData = setScope(metaNodeData, node.data.scope);
// 	}
// 	node.data = { ...node.data, ...metaNodeData };

// 	return node;
// };

// // Apply the code analysis to the node
// const applyCodeAnalysis = (
// 	nodeId: string,
// 	metaNodeData: CodeAnalysisResponse,
// ) => {
// 	const { setNodes } = useStore.getState();

// 	setNodes((prevNodes) => {
// 		return prevNodes.map((node) => {
// 			if (node.id === nodeId && node instanceof IGCCodeNode) {
// 				return metaAnalysis(node, metaNodeData);
// 			}
// 			return node;
// 		});
// 	});
// };

// export const runCode = (code: string, nodeId: string, scope?: string): void => {
// 	// Data store variables
// 	const {
// 		projectDirectory,
// 		setEdges,
// 		currentSessionId,
// 		setCurrentSessionId,
// 		setSessions,
// 		setCodeRunData,
// 	} = useStore.getState();

// 	// Make sure projectDirectory is set
// 	if (projectDirectory === null) {
// 		console.error("Project directory not set.");
// 		return;
// 	}

// 	if (scope !== undefined) {
// 		code = injectCode(code, scope);
// 	}

// 	callExecute(code, "python", projectDirectory, currentSessionId).then(
// 		(response: CodeExecutionResponse) => {
// 			setCodeRunData((prevData) =>
// 				prevData.set(nodeId, {
// 					stdout: response.output,
// 					stderr: response.error,
// 					configuration: response.configuration,
// 					metrics: {
// 						executionTime: response.executionTime,
// 						sessionId: response.sessionId,
// 					},
// 				}),
// 			);
//             if(response.metaNodeData !== undefined){
//                 applyCodeAnalysis(nodeId, response.metaNodeData);
//             }
// 			setSessions((prevSessions) => {
// 				const prevSession:
// 					| { configuration: any; executionPath: string[] }
// 					| undefined = prevSessions.get(response.sessionId);
// 				let executionPath: string[] | undefined =
// 					prevSession?.executionPath;
// 				// Add the node to the execution path
// 				if (executionPath === undefined) {
// 					executionPath = ["start", nodeId];
// 				} else {
// 					executionPath.push(nodeId);
// 				}
// 				// Create a new edge for the execution path
// 				setEdges((eds) => {
// 					const params = {
// 						source: executionPath[executionPath.length - 2],
// 						target: nodeId,
// 						sourceHandle: null,
// 						targetHandle: null,
// 					};
// 					return addEdge(
// 						{
// 							...params,
// 							type: "executionRelationship",
// 							id: getEdgeId(params.source, params.target, eds),
// 							label: `${executionPath.length - 1}`,
// 						},
// 						eds.map((e) => {
// 							e.selected = false;
// 							return e;
// 						}),
// 					);
// 				});

// 				return prevSessions.set(response.sessionId, {
// 					configuration: response.configuration,
// 					executionPath: executionPath,
// 				});
// 			});
// 			setCurrentSessionId(() => response.sessionId);
// 		},
// 	);
// };
