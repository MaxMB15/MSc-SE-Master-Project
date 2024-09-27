import { IGCViewProps } from "../BaseView";
import { createView } from "@/utils/componentCache";
import { RegistryComponent } from "@/types/frontend";

import { useEffect, useRef, useState } from "react";
import {
	DataSet,
	Network,
	Node,
	Edge,
	IdType,
} from "vis-network/standalone/esm/vis-network";
import styles from "./ExploratoryView.module.css";
import useStore from "@/store/store";
import { IGCFileSessionData } from "shared";

interface PathNode {
	id: string;
	label: string;
}

interface ContextMenuState {
	visible: boolean;
	x: number;
	y: number;
	nodeId: IdType | null;
}

interface TreeNode {
	id: string; // Unique internal ID
	originalId: string; // Original ID from the data
	label: string;
	children: TreeNode[];
}

function buildTree(paths: PathNode[][]): TreeNode {
	const root: TreeNode = {
		id: "root",
		originalId: "",
		label: "Root",
		children: [],
	};
	let nodeIdCounter = 0; // For generating unique internal IDs

	for (const path of paths) {
		let currentNode = root;
		let diverged = false;

		for (let i = 0; i < path.length; i++) {
			const nodeData = path[i];
			let childNode;

			if (!diverged) {
				// Try to find an existing child node with the same originalId
				childNode = currentNode.children.find(
					(child) => child.originalId === nodeData.id,
				);

				if (childNode) {
					currentNode = childNode;
				} else {
					// No matching child; divergence occurs
					diverged = true;
				}
			}

			if (diverged) {
				// Create a new node
				nodeIdCounter++;
				const newNode: TreeNode = {
					id: "node" + nodeIdCounter,
					originalId: nodeData.id,
					label: `${nodeData.label} (${nodeData.id})`,
					children: [],
				};
				currentNode.children.push(newNode);
				currentNode = newNode;
			}
		}
	}

	return root;
}

function findExecutionPathNodeIds(
	node: TreeNode,
	executionPath: PathNode[],
	pathIndex: number,
	executionPathNodeIds: string[],
): boolean {
	// Deep comparison of originalId and label
	if (
		node.originalId !== executionPath[pathIndex].id ||
		node.label !==
			`${executionPath[pathIndex].label} (${executionPath[pathIndex].id})`
	) {
		return false;
	}

	executionPathNodeIds.push(node.id);

	if (pathIndex === executionPath.length - 1) {
		// Reached the end of the execution path
		return true;
	}

	for (const child of node.children) {
		if (
			findExecutionPathNodeIds(
				child,
				executionPath,
				pathIndex + 1,
				executionPathNodeIds,
			)
		) {
			return true;
		}
	}

	// Backtrack if no matching path is found from this node
	executionPathNodeIds.pop();
	return false;
}

function traverseTree(
	node: TreeNode,
	nodesArray: Node[],
	edgesArray: Edge[],
	executionPathNodeIds: string[],
	nodeColor: string,
	nodeFontColor: string,
	highlightColor: string,
	edgeColor: string,
	parentNodeId?: string,
) {
	// Skip the root node
	if (node.id !== "root") {
		nodesArray.push({
			id: node.id,
			label: node.label,
			color: executionPathNodeIds.includes(node.id)
				? highlightColor
				: nodeColor,
			font: {
				color: nodeFontColor,
			},
			shape: "dot",
			size: 15,
			borderWidth: 2,
		});
		if (parentNodeId) {
			edgesArray.push({
				from: parentNodeId,
				to: node.id,
				color: edgeColor,
			});
		}
	}

	// Recursively traverse children
	for (const child of node.children) {
		traverseTree(
			child,
			nodesArray,
			edgesArray,
			executionPathNodeIds,
			nodeColor,
			nodeFontColor,
			highlightColor,
			edgeColor,
			node.id,
		);
	}
}

