import React, { useState } from "react";
import {
	Handle,
	NodeProps,
	Position,
	ReactFlowState,
	useStore as reactflowStore,
} from "reactflow";
import { STYLES } from "@/styles/constants";
import useStore from "@/store/store";
import ContextMenu from "@components/ContextMenu"; // Make sure to adjust the import path

import "./BaseNode.css";
import { CodeExecutionRequest, CodeExecutionResponse } from "@/types/common";
import { useAxiosRequest } from "@/utils/requests";
import { runCode } from "@/utils/codeExecution";

const connectionNodeIdSelector = (state: ReactFlowState) =>
	state.connectionNodeId;

interface BaseNodeProps extends NodeProps {
	id: string;
	data: {
		label: string;
		backgroundColor?: string;
		code?: string;
	};
}

const BaseNode: React.FC<BaseNodeProps> = ({ id, data }) => {
	const {
		setNodes,
		setEdges,
		currentSessionId,
		setCurrentSessionId,
		setSessions,
		setCodeRunData,
	} = useStore();
	const { sendRequest: runCodeSendRequest } = useAxiosRequest<
		CodeExecutionRequest,
		CodeExecutionResponse
	>();

	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
	} | null>(null);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
		setContextMenu({
			mouseX: event.clientX - 2,
			mouseY: event.clientY - 4,
		});
		setAnchorEl(event.currentTarget as HTMLElement);
	};

	const handleClose = () => {
		setContextMenu(null);
		setAnchorEl(null);
	};

	const handleRun = () => {
		console.log("Run action triggered for node:", id);
		if (data.code !== undefined) {
			runCode(
				runCodeSendRequest,
				data.code,
				id,
				setCodeRunData,
				currentSessionId,
				setCurrentSessionId,
				setSessions,
				setEdges,
			);
		}
		// Select the node
		setNodes((prevNodes) => {
			const newNodes = prevNodes.map((node) => {
				if (node.id === id) {
					node.selected = true;
				} else {
					node.selected = false;
				}
				return node;
			});
			return newNodes;
		});
		// Deselect all edges
		setEdges((prevEdges) => {
			const newEdges = prevEdges.map((edge) => {
				edge.selected = false;
				return edge;
			});
			return newEdges;
		});
		handleClose();
	};

	const handleDelete = () => {
		console.log("Delete action triggered for node:", id);
		// Delete Node
		setNodes((prevNodes) => {
			const newNodes = prevNodes.filter((node) => node.id !== id);
			return newNodes;
		});
		handleClose();
	};

	const connectionNodeId = reactflowStore(connectionNodeIdSelector);
	const defaultData = {
		backgroundColor: STYLES.defaultNodeColor,
	};

	data = { ...defaultData, ...data };

	const isConnecting = !!connectionNodeId;
	const isTarget = connectionNodeId && connectionNodeId !== id;
	const label = isTarget ? "Drop here" : "Drag to connect";

	return (
		<div className="customNode" onContextMenu={handleContextMenu}>
			<div
				className="customNodeBody"
				style={{
					borderStyle: isTarget && isConnecting ? "dashed" : "solid",
					backgroundColor: isConnecting
						? isTarget
							? STYLES.nodeDropColor
							: STYLES.nodePickColor
						: data.backgroundColor,
				}}
			>
				{!isConnecting && (
					<Handle
						className="customHandle"
						position={Position.Right}
						type="source"
					/>
				)}

				<Handle
					className="customHandle"
					position={Position.Left}
					type="target"
					isConnectableStart={false}
				/>

				{isConnecting && label}
				{!isConnecting && data.label}
				{!isConnecting && <div className="base"></div>}
			</div>

			<ContextMenu
				anchorEl={anchorEl}
				handleClose={handleClose}
				position={contextMenu}
				onRun={handleRun}
				onDelete={handleDelete}
			/>
		</div>
	);
};

export default BaseNode;
