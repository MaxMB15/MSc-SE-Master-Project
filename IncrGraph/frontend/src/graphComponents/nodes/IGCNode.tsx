import {
    Node,
	NodeChange,
	NodeProps,
	useStore as rfUseStore,
	applyNodeChanges,
} from "reactflow";

import IGCRelationship from "../relationships/IGCRelationship";
import { Analysis, EditorDisplayNode, Point, Rectangle } from "@/types/frontend";
import {
    Dependencies,
	Definitions,
	CodeExecutionResponse,
	CodeAnalysisResponse,
} from "shared";
import { callAnalyze, callExecute } from "@/requests";
import IGCNodeDisplay from "./IGCNodeDisplay";
import React from "react";
import { PartialExcept } from "@/utils/typeUtils";
import useStore from "@/store/store";
import ExecutionRelationship from "../relationships/ExecutionRelationship";

type IGCNodeDataProps<T = {}> = T & {
	backgroundColor: string;
	label: string;
};

type RequiredNodeProps = "id";

export type IGCNodeProps<T = {}> = PartialExcept<
	NodeProps<IGCNodeDataProps<T>>,
	RequiredNodeProps
>;

export abstract class IGCNode extends React.Component<
	NodeProps<IGCNodeDataProps>
> {
	nodeProps: NodeProps;

	id: string;
	type: string;
	data: IGCNodeDataProps;

	backgroundColor: string;

	position: Point;

	selected: boolean;

	constructor(
		partialNodeProps: IGCNodeProps,
		type: string,
		backgroundColor: string,
	) {
		const nodeProps = IGCNode.createDefaultNodeProps({
			...partialNodeProps,
			type: type,
		});
		super(nodeProps);
		this.nodeProps = nodeProps;

		this.id = nodeProps.id;
		this.type = nodeProps.type;
		this.data = nodeProps.data;

		this.backgroundColor = backgroundColor;

		this.position = new Point(nodeProps.xPos, nodeProps.yPos);

		this.selected = nodeProps.selected;
	}

    public toRFNode(): Node {
        return this;
    }

	public abstract createRelationships(
		edges: IGCRelationship[],
	): IGCRelationship[];

	public abstract editorDisplay(): EditorDisplayNode;

    public editorChange(_: string): void {
        return;
    }

	public getBounds(): Rectangle {
		const node = rfUseStore((state) =>
			state.getNodes().find((node) => node.id === this.id),
		);
		// const node: Node = nodes.find((node) => node.id === this.id);
		return new Rectangle(
			this.position.x,
			this.position.y,
			node?.width || 50,
			node?.height || 40,
		);
	}

	public getIncomingEdges = (): IGCRelationship[] => {
		const { edges } = useStore.getState();
		return edges.filter((edge) => edge.target === this.id);
	};
	public getOutgoingEdges = (): IGCRelationship[] => {
		const { edges } = useStore.getState();
		return edges.filter((edge) => edge.source === this.id);
	};

	// Get all nodes that are directed at a specific node
	public getIncomingNodes(
		nodeTypeFilter: (n: IGCNode) => boolean = (_) => true,
	): IGCNode[] {
		const { nodes } = useStore.getState();

		const incomingEdges = this.getIncomingEdges();
		const incomingNodeIds = incomingEdges.map((edge) => edge.source);
		return nodes.filter(
			(node) =>
				incomingNodeIds.includes(node.id) &&
				node.type !== undefined &&
				nodeTypeFilter(node),
		);
	}

	// Get all nodes that are out of a specific node
	public getOutgoingNodes(
		nodeTypeFilter: (n: IGCNode) => boolean = (_) => true,
	): IGCNode[] {
		const { nodes } = useStore.getState();

		const outgoingEdges = this.getOutgoingEdges();
		const outgoingNodeIds = outgoingEdges.map((edge) => edge.target);
		return nodes.filter(
			(node) =>
				outgoingNodeIds.includes(node.id) &&
				node.type !== undefined &&
				nodeTypeFilter(node),
		);
	}

	render() {
		return (
			<IGCNodeDisplay
				id={this.nodeProps.id}
				label={this.nodeProps.data?.label}
				backgroundColor={this.backgroundColor}
			/>
		);
	}

	public static createDefaultNodeProps(
		partialNodeProps: IGCNodeProps,
	): NodeProps<IGCNodeDataProps> {
		return {
			...partialNodeProps,
			id: partialNodeProps.id,
			selected: partialNodeProps.selected || false,
			type: partialNodeProps.type || "default",
			data: partialNodeProps.data || {
				backgroundColor: "white",
				label: "",
			},
			zIndex: partialNodeProps.zIndex || 0,
			isConnectable: partialNodeProps.isConnectable || true,
			xPos: partialNodeProps.xPos || 0,
			yPos: partialNodeProps.yPos || 0,
			dragging: partialNodeProps.dragging || false,
		};
	}
	public static applyNodeChanges(changes: NodeChange[], nodes: IGCNode[]) {
		return applyNodeChanges(changes, nodes) as unknown as IGCNode[];
	}
}

