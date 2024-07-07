import { Handle, NodeProps, Position, ReactFlowState, useStore as reactflowStore } from "reactflow";
import { STYLES } from "@/styles/constants";
import useStore from "@/store/store";

import "./BaseNode.css";

const connectionNodeIdSelector = (state: ReactFlowState) =>
	state.connectionNodeId;

interface BaseNodeProps extends NodeProps {
	id: string;
	data: {
		label: string;
		backgroundColor?: string;
	};
}
const BaseNode: React.FC<BaseNodeProps> = ({ id, data }) => {
    const {
		setNodes,
	} = useStore();
    const addSelectedNodes = reactflowStore((rfstate) => rfstate.addSelectedNodes);

    // Override single click and unselect all nodes
	const onNodeClick = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation(); // Prevent the default single click behavior
        setNodes((nodes) => {
            let newNodes = nodes.map((node) => {
                node.selected = false;
                return node;
            });
            return [...newNodes];
        });
	};
    // Double click is highlight
	const onNodeDoubleClick = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		addSelectedNodes([id]); // Manually set the node as selected on double-click
	};

	const connectionNodeId = reactflowStore(connectionNodeIdSelector);
	const defaultData = {
		backgroundColor: STYLES.defaultNodeColor,
	};

	// Merge provided props with default values
	data = { ...defaultData, ...data };

	const isConnecting = !!connectionNodeId;
	const isTarget = connectionNodeId && connectionNodeId !== id;
	const label = isTarget ? "Drop here" : "Drag to connect";

	return (
		<div className="customNode" onClick={onNodeClick} onDoubleClick={onNodeDoubleClick}>
			<div
				className="customNodeBody"
				style={{
					borderStyle: isTarget && isConnecting ? "dashed" : "solid",
					backgroundColor: isConnecting
						? isTarget
							? STYLES.nodeDropColor
							: STYLES.nodePickColor
						: data.backgroundColor,
					// border: "2px solid transparent",
				}}
			>
				{/* If handles are conditionally rendered and not present initially, you need to update the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/ */}
				{/* In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at the beginning and all handles are rendered initially. */}
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
		</div>
	);
};
export default BaseNode;
