import { STYLES } from "@/styles/constants";
import { LabelProps, Point } from "@/types/frontend";
import { EdgeLabelRenderer, EdgeProps } from "reactflow";
import { createSmartQuadraticPath, createSmartSelfLoopPath } from "../utils/CustomConnectionLine";
import useStore from "@/store/store";

interface IGCRelationshipDisplayProps extends EdgeProps {
    id: string;
    source: string;
    target: string;
    color: string;
    labelObj?: LabelProps;
}

export const IGCRelationshipDisplay: React.FC<IGCRelationshipDisplayProps> = (props: IGCRelationshipDisplayProps) => {
    return (
        <IGCRelationshipDisplayComponent
            id={props.id}
            source={props.source}
            target={props.target}
            color={props.color}
            labelObj={props.labelObj}
            selected={props.selected || false}
        />
    );
}

interface IGCRelationshipDisplayComponentProps {
    id: string;
    source: string;
    target: string;
    color: string;
    selected: boolean;
    labelObj?: LabelProps;
}

const IGCRelationshipDisplayComponent: React.FC<IGCRelationshipDisplayComponentProps> = ({
    id,
    source,
    target,
    color,
    selected,
    labelObj,
}) => {
    const { nodes, edges } = useStore();

    const sourceNode = nodes.find((node) => node.id === source);
	const targetNode = nodes.find((node) => node.id === target);

	if (!sourceNode || !targetNode) {
		return null;
	}

	let edgePath: string;
	let labelPoint: Point;
	if (source === target) {
		const samePathEdges = edges.filter((edge) => edge.toRFEdge().hidden !== true && (edge.source === source && edge.target === target) && source === target)
				.map((edge) => edge.id);
		const selfPath = createSmartSelfLoopPath(sourceNode, id, samePathEdges);
        edgePath = selfPath.path;
		labelPoint = selfPath.labelPoint;
	} else {
		const samePathEdges = useStore((store) =>
			store.edges
				.filter(
					(edge) =>
						edge.toRFEdge().hidden !== true &&
						((edge.source === source && edge.target === target) ||
							(edge.source === target && edge.target === source)),
				)
				.map((edge) => edge.id),
		);
		const quadPath = createSmartQuadraticPath(
			sourceNode,
			targetNode,
			id,
			samePathEdges,
		);
		edgePath = quadPath.path;
		labelPoint = quadPath.labelPoint;
	}
    
    const hexToRGBA = (hex: string): string => {
		// Remove the leading '#' if present
		hex = hex.replace(/^#/, "");

		// If the hex code is in shorthand form (e.g., "#f53"), convert it to full form (e.g., "#ff5533")
		if (hex.length === 3) {
			hex = hex
				.split("")
				.map((char) => char + char)
				.join("");
		}

		// Parse the r, g, b values
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);

		// Return the RGBA color with 50% transparency
		return `rgba(${r}, ${g}, ${b}, 0.5)`;
	};
    
    const markerId = `${id}__color=${color}&type=arrowclosed`;

    return (
		<>
			<defs>
				<marker
					className="react-flow__arrowhead"
					id={markerId}
					markerWidth="12.5"
					markerHeight="12.5"
					viewBox="-10 -10 20 20"
					markerUnits="strokeWidth"
					orient="auto-start-reverse"
					refX="0"
					refY="0"
				>
					<polyline
						style={{
							stroke: color,
							fill: color,
							strokeWidth: STYLES.edgeWidth,
						}}
						strokeLinecap="round"
						strokeLinejoin="round"
						points="-5,-4 0,0 -5,4 -5,-4"
					/>
				</marker>
			</defs>
			{selected && (
				<path
					id={`${id}-selected`}
					d={edgePath}
					style={{
						strokeWidth: parseInt(STYLES.edgeWidth) + 5,
						stroke: hexToRGBA(color),
						fill: "transparent",
					}}
				/>
			)}
			<path
				id={id}
				className="react-flow__edge-path"
				d={edgePath}
				markerEnd={`url(#${markerId})`}
				style={{
					strokeWidth: STYLES.edgeWidth,
					stroke: color,
				}}
			/>
			{labelObj !== undefined && (
				<EdgeLabelRenderer>
					<div
						style={{
							position: "absolute",
							transform: `translate(-50%, -50%) translate(${labelPoint.x}px,${labelPoint.y}px)`,
							fontSize: 12,
							// everything inside EdgeLabelRenderer has no pointer events by default
							// if you have an interactive element, set pointer-events: all
							pointerEvents: "all",
						}}
						className="nodrag nopan"
					>
						<div
							style={{
								height: "20px",
								minWidth: "20px",
								background: "#2e2e2ef0",
								padding: "0px 1px",
								border: `2px solid ${color}`,
								cursor: "pointer",
								borderRadius: `${labelObj.labelRadius}%`,
								fontSize: "12px",
								lineHeight: "19px",
								textAlign: "center",
								color: "#eeeeee",
							}}
						>
							{labelObj.label}
						</div>
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
};

export default IGCRelationshipDisplay