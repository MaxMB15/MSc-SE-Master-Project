import React, { useCallback, useState, useRef, useEffect } from "react";
import {
	Alert,
	AlertTitle,
	Box,
	Button,
	IconButton,
	Menu,
	MenuItem,
} from "@mui/material";
import { PlayArrow, BugReport, AddCircle, Home } from "@mui/icons-material";
import ReactFlow, {
	ReactFlowProvider,
	addEdge,
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
	NodeSelectionChange,
	EdgeSelectionChange,
} from "reactflow";
import "reactflow/dist/style.css";
import "./EditorPane.css";
import {nodeTypes} from "./components/utils/utils";
import FloatingEdge, {
	defaultEdgeOptions,
} from "./components/edges/FloatingEdge/index";
import CustomConnectionLine, {
	connectionLineStyle,
} from "./components/edges/CustomConnectionLine";
import { Item } from "src/types/common";

interface EditorPaneProps {
	igcContent: string | null;
	updateGraphContentFileEditor: (content: string) => void;
	setSelectedItems: React.Dispatch<React.SetStateAction<Item[]>>;
    nodes: Node[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>
}



const edgeTypes = {
	floating: FloatingEdge,
};

type NodesDict = Record<string, Node>;
type EdgesDict = Record<string, Edge>;

const EditorPane: React.FC<EditorPaneProps> = ({
	igcContent,
	updateGraphContentFileEditor,
	setSelectedItems,
    nodes,
    setNodes,
}) => {
	// State
	const [showGraph, setShowGraph] = useState(false);

	const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
	const [nodesDict, setNodesDict] = useState<NodesDict>({});

	const [edges, setEdges] = useState<Edge[]>([]);
	const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
	const [edgesDict, setEdgesDict] = useState<EdgesDict>({});

	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const serializeGraphData = (
		igcContent: string,
	): { nodes: Node[]; edges: Edge[] } => {
		// Try to parse the IGC content
		try {
			const data = JSON.parse(igcContent);
			return { nodes: data.nodes, edges: data.edges };
		} catch (error) {
			console.error("Error parsing IGC content:", error);
		}
		return { nodes: [], edges: [] };
	};
	const deserializeGraphData = (nodes: Node[], edges: Edge[]): string => {
		let data = { nodes: nodes, edges: edges };

		return JSON.stringify(data, null, 4);
	};

	const loadGraphDataFile = () => {
		if (igcContent !== null) {
			const { nodes, edges } = serializeGraphData(igcContent);
			setNodes(nodes);
			setNodesDict(
				nodes.reduce((dict, node) => {
					dict[node.id] = node;
					return dict;
				}, {} as NodesDict),
			);
			setEdges(edges);
			setEdgesDict(
				edges.reduce((dict, edge) => {
					dict[edge.id] = edge;
					return dict;
				}, {} as EdgesDict),
			);
			// updateGraphContent();
		}
	};
	useEffect(() => {
		if (igcContent !== null) {
			setShowGraph(true);
			loadGraphDataFile();
		} else {
			setShowGraph(false);
		}
	}, [igcContent]);

	const updateGraphContent = () => {
		if (igcContent !== null) {
			// Make sure that the file is a igc file
			const content = deserializeGraphData(nodes, edges);
			updateGraphContentFileEditor(content);
		}
	};
	const onNodesChange = (changes: NodeChange[]) => {
		setNodes((nds) => applyNodeChanges(changes, nds));
	};

	useEffect(() => {
		const newNodesDict: NodesDict = {};
		nodes.forEach((node) => {
			newNodesDict[node.id] = node;
		});
		setNodesDict(newNodesDict);

		let newSelectedNodes: Node[] = [];
		for (const nodeId in newNodesDict) {
			const node = newNodesDict[nodeId];
			if (node.selected) {
				newSelectedNodes.push(node);
			}
		}

		setSelectedNodes(newSelectedNodes);
		// setSelectedEdges([]);

		// Update the file editor with the current Graph content
		updateGraphContent();
	}, [nodes]);

	const onEdgesChange = (changes: EdgeChange[]) => {
		setEdges((eds) => {
			return applyEdgeChanges(changes, eds);
		});
	};
	useEffect(() => {
		const newEdgesDict: EdgesDict = {};
		edges.forEach((edge) => {
			newEdgesDict[edge.id] = edge;
		});
		setEdgesDict(newEdgesDict);

		let newSelectedEdges: Edge[] = [];
		for (const edgeId in newEdgesDict) {
			const edge = newEdgesDict[edgeId];
			if (edge.selected) {
				newSelectedEdges.push(edge);
			}
		}
		// setSelectedNodes([]);
		setSelectedEdges(newSelectedEdges);

		updateGraphContent();
	}, [edges]);

	const onConnect = (params: Edge | Connection) => {
		const { source, target } = params;

		// Custom logic to handle the connection
		if (source && target) {
			console.log(`Creating connection from ${source} to ${target}`);
			setEdges((eds) => addEdge(params, eds));
			updateGraphContent();
		} else {
			console.error("Invalid connection attempt:", params);
		}
	};

	const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleAddNode = (type: string) => {
		const newNode: Node = {
			id: `${Date.now()}`,
			type: type as any,
			data: { label: `Node ${nodes.length}` },
			position: {
				x: Math.random() * 500 - 250,
				y: Math.random() * 500 - 250,
			},
			selected: true,
		};
		setNodes((nodes) => [...nodes, newNode]);
		setSelectedNodes(() => [newNode]);
		setSelectedEdges(() => []);
	};

	const handlePanToStartNode = () => {
		if (reactFlowInstance.current) {
			reactFlowInstance.current.setCenter(0, 0);
			reactFlowInstance.current.zoomTo(1);
		}
	};

	useEffect(() => {
		const items: Item[] = [];
		selectedNodes.forEach((node) => {
			items.push({ type: "Node", item: node, id: node.id, name: node.data.label});
		});

		selectedEdges.forEach((edge) => {
			items.push({ type: "Edge", item: edge, id: edge.id, name: edge.id});
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
				<Button startIcon={<AddCircle />} onClick={handleMenuClick}>
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
			<Menu
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem
					onClick={() => {
						handleAddNode("codeFragmentNode");
						handleMenuClose();
					}}
				>
					Add Code Fragment
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleAddNode("codeFragmentNode");
						handleMenuClose();
					}}
				>
					Add Class
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleAddNode("codeFragmentNode");
						handleMenuClose();
					}}
				>
					Add Method
				</MenuItem>
			</Menu>
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
							defaultEdgeOptions={defaultEdgeOptions}
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
