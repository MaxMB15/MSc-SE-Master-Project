import React, { useCallback, useState, useRef, useEffect } from "react";
import { Alert, AlertTitle, Box, Button, IconButton, Menu, MenuItem } from "@mui/material";
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
} from "reactflow";
import "reactflow/dist/style.css";
import "./EditorPane.css";
import StartNode from "./components/nodes/StartNode";
import CodeFragmentNode from "./components/nodes/CodeFragmentNode";
import BaseNode from "./components/nodes/BaseNode";
import FloatingEdge, {
	defaultEdgeOptions,
} from "./components/edges/FloatingEdge";
import CustomConnectionLine, {
	connectionLineStyle,
} from "./components/edges/CustomConnectionLine";

interface EditorPaneProps {
	igcContent: string | null;
	updateGraphContentFileEditor: (content: string) => void;
}

const nodeTypes = {
	startNode: StartNode,
	baseNode: BaseNode,
	codeFragmentNode: CodeFragmentNode,
};

const edgeTypes = {
	floating: FloatingEdge,
};

const EditorPane: React.FC<EditorPaneProps> = ({
	igcContent,
	updateGraphContentFileEditor,
}) => {
	// State
	const [showGraph, setShowGraph] = useState(false);
    const [startup, setStartup] = useState(false);

	const [nodes, setNodes] = useState<Node[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);

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
			setEdges(edges);
            // updateGraphContent();
		}
	};
	useEffect(() => {
		if (igcContent !== null) {
			setShowGraph(true);
            setStartup(false);
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
        if(startup) {
            updateGraphContent();
        }
        else{
            setStartup(true);
        }
	};
	const onEdgesChange = (changes: EdgeChange[]) => {
		setEdges((eds) => applyEdgeChanges(changes, eds));
		updateGraphContent();
	};
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
		};
		setNodes((nodes) => [...nodes, newNode]);
	};

	const handlePanToStartNode = () => {
		if (reactFlowInstance.current) {
			reactFlowInstance.current.setCenter(0, 0);
			reactFlowInstance.current.zoomTo(1);
		}
	};

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
					<div style={{
                            margin: "10px",
                    }}>
						Not a valid IGC file
                    </div>
					
				)}
			</Box>
		</div>
	);
};

export default EditorPane;