type IGCCodeNodeDataProps<T = {}> = T & {
	code: string;
};
export type IGCCodeNodeProps<T = {}> = IGCNodeProps<IGCCodeNodeDataProps<T>>;

export abstract class IGCCodeNode extends IGCNode {
	code: string;
	analysis: Analysis;

	constructor(
		partialNodeProps: IGCCodeNodeProps,
		type: string,
		backgroundColor: string,
		code: string,
	) {
		partialNodeProps = {
			...partialNodeProps,
			data: {
				...partialNodeProps.data,
				label: partialNodeProps.data?.label || "",
				backgroundColor: backgroundColor,
				code: code,
			},
		};
		super(partialNodeProps, type, backgroundColor);
		this.code = code;
		this.analysis = new Analysis(
            callAnalyze,
		);
	}

	public editorDisplay = (): EditorDisplayNode => {
		return {
			useEditor: { code: this.code, language: "python" },
		};
	};

    public editorChange(code: string): void {
        this.code = code;
    }

	// abstract serialize(edges: IGCRelationship[]): IGCRelationship[];
	public abstract deserialize(): string;

	public abstract metaAnalysis(): void;

	public updateAnalysis(): Promise<CodeAnalysisResponse> {
		return this.analysis
			.update({ code: this.code, language: "python" })
			.then((analysis) => {
				this.metaAnalysis();
				return analysis;
			});
	}
	public getDefinitions(): Definitions {
		return this.analysis.definitions;
	}
	public getDependencies(): Dependencies {
		return this.analysis.dependencies;
	}

	// Just execute the code
	public executeCode(): Promise<CodeExecutionResponse> {
		const { projectDirectory, currentSessionId } = useStore.getState();

		if (projectDirectory === null) {
			return Promise.reject("Project directory not set");
		}
		return callExecute(
			this.code,
			"python",
			projectDirectory,
			currentSessionId,
		);
	}

	// Execute the code and handle the response
	public runCode(): void {
		// Data store variables
		const {
			setEdges,
			setCurrentSessionId,
			setSessions,
			setCodeRunData,
		} = useStore.getState();

		// Execute the code
		this.executeCode().then((response: CodeExecutionResponse) => {
			// Set run data for the Node
			setCodeRunData((prevData) =>
				prevData.set(this.id, {
					stdout: response.output,
					stderr: response.error,
					configuration: response.configuration,
					metrics: {
						executionTime: response.executionTime,
						sessionId: response.sessionId,
					},
				}),
			);

			// Add the new session data
			setSessions((prevSessions) => {
				const prevSession:
					| { configuration: any; executionPath: string[] }
					| undefined = prevSessions.get(response.sessionId);
				let executionPath: string[] | undefined =
					prevSession?.executionPath;
				// Add the node to the execution path
				if (executionPath === undefined) {
					executionPath = ["start", this.id];
				} else {
					executionPath.push(this.id);
				}
				// Create a new edge for the execution path
				setEdges((rs) => {
					const params = {
						source: executionPath[executionPath.length - 2],
						target: this.id,
					};
					return IGCRelationship.addEdge(
						new ExecutionRelationship(
							{
								...params,
								id: IGCRelationship.generateId(
									params.source,
									params.target,
									rs,
								),
							},
							`${executionPath.length - 1}`,
						),
						rs.map((r) => {
							r.selected = false;
							return r;
						}),
					);
				});

				return prevSessions.set(response.sessionId, {
					configuration: response.configuration,
					executionPath: executionPath,
				});
			});

			// If the session ID is different, update the current session ID (if the session is provided, it should return the same session ID)
			setCurrentSessionId(() => response.sessionId);
		});
	}

	// Run all Analysis
	public static async runAllAnalysis(): Promise<void> {
		const { nodes, setNodes } = useStore.getState();

		// Get all analysis data for all nodes
		const nodeAnalysisData: { [nodeId: string]: CodeAnalysisResponse } = {};
		for (let node of nodes) {
			if (node instanceof IGCCodeNode) {
				try {
					const result = await node.updateAnalysis();
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

		setNodes(() => {
			return nodes;
		});
	}

	// Inject code into scope
	public static injectCode(code: string, cls: string): string {
		const replaceTabsWithSpaces = (
			input: string,
			indent: number = 0,
		): string => {
			const additionalIndent = " ".repeat(4 * indent);

			return input
				.split("\n")
				.map((line) => {
					const match = line.match(/^\s*/);
					if (match) {
						const whitespace = match[0];
						const replacedWhitespace = whitespace.replace(
							/\t/g,
							"    ",
						);
						return (
							additionalIndent +
							line.replace(/^\s*/, replacedWhitespace)
						);
					}
					return additionalIndent + line;
				})
				.join("\n");
		};

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
	}

	render() {
		return (
			<IGCNodeDisplay
				id={this.nodeProps.id}
				label={this.nodeProps.data?.label}
				backgroundColor={this.backgroundColor}
				handleRun={() => this.runCode()}
			/>
		);
	}
}
