import React, { useCallback, useState, useRef, useEffect } from "react";
import { Box, Button, IconButton, Menu, MenuItem } from "@mui/material";
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
import FloatingEdge, { defaultEdgeOptions } from "./components/edges/FloatingEdge";
import CustomConnectionLine, {
	connectionLineStyle,
} from "./components/edges/CustomConnectionLine";

const initialNodes: Node[] = [
	{
		id: "start",
		type: "startNode",
		data: { label: "Start" },
		position: { x: 0, y: -200 }, // Position a bit above 0, 0
		draggable: false,
        style: { cursor: "grab" }
	},
	{
		id: "1",
		type: "baseNode",
		data: { label: "User Class"},
		position: { x: -100, y: -100 },
	},
	{
		id: "2",
		type: "codeFragmentNode",
		data: { label: "Admin Class"},
		position: { x: 100, y: 100 },
	},
];

const initialEdges: Edge[] = [];

const nodeTypes = {
	startNode: StartNode,
	baseNode: BaseNode,
	codeFragmentNode: CodeFragmentNode,
};

const edgeTypes = {
	floating: FloatingEdge,
};


const EditorPane: React.FC = () => {
	const [nodes, setNodes] = useState<Node[]>(initialNodes);
	const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
    const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
    
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);


	const onNodesChange = useCallback(
		(changes: NodeChange[]) =>
			setNodes((nds) => applyNodeChanges(changes, nds)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes: EdgeChange[]) =>
			setEdges((eds) => applyEdgeChanges(changes, eds)),
		[],
	);
	const onConnect = useCallback((params: Edge | Connection) => {
		const { source, target } = params;

		// Custom logic to handle the connection
		if (source && target) {
			console.log(`Creating connection from ${source} to ${target}`);
			setEdges((eds) => addEdge(params, eds));
		} else {
			console.error("Invalid connection attempt:", params);
		}
	}, []);

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
    }

	return (
		<ReactFlowProvider>
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
						<MiniMap />
						<Controls showFitView={false}/>
						<Background />
					</ReactFlow>
				</Box>
			</div>
		</ReactFlowProvider>
	);
};

export default EditorPane;
