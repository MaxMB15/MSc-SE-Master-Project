import { Handle, Position, ReactFlowState, useStore } from "reactflow";
import { STYLES } from "../../../../../styles/constants";

import "./baseNode.css";

const connectionNodeIdSelector = (state: ReactFlowState) =>
	state.connectionNodeId;

interface BaseNodeProps {
	id: string;
	data: {
		label: string;
		backgroundColor?: string;
	};
}
const BaseNode: React.FC<BaseNodeProps> = ({ id, data }) => {
	const connectionNodeId = useStore(connectionNodeIdSelector);
    const selectedElements = useStore((state) => state.selectedElements);
	const defaultData = {
		backgroundColor: STYLES.defaultNodeColor,
	};

	// Merge provided props with default values
	data = { ...defaultData, ...data };

	const isConnecting = !!connectionNodeId;
	const isTarget = connectionNodeId && connectionNodeId !== id;
	const label = isTarget ? "Drop here" : "Drag to connect";

	return (
		<div className="customNode">
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
