import React, { useState, useRef, useEffect } from "react";
import { Box, Button, IconButton } from "@mui/material";
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
import { addEdge, getEdgeId, edgeTypes, nodeTypes } from "./components/utils/utils";
import CustomConnectionLine, {
	connectionLineStyle,
} from "./components/edges/CustomConnectionLine";
import { Item } from "@/types/frontend";
import useStore from "@/store/store";

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
		const newNode: Node = {
			id: `${Date.now()}`,
			type: "baseNode",
			data: { label: `Node ${nodes.length}`, code: "" },
			position: {
				x: Math.random() * 500 - 250,
				y: Math.random() * 500 - 250,
			},
			selected: true,
		};

		// Select the new node and deselect all other nodes/edges
		setNodes((nodes) => {
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
		if (source && target) {
			console.log(`Creating connection from ${source} to ${target}`);
			setEdges((eds) =>
				addEdge(
					{
						...params,
						type: "baseRelationship",
						id: getEdgeId(params),
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
			<div className="navbar">
				<span className="directory-name">Graph Editor</span>
				<Button startIcon={<AddCircle />} onClick={handleAddNode}>
					Add Node
				</Button>
				<IconButton color="inherit">
					<PlayArrow />
				</IconButton>
				<IconButton color="inherit">
					<BugReport />
				</IconButton>
				<IconButton color="inherit" onClick={handlePanToStartNode}>
					<Home />
				</IconButton>
			</div>
			<Box
				sx={{
					flexGrow: 1,
					backgroundColor: "#1e1e1e",
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
