import React, { useState, useMemo } from "react";
import {
    Node,
	Handle,
	NodeProps,
	Position,
	ReactFlowState,
	useStore as reactflowStore,
} from "reactflow";
import { STYLES } from "@/styles/constants";
import useStore from "@/store/store";
import ContextMenu from "@components/ContextMenu";
import "./BaseNode.css";
import { runCode } from "@/utils/codeExecution";
import { Definitions, Dependencies } from "shared";
import { getNodeId } from "../../utils/utils";

const connectionNodeIdSelector = (state: ReactFlowState) =>
	state.connectionNodeId;

type CodeData = {
	code: string;
	scope?: string;
	dependencies?: Dependencies;
	new_definitions?: Definitions;
};

export type IGCNodeData<T = {}> = T & {
	label: string;
    backgroundColor?: string;
	codeData?: CodeData;
	children?: React.ReactNode;
};

export type IGCNodeProps<T={}> = React.FC<NodeProps<IGCNodeData<T>>> & { 
    NAME: string,
    COLOR: string;
    SETABLE?: boolean; // Default is false
};

const BaseNode: IGCNodeProps = ({ id, data }) => {
	const { projectDirectory, setNodes, setEdges } = useStore();
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
		if (data.codeData !== undefined && projectDirectory !== null) {
			runCode(data.codeData.code, id, data.codeData.scope);
		}

		// Select the node
		setNodes((prevNodes) => {
			return prevNodes.map((node) => {
				node.selected = node.id === id;
				return node;
			});
		});

		// Deselect all edges
		setEdges((prevEdges) => {
			return prevEdges.map((edge) => {
				edge.selected = false;
				return edge;
			});
		});

		handleClose();
	};

	const handleDelete = () => {
		console.log("Delete action triggered for node:", id);
		setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
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
						: (data.backgroundColor !== undefined ? data.backgroundColor : BaseNode.COLOR),
				}}
			>
				{data.children !== undefined && data.children}
				{!isConnecting && (
					<Handle
						position={Position.Right}
						type="source"
						style={{
							width: "100%",
							height: "100%",
							position: "absolute",
							backgroundColor: "transparent",
							top: 0,
							left: 0,
							borderRadius: 0,
							transform: "none",
							border: "none",
							zIndex: 5,
						}}
					/>
				)}
				<Handle
					position={Position.Left}
					type="target"
					isConnectableStart={false}
					style={{
						width: "100%",
						height: "100%",
						position: "absolute",
						backgroundColor: "transparent",
						top: 0,
						left: 0,
						borderRadius: 0,
						transform: "none",
						border: "none",
						zIndex: 5,
					}}
				/>
				<div style={{ textAlign: "center" }}>
					{isConnecting && label}
					{!isConnecting && data.children === undefined && data.label}
				</div>

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
BaseNode.NAME = "BaseNode";
BaseNode.COLOR = STYLES.defaultNodeColor;
BaseNode.SETABLE = true;

export const createBaseNode = (curNodes: Node<IGCNodeData>[]): Node<IGCNodeData> => { 
    return {
        id: getNodeId(curNodes),
        type: BaseNode.NAME,
        data: { 
            label: `Node ${curNodes.length}`, 
        },
        position: {
            x: Math.random() * 500 - 250,
            y: Math.random() * 500 - 250,
        },
        selected: true,
    }
}

export default BaseNode;
