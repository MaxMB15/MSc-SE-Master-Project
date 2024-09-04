import React, { useState, useRef, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { PlayArrow, BugReport, AddCircle, Home } from "@mui/icons-material";
import ReactFlow, {
	ReactFlowProvider,
	Background,
	Controls,
	MiniMap,
	applyEdgeChanges,
	applyNodeChanges,
	Edge,
	Node,
	Connection,
	NodeChange,
	EdgeChange,
	ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import "./EditorPane.css";
import {
	addEdge,
	getEdgeId,
	getNodeId,
	updateExecutionPath,
	updateExecutionPathEdge,
} from "./components/utils/utils";
import { edgeTypes, nodeTypes } from "./components/utils/types";
import CustomConnectionLine, {
	connectionLineStyle,
} from "./components/edges/CustomConnectionLine";
import { Item } from "@/types/frontend";
import useStore from "@/store/store";
import FilterPane from "../FilterPane";
import { runAllAnalysis } from "@/utils/codeExecution";
import { STYLES } from "@/styles/constants";

interface EditorPaneProps {}

const EditorPane: React.FC<EditorPaneProps> = ({}) => {
	// VARIABLES
	// Store variables
	const {
		fileContent,
		isIGCFile,
		setSelectedItems,
		nodes,
		setNodes,
		edges,
		setEdges,
		sessions,
		setSessions,
		currentSessionId,
	} = useStore();

	// STATE
	const [showGraph, setShowGraph] = useState(false); // If the graph should show up or not

	const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

	const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);

	// REFERENCES
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

	// Shows the graph if the file is a valid IGC file
	useEffect(() => {
		if (fileContent !== null && isIGCFile) {
			setShowGraph(true);
		} else {
			setShowGraph(false);
		}
	}, [fileContent]);

	// Node Functions
	const onNodesChange = (changes: NodeChange[]) => {
        // Get current session data
        if (currentSessionId !== null) {
            const session = sessions.get(currentSessionId);
            if (session !== undefined) {
                let vSession = session;
                let currentExecutionPath: string[] = vSession.executionPath;
                // Go through each change and update eds accordingly
                for (let change of changes) {
                    if (change.type === "remove") {
                        vSession.executionPath = vSession.executionPath.filter(node => node !== change.id);
                    }
                }
                if (vSession.executionPath !== currentExecutionPath) {
                    // Shallow is okay
                    setSessions((prevSessions) => {
                        return prevSessions.set(currentSessionId, vSession);
                    });
                    setEdges((prevEdges) => updateExecutionPath(prevEdges, vSession));
                }
            }
        }
		setNodes((nds) => applyNodeChanges(changes, nds));
	};
	// If a node is changed, check to see if there are any selection changes
	useEffect(() => {
		// Look at which nodes are selected
		const newSelectedNodes: Node[] = nodes.filter((node) => node.selected);

		setSelectedNodes(newSelectedNodes);
	}, [nodes]);

	// Add a new node
	const handleAddNode = () => {
		// Select the new node and deselect all other nodes/edges
		setNodes((nodes) => {
			const newNode: Node = {
				id: getNodeId(nodes),
				type: "baseNode",
				data: { label: `Node ${nodes.length}`, code: "" },
				position: {
					x: Math.random() * 500 - 250,
					y: Math.random() * 500 - 250,
				},
				selected: true,
			};
			let newNodes = nodes.map((node) => {
				node.selected = false;
				return node;
			});
			return [...newNodes, newNode];
		});
		setEdges((edges) => {
			let newEdges = edges.map((edge) => {
				edge.selected = false;
				return edge;
			});
			return [...newEdges];
		});
	};

	// Edge Functions
	const onEdgesChange = (changes: EdgeChange[]) => {
		setEdges((eds) => {
			// Get current session data
			if (currentSessionId !== null) {
				const session = sessions.get(currentSessionId);
				if (session !== undefined) {
					let vSession = session;
					let currentExecutionPath: string[] = vSession.executionPath;
					// Go through each change and update eds accordingly
					for (let change of changes) {
						if (change.type === "remove") {
							const uepData = updateExecutionPathEdge(
								change.id,
								eds,
								vSession,
							);
							eds = uepData.edges;
							vSession = uepData.session;
						}
					}
					if (vSession.executionPath !== currentExecutionPath) {
						// Shallow is okay
						setSessions((prevSessions) => {
							return prevSessions.set(currentSessionId, vSession);
						});
					}
				}
			}
			return applyEdgeChanges(changes, eds);
		});
	};
	// If an edge is changed, check to see if there are any selection changes
	useEffect(() => {
		let newSelectedEdges: Edge[] = edges.filter((edge) => edge.selected);
		setSelectedEdges(newSelectedEdges);
	}, [edges]);

	// If a new edge is created
	const onConnect = (params: Edge | Connection) => {
		const { source, target } = params;

		// Custom logic to handle the connection
		if (source !== null && target !== null) {
			console.log(`Creating connection from ${source} to ${target}`);
			setEdges((eds) =>
				addEdge(
					{
						...params,
						type: "BaseRelationship",
						id: getEdgeId(source, target, eds),
						selected: true,
					},
					eds.map((e) => {
						e.selected = false;
						return e;
					}),
				),
			);
			setNodes((nodes) => {
				let newNodes = nodes.map((node) => {
					node.selected = false;
					return node;
				});
				return [...newNodes];
			});
		} else {
			console.error("Invalid connection attempt:", params);
		}
	};

	// General React Flow Functions
	// Pan to the center
	const handlePanToStartNode = () => {
		if (reactFlowInstance.current) {
			reactFlowInstance.current.setCenter(0, 0);
			reactFlowInstance.current.zoomTo(1);
		}
	};

	// When new selections are being made, update the selected items
	useEffect(() => {
		const items: Item[] = [];
		selectedNodes.forEach((node) => {
			items.push({
				type: "Node",
				item: node,
				id: node.id,
				name: node.data.label,
			});
		});

		selectedEdges.forEach((edge) => {
			items.push({
				type: "Edge",
				item: edge,
				id: edge.id,
				name: edge.id,
			});
		});
		setSelectedItems(() => items);
	}, [selectedNodes, selectedEdges]);

	const onNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
		console.log("Node double clicked", node);
		console.log("Event", event);
	};
	return (
		<div className="editor-pane">
			<div className="navbar-component">
				<span className="navbar-component-title take-full-width">
					Graph Editor
				</span>
				{isIGCFile && (
					<>
						<Button
							startIcon={<AddCircle />}
							onClick={handleAddNode}
						>
							Add Node
						</Button>
						<FilterPane />
						<button
							className="icon-button"
							title="Play Current Execution"
						>
							<PlayArrow />
						</button>
						<button
							className="icon-button"
							title="Debug Current Execution"
                            onClick={() => runAllAnalysis()}
						>
							<BugReport />
						</button>
						<button
							className="icon-button"
							title="Pan Back to Start"
							onClick={handlePanToStartNode}
						>
							<Home />
						</button>
					</>
				)}
			</div>
			<Box
				sx={{
					flexGrow: 1,
					backgroundColor: STYLES.mainBackgroundColor,
					overflow: "hidden",
				}}
				ref={reactFlowWrapper}
			>
				{showGraph ? (
					<ReactFlowProvider>
						<ReactFlow
							nodes={nodes}
							edges={edges}
							onNodesChange={onNodesChange}
							onEdgesDelete={console.log}
							onEdgesChange={onEdgesChange}
							onConnect={onConnect}
							nodeTypes={nodeTypes}
							onNodeDoubleClick={onNodeDoubleClick}
							edgeTypes={edgeTypes}
							connectionLineComponent={CustomConnectionLine}
							connectionLineStyle={connectionLineStyle}
							zoomOnScroll
							panOnScroll={false}
							onInit={(instance) => {
								reactFlowInstance.current = instance;
								handlePanToStartNode();
							}}
						>
							<MiniMap className="react-flow__minimap" />
							<Controls
								className="react-flow__controls"
								showFitView={false}
								showInteractive={false}
							/>
							<Background />
						</ReactFlow>
					</ReactFlowProvider>
				) : (
					<div
						style={{
							margin: "10px",
						}}
					>
						Not a valid IGC file
					</div>
				)}
			</Box>
		</div>
	);
};

export default EditorPane;
