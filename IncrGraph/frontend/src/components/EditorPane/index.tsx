import React, { useCallback, useState } from "react";
import { Box } from "@mui/material";
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
} from "reactflow";
import "reactflow/dist/style.css";
import "./EditorPane.css";

const initialNodes: Node[] = [
	{
		id: "1",
		type: "input",
		data: { label: "Start Node" },
		position: { x: 250, y: 5 },
	},
	{
		id: "2",
		data: { label: "Another Node" },
		position: { x: 100, y: 100 },
	},
	{
		id: "3",
		data: { label: "Output Node" },
		position: { x: 400, y: 100 },
	},
];

const initialEdges: Edge[] = [
	{ id: "e1-2", source: "1", target: "2", animated: true },
	{ id: "e2-3", source: "2", target: "3", animated: true },
];

const EditorPaneContent: React.FC = () => {
	const [nodes, setNodes] = useState<Node[]>(initialNodes);
	const [edges, setEdges] = useState<Edge[]>(initialEdges);

	const onNodesChange = useCallback(
		(changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
		[],
	);
	const onConnect = useCallback(
		(connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
		[],
	);

	const handlePaneClick = useCallback((event: React.MouseEvent) => {
		if (event.button === 2) {
			event.preventDefault();
			// Implement custom right-click drag for panning
			const onMouseMove = (moveEvent: MouseEvent) => {
				window.scrollBy(moveEvent.movementX, moveEvent.movementY);
			};

			const onMouseUp = () => {
				window.removeEventListener("mousemove", onMouseMove);
				window.removeEventListener("mouseup", onMouseUp);
			};

			window.addEventListener("mousemove", onMouseMove);
			window.addEventListener("mouseup", onMouseUp);
		}
	}, []);

	return (
		<div className="editor-pane-content" onMouseDown={handlePaneClick}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
				zoomOnScroll
				panOnScroll={false} // Disable default panning
				selectionKeyCode={["Shift", "Meta"]} // Support multiple selection with Shift or Cmd key
			>
				<MiniMap />
				<Controls />
				<Background />
			</ReactFlow>
		</div>
	);
};

const EditorPane: React.FC = () => {
	return (
		<div className="editor-pane">
			<div className="navbar">
				<span className="directory-name">Editor Pane</span>
			</div>
			<Box
				sx={{
					flexGrow: 1,
					backgroundColor: "#1e1e1e",
					overflow: "hidden", // Ensure no overflow in the container
				}}
			>
				<ReactFlowProvider>
					<EditorPaneContent />
				</ReactFlowProvider>
			</Box>
		</div>
	);
};

export default EditorPane;
