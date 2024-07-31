import {
	CodeAnalysisResponse,
	CodeExecutionResponse,
	Definitions,
	Dependencies,
} from "shared";
import { Node, Edge } from "reactflow";
import { addEdge, getEdgeId } from "@graph-components/utils/utils";
import { callAnalyze, callExecute } from "@/requests";
import useStore from "@/store/store";
import { createDependencyGraph } from "@graph-components/utils/edgeCreation";
import { IGCCodeNode } from "@/graphComponents/nodes/IGCNode";
import { BaseNode } from "@/graphComponents/nodes/BaseNode";
import { ClassNode } from "@/graphComponents/nodes/ClassNode";
import { CodeFragmentNode } from "@/graphComponents/nodes/CodeFragmentNode";
import { MethodNode } from "@/graphComponents/nodes/MethodNode";

// If the node is a method node, apply the transformation to the code to allow it to attach to the class node
// const applyCodeTransformation = (node: IGCNode, metaNodeData: any) => {

// Run the code analysis on the node
export const runAnalysis = (node: IGCCodeNode) => {
	const { setNodes } = useStore.getState();

	if (node instanceof IGCCodeNode) {
		callAnalyze(node.data.code).then((response: CodeAnalysisResponse) => {
			setNodes((prevNodes) => {
				return prevNodes.map((n) => {
					if (node.id === n.id) {
						if (
							n.data !== undefined &&
							n.data.scope !== undefined
						) {
							n.data = {
								...n.data,
								...response,
							};
						} else {
							n.data = { ...n.data, ...response };
						}
						if (n.data.definitions !== undefined) {
							return metaAnalysis(node, node.analysis);
						}
					}
					return n;
				});
			});
		});
	}
};

export const runAllAnalysis = async () => {
	const { nodes, setNodes } = useStore.getState();

	// Get all analysis data for all nodes
	const nodeAnalysisData: { [nodeId: string]: CodeAnalysisResponse } = {};
	for (let node of nodes) {
		if (node instanceof IGCCodeNode) {
			try {
				const result = await callAnalyze({code: node.code, language: "python"});
				nodeAnalysisData[node.id] = result;
			} catch (error) {
				console.error(`Error analyzing node ${node.id}:`, error);
			}
		} else {
			console.log(
				`Skipping node ${node.id} (no code or documentation node).`,
			);
		}
	}

	setNodes((prevNodes) => {
		return prevNodes.map((node) => {
			if (node instanceof IGCCodeNode) {
				if (node.id in nodeAnalysisData) {
					if (
						node.data !== undefined &&
						node.data.scope !== undefined
					) {
						node.data = {
							...node.data,
							...nodeAnalysisData[node.id],
						};
					} else {
						node.data = {
							...node.data,
							...nodeAnalysisData[node.id],
						};
					}
					console.log(
						`Node ${node.id} updated with analysis result.`,
					);
				} else {
					console.log(`No analysis result for node ${node.id}.`);
				}
				if (node.analysis !== undefined) {
					return metaAnalysis(node, node.analysis);
				}
			}
			return node;
		});
	});
	createDependencyGraph();
};

// // Detects override relationships and inheritance relationships
// const detectRelationships = (node: IGCNode): IGCEdge[] => {
// 	const relationships: IGCEdge[] = [];
// 	relationships.push(...detectOverrideRelationships(node));
// 	relationships.push(...detectInheritanceRelationships(node));
// 	return relationships;
// };
// const detectOverrideRelationships = (node: IGCNode): IGCEdge[] => {
// 	/** Override Relationships are detected by if the following path exists:
// 	 * Method Node -> (Method relationship) -> Class Node -> (Inheritance relationship) -> Class Node <- (Method relationship) <- Method Node (with the same name)
// 	 */
// };
// const detectInheritanceRelationships = (node: IGCNode): IGCEdge[] => {
// 	// Inheritance relationships are detected by the class node having a class dependency
// };

// Convert python code to space first instead of tabs
const replaceTabsWithSpaces = (input: string, indent: number = 0): string => {
	const additionalIndent = " ".repeat(4 * indent);

	return input
		.split("\n")
		.map((line) => {
			const match = line.match(/^\s*/);
			if (match) {
				const whitespace = match[0];
				const replacedWhitespace = whitespace.replace(/\t/g, "    ");
				return (
					additionalIndent + line.replace(/^\s*/, replacedWhitespace)
				);
			}
			return additionalIndent + line;
		})
		.join("\n");
};

