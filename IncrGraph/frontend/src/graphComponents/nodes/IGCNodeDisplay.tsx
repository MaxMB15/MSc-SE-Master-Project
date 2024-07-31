import ContextMenu from "@/components/ContextMenu";
import useStore from "@/store/store";
import { STYLES } from "@/styles/constants";
import { useState } from "react";
import { useStore as reactflowStore, ReactFlowState, Position, Handle } from "reactflow";
import "./IGCNodeDisplay.css";


interface IGCNodeDisplayProps {
    id: string;
    label: string;
    backgroundColor: string;
    handleRun?: () => void;
}

const IGCNodeDisplay: React.FC<IGCNodeDisplayProps> = ({
    id,
    label,
    backgroundColor,
    handleRun,
}: IGCNodeDisplayProps) => {

    const {
		setNodes,
	} = useStore();

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

    const connectionNodeIdSelector = (state: ReactFlowState) =>
        state.connectionNodeId;
    const connectionNodeId = reactflowStore(connectionNodeIdSelector);

    const isConnecting = !!connectionNodeId;
    const isTarget = connectionNodeId && connectionNodeId !== id;
    label = isTarget ? "Drop here" : "Drag to connect";
    
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
						: backgroundColor,
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
				<div style={{ textAlign: "center" }}>
					{label}
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

}

export default IGCNodeDisplay