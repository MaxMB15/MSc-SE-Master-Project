import { ComponentType, useCallback } from "react";
import { useStore, getStraightPath, EdgeProps, MarkerType } from "reactflow";
import { STYLES } from "../../../../styles/constants";


import { getEdgeParams } from "../utils/utils";

const FloatingEdge: ComponentType<EdgeProps> = ({ id, source, target, markerEnd, style }) => {
	const sourceNode = useStore(
		useCallback((store) => store.nodeInternals.get(source), [source]),
	);
	const targetNode = useStore(
		useCallback((store) => store.nodeInternals.get(target), [target]),
	);

	if (!sourceNode || !targetNode) {
		return null;
	}

	const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

	const [edgePath] = getStraightPath({
		sourceX: sx,
		sourceY: sy,
		targetX: tx,
		targetY: ty,
	});

	return (
		<path
			id={id}
			className="react-flow__edge-path"
			d={edgePath}
			markerEnd={markerEnd}
			style={style}
		/>
	);
}

export default FloatingEdge;

export const defaultEdgeOptions = {
	style: { strokeWidth: STYLES.edgeWidth, stroke: STYLES.defaultEdgeColor },
	type: "floating",
	markerEnd: {
		type: MarkerType.ArrowClosed,
		color: STYLES.defaultEdgeColor,
	},
};
