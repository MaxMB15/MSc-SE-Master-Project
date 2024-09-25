import "./GraphNode.css";
import BaseNode, { IGCNodeProps } from "../BaseNode";
import { STYLES } from "@/styles/constants";
import { createComponent } from "@/utils/componentCache";
import { RegistryComponent } from "@/types/frontend";

export type GraphNodeData = {
	filePath: string;
	selectedSession: string;
};

const RawGraphNode: IGCNodeProps<GraphNodeData> = (props) => (
	<BaseNode
		{...props}
		data={{
			...props.data,
			children: (
				<GraphNodeDisplay
					filePath={props.data.filePath}
					selectedSession={props.data.selectedSession}
				/>
			),
			backgroundColor: GraphNode.color,
		}}
	/>
);

const GraphNode: IGCNodeProps<GraphNodeData> & RegistryComponent =
	createComponent(RawGraphNode, "GraphNode", "Graph Node", {
		color: STYLES.graphNodeColor,
		parentComponent: BaseNode,
		settable: true,
	});

interface GraphNodeDisplayProps {
	filePath: string;
	selectedSession: string;
}

const GraphNodeDisplay: React.FC<GraphNodeDisplayProps> = ({
	filePath,
	selectedSession,
}: GraphNodeDisplayProps) => {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				height: "100%",
				position: "relative",
			}}
		>
			<img
				src="/logo.png"
				alt="Logo"
				style={{
					position: "absolute",
					top: "10px",
					left: "10px",
					width: "20px",
					height: "20px",
				}}
			/>
			<div
				style={{
					fontSize: "12px",
					textAlign: "center",
					width: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<div style={{ marginBottom: "5px" }}>{filePath}</div>
				<div style={{ fontWeight: "lighter" }}>{selectedSession}</div>
			</div>
		</div>
	);
};

export default GraphNode;
