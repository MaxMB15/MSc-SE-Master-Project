import React, { useState } from "react";
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
import { getNodeId } from "../../utils/utils";
import { RegistryComponent } from "@/types/frontend";

const connectionNodeIdSelector = (state: ReactFlowState) =>
	state.connectionNodeId;

export type IGCNodeData<T = {}> = T & {
	label: string;
    backgroundColor?: string;
	children?: React.ReactNode;
    handleRun?: () => void;
};

export type IGCNodePropsWithoutRegistry<T={}> = React.FC<NodeProps<IGCNodeData<T>>>;
export type IGCNodeProps<T={}> = IGCNodePropsWithoutRegistry<T> & RegistryComponent;

const BaseNode: IGCNodeProps = ({ id, data }) => {
	const { setNodes } = useStore();
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

	const handleDelete = () => {
		console.log("Delete action triggered for node:", id);
		setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
        handleClose();
	};
    const contextMenuAction = (action: (() => void) | undefined) => {
        if (action === undefined) {
            return undefined;
        }
        action();
        handleClose();
    }

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
				onRun={() => contextMenuAction(data.handleRun)}
				onDelete={handleDelete}
			/>
		</div>
	);
};
BaseNode.NAME = "BaseNode";
BaseNode.COLOR = STYLES.defaultNodeColor;
BaseNode.TYPE = "node";
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