// Inject code into scope
const injectCode = (code: string, cls: string): string => {
	return `def add_code_to_class(cls):
    # START CODE INJECTION
${replaceTabsWithSpaces(code, 1)}
    # END CODE INJECTION
    for key, value in locals().items():
        if key != 'cls':
            setattr(cls, key, value)
    
# Add the new code to the class
add_code_to_class(${cls})
    
# Clear the add_code_to_class function
del add_code_to_class`;
};

// Convert newly defined variables in accordance to the scope
const setScope = (
	metaNodeData: CodeAnalysisResponse,
	scope: string,
): CodeAnalysisResponse => {
	if (metaNodeData.definitions !== undefined) {
		// Go through every new definition and set the scope
		Object.keys(metaNodeData.definitions).forEach((key) => {
			const typedKey = key as keyof typeof metaNodeData.definitions;
			metaNodeData.definitions[typedKey] = metaNodeData.definitions[
				typedKey
			].map((definition: string) => {
				return `${scope}.${definition}`;
			});
		});
		// Add the scope to the dependencies
		if (metaNodeData.dependencies.classes.includes(scope) === false) {
			metaNodeData.dependencies.classes.push(scope);
		}
	}

	return metaNodeData;
};
// Meta Analysis
const metaAnalysis = (node: IGCCodeNode, metaNodeData: CodeAnalysisResponse) => {

	if (node.type === BaseNode.KEY) {
		if (
			metaNodeData.definitions !== undefined &&
			metaNodeData.definitions.classes.length > 0
		) {
			node.type = ClassNode.KEY;
			node.data["class"] = metaNodeData.definitions.classes[0];
			node.label = metaNodeData.definitions.classes[0];
		} else {
			if (metaNodeData.definitions !== undefined) {
				if (metaNodeData.definitions.functions.length > 0) {
					node.data["label"] = metaNodeData.definitions.functions[0];
				} else if (metaNodeData.definitions.variables.length > 0) {
					node.data["label"] = metaNodeData.definitions.variables[0];
				}
			}
			node.type = CodeFragmentNode.KEY;
		}
	} else if (node.type === ClassNode.KEY && node.data !== undefined) {
		if (
			metaNodeData &&
			metaNodeData.definitions &&
			metaNodeData.definitions.classes &&
			metaNodeData.definitions.classes.length > 0
		) {
			node.data["class"] = metaNodeData.definitions.classes[0];
			node.data["label"] = metaNodeData.definitions.classes[0];
		}
	} else if (node.type === MethodNode.KEY && node.data !== undefined) {
		if (
			metaNodeData &&
			metaNodeData.definitions &&
			metaNodeData.definitions.functions &&
			metaNodeData.definitions.functions.length > 0
		) {
			node.data["method"] = metaNodeData.definitions.functions[0];
			node.data["label"] = metaNodeData.definitions.functions[0];
		}
	}
	if (node.data !== undefined && node.data.scope !== undefined) {
		metaNodeData = setScope(metaNodeData, node.data.scope);
	}
	node.data = { ...node.data, ...metaNodeData };

	return node;
};

// Apply the code analysis to the node
const applyCodeAnalysis = (
	nodeId: string,
	metaNodeData: CodeAnalysisResponse,
) => {
	const { setNodes } = useStore.getState();

	setNodes((prevNodes) => {
		return prevNodes.map((node) => {
			if (node.id === nodeId && node instanceof IGCCodeNode) {
				return metaAnalysis(node, metaNodeData);
			}
			return node;
		});
	});
};

export const runCode = (code: string, nodeId: string, scope?: string): void => {
	// Data store variables
	const {
		projectDirectory,
		setEdges,
		currentSessionId,
		setCurrentSessionId,
		setSessions,
		setCodeRunData,
	} = useStore.getState();

	// Make sure projectDirectory is set
	if (projectDirectory === null) {
		console.error("Project directory not set.");
		return;
	}

	if (scope !== undefined) {
		code = injectCode(code, scope);
	}

	callExecute(code, "python", projectDirectory, currentSessionId).then(
		(response: CodeExecutionResponse) => {
			setCodeRunData((prevData) =>
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
            if(response.metaNodeData !== undefined){
                applyCodeAnalysis(nodeId, response.metaNodeData);
            }
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
							label: `${executionPath.length - 1}`,
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
		},
	);
};