const RawExploratoryView = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [contextMenu, setContextMenu] = useState<ContextMenuState>({
		visible: false,
		x: 0,
		y: 0,
		nodeId: null,
	});

	const lightMode = useStore.getState().mode === "light";

	useEffect(() => {
		const nodeColor = lightMode ? "#cccccc" : "#888888";
		const nodeFontColor = lightMode ? "#000000" : "#ffffff";
		const edgeColor = lightMode ? "#cccccc" : "#888888";
		const highlightColor = "#ff6347";

		const getPaths = (): PathNode[][] => {
			const curFile = useStore.getState().selectedFile;

			const sessionsData: IGCFileSessionData | null =
				curFile === null
					? null
					: useStore.getState().getSessionData(curFile) ?? null;
			if (sessionsData === null || curFile === null) {
				return [];
			}
			const nodeIdLabelPairs: { [id: string]: string } = useStore
				.getState()
				.getNodes(curFile)
				.reduce<{ [id: string]: string }>((acc, n) => {
					acc[n.id] = n.data.label;
					return acc;
				}, {});

			const retList = [];
			const sessions = Object.keys(sessionsData.sessions);
			for (let i = 0; i < sessions.length; i++) {
				const sessionId = sessions[i];
				const session = sessionsData.sessions[sessionId];
				retList.push(
					session.executions.map((e) => {
						return {
							id: e.nodeId,
							label: nodeIdLabelPairs[e.nodeId],
						};
					}),
				);
			}

			return retList;
		};

		const getCurrentExecutionPath = (): PathNode[] => {
			const curFile = useStore.getState().selectedFile;
			const currentSessionId = useStore.getState().currentSessionId;

			const sessionsData: IGCFileSessionData | null =
				curFile === null
					? null
					: useStore.getState().getSessionData(curFile) ?? null;
			if (
				sessionsData === null ||
				curFile === null ||
				currentSessionId === null
			) {
				return [];
			}
			const nodeIdLabelPairs: { [id: string]: string } = useStore
				.getState()
				.getNodes(curFile)
				.reduce<{ [id: string]: string }>((acc, n) => {
					acc[n.id] = n.data.label;
					return acc;
				}, {});

			return sessionsData.sessions[currentSessionId].executions.map(
				(e) => {
					return {
						id: e.nodeId,
						label: nodeIdLabelPairs[e.nodeId],
					};
				},
			);
		};

		const executionPath = getCurrentExecutionPath();
		const paths = getPaths();

		const root = buildTree(paths);

		const executionPathNodeIds: string[] = [];
		let found = false;
		for (const child of root.children) {
			if (
				findExecutionPathNodeIds(
					child,
					executionPath,
					0,
					executionPathNodeIds,
				)
			) {
				found = true;
				break;
			}
		}
		if (!found) {
			console.warn("Execution path not found in the tree.");
		}

		const nodesArray: Node[] = [];
		const edgesArray: Edge[] = [];

		traverseTree(
			root,
			nodesArray,
			edgesArray,
			executionPathNodeIds,
			nodeColor,
			nodeFontColor,
			highlightColor,
			edgeColor,
		);

		const nodes = new DataSet<Node>(nodesArray);
		const edges = new DataSet<Edge>(edgesArray);

		const data = { nodes, edges };

		// Configure options for hierarchical layout
		const options = {
			layout: {
				hierarchical: {
					direction: "UD", // Up to Down
					sortMethod: "directed",
					nodeSpacing: 200,
					levelSeparation: 150,
				},
			},
			nodes: {
				shape: "dot",
				size: 15,
				borderWidth: 2,
			},
			edges: {
				smooth: {
					enabled: true,
					type: "cubicBezier",
					forceDirection: "vertical",
					roundness: 0.4,
				},
			},
			physics: {
				enabled: false, // Disable physics since we're using a hierarchical layout
			},
			interaction: {
				dragNodes: false, // Prevent manual node dragging
				zoomView: true,
				dragView: true,
				multiselect: false,
			},
		};

		if (containerRef.current !== null) {
			const network = new Network(containerRef.current, data, options);

			// Handle right-click events
			network.on("oncontext", (params) => {
				params.event.preventDefault();
				const nodeId = network.getNodeAt(params.pointer.DOM);

				if (nodeId) {
					const containerRect =
						containerRef.current!.getBoundingClientRect();
					const x = params.event.clientX - containerRect.left;
					const y = params.event.clientY - containerRect.top;

					setContextMenu({
						visible: true,
						x,
						y,
						nodeId,
					});
				}
			});

			// Hide context menu when clicking elsewhere
			const handleClick = () => {
				if (contextMenu.visible) {
					setContextMenu({ ...contextMenu, visible: false });
				}
			};

			document.addEventListener("click", handleClick);

			// Cleanup
			return () => {
				document.removeEventListener("click", handleClick);
				network.destroy();
			};
		}
	}, [contextMenu.visible, lightMode]);

	const selectedFile = useStore.getState().selectedFile;
	const currentSessionId = useStore.getState().currentSessionId;
	if (selectedFile === null) {
		return <div className="text-display">No File Selected</div>;
	} else if (currentSessionId === null) {
		return <div className="text-display">No Session Selected</div>;
	}

	const handleAction = (action: string, nodeId: IdType) => {
		console.log(`${action} on node ${nodeId}`);
		// Implement your action logic here
		setContextMenu({ ...contextMenu, visible: false });
	};

	const backgroundColor = lightMode ? "#ffffff" : "#1e1e1e";

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				position: "relative",
				backgroundColor: backgroundColor,
				margin: "2px",
			}}
		>
			{/* Context Menu */}
			{contextMenu.visible && (
				<div
					className={styles.contextMenu}
					style={{ top: contextMenu.y, left: contextMenu.x }}
				>
					<div
						className={styles.contextMenuItem}
						onClick={() =>
							handleAction(
								"Start Session From Here",
								contextMenu.nodeId!,
							)
						}
					>
						Start Session From Here
					</div>
					<div
						className={styles.contextMenuItem}
						onClick={() =>
							handleAction(
								"Insert Before Node",
								contextMenu.nodeId!,
							)
						}
					>
						Insert Before Node
					</div>
					<div
						className={styles.contextMenuItem}
						onClick={() =>
							handleAction(
								"Insert After Node",
								contextMenu.nodeId!,
							)
						}
					>
						Insert After Node
					</div>
				</div>
			)}

			{/* Network Graph */}
			<div ref={containerRef} style={{ width: "100%", height: "100%" }} />
		</div>
	);
};

const ExploratoryView: IGCViewProps & RegistryComponent = createView(
	RawExploratoryView,
	"ExploratoryView",
	"Exploratory View",
	[],
	10,
	{},
);

export default ExploratoryView;
