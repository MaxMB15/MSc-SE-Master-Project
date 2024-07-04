import { ComponentType, useCallback } from "react";
import { useStore, getStraightPath, EdgeProps, MarkerType } from "reactflow";
import { STYLES } from "@/styles/constants";

import { getEdgeParams } from "../../utils/utils";

interface BaseRelationProps extends EdgeProps {
	id: string;
	source: string;
	target: string;
	style?: React.CSSProperties;
	data?: {
		backgroundColor?: string;
	};
	selected?: boolean;
}

const BaseRelation: ComponentType<BaseRelationProps> = ({
	id,
	source,
	target,
	style,
	data,
	selected,
}) => {
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

	let color = STYLES.defaultEdgeColor;
	if (data !== undefined && data.backgroundColor !== undefined) {
		color = data.backgroundColor;
	}

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
						style={{ stroke: color, fill: color, strokeWidth: STYLES.edgeWidth }}
						strokeLinecap="round"
						strokeLinejoin="round"
						points="-5,-4 0,0 -5,4 -5,-4"
					/>
				</marker>
			</defs>
			{selected && (
				<path
					id={id}
					d={edgePath}
					style={{
						...style,
						strokeWidth: parseInt(STYLES.edgeWidth) + 5,
						stroke: hexToRGBA(color),
					}}
				/>
			)}
			<path
				id={id}
				className="react-flow__edge-path"
				d={edgePath}
				markerEnd={`url(#${markerId})`}
				style={{
					...style,
					strokeWidth: STYLES.edgeWidth,
					stroke: color,
				}}
			/>
		</>
	);
};

export default BaseRelation;

export const defaultEdgeOptions = {
	// style: { strokeWidth: STYLES.edgeWidth, stroke: STYLES.defaultEdgeColor },
	type: "floating",
	markerEnd: {
		type: MarkerType.ArrowClosed,
		color: STYLES.defaultEdgeColor,
	},
	elevateEdgesOnSelection: true,
};
