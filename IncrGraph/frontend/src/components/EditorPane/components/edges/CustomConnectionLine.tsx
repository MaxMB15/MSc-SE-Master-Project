import { ConnectionLineComponent, getStraightPath } from "reactflow";
import { STYLES } from "@/styles/constants";
import { Node } from "reactflow";
import { Point } from "../utils/types";
import {
	calculatePerpendicularOffsetPoint,
	getBezierNodeIntersection,
	getNodeIntersectionWithCircle,
} from "../utils/utils";

export const getSimpleStraightPath = (
	sourceX: number,
	sourceY: number,
	targetX: number,
	targetY: number,
): string => {
	const [path] = getStraightPath({
		sourceX: sourceX,
		sourceY: sourceY,
		targetX: targetX,
		targetY: targetY,
	});
	return path;
};

const calculateOffset = (
	id: string,
	idList: string[],
	offsetGap: number,
): number => {
	const idIndex = idList.indexOf(id);

	if (idIndex === -1) {
		throw new Error(`Id "${id}" not found in the idList`);
	}

	const totalIds = idList.length;
	const halfRange = (totalIds - 1) / 2;

	const offset = (idIndex - halfRange) * offsetGap;

	return offset;
};

export const getOffsetPath = (
	sourceX: number,
	sourceY: number,
	targetX: number,
	targetY: number,
	offset: number,
) => {
	const isVertical =
		Math.abs(targetY - sourceY) > Math.abs(targetX - sourceX);
	let controlX, controlY;

	if (isVertical) {
		// For vertical alignment, offset in the X direction
		controlX = (sourceX + targetX) / 2 + offset;
		controlY = (sourceY + targetY) / 2;
	} else {
		// For horizontal alignment, offset in the Y direction
		controlX = (sourceX + targetX) / 2;
		controlY = (sourceY + targetY) / 2 + offset;
	}

	return `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
};

export const getSmartOffsetPath = (
	sourceX: number,
	sourceY: number,
	targetX: number,
	targetY: number,
	edgeId: string,
	idList: string[],
	offsetGap = 50,
) => {
	const offset = calculateOffset(edgeId, idList, offsetGap);
	return getOffsetPath(sourceX, sourceY, targetX, targetY, offset);
};

export const createSmartQuadraticPath = (
	sourceNode: Node,
	targetNode: Node,
	edgeId: string,
	idList: string[],
	offsetGap = 50,
) => {
	let offset = calculateOffset(edgeId, idList, offsetGap);
	if (sourceNode.id > targetNode.id) {
		offset = -offset;
	}
	return createQuadraticPath(sourceNode, targetNode, offset);
};

const createQuadraticPath = (
	sourceNode: Node,
	targetNode: Node,
	offset: number,
): { path: string; labelPoint: Point } => {
	if (
		sourceNode.width == null ||
		sourceNode.height == null ||
		sourceNode.positionAbsolute == null ||
		sourceNode.positionAbsolute.x == null ||
		sourceNode.positionAbsolute.y == null
	) {
		console.error("Intersection Node is missing width, height, x or y");
		return { path: "", labelPoint: { x: 0, y: 0 } };
	}
	if (
		targetNode.width == null ||
		targetNode.height == null ||
		targetNode.positionAbsolute == null ||
		targetNode.positionAbsolute.x == null ||
		targetNode.positionAbsolute.y == null
	) {
		console.error("Intersection Node is missing width, height, x or y");
		return { path: "", labelPoint: { x: 0, y: 0 } };
	}
	const sourceCenter: Point = {
		x: sourceNode.positionAbsolute.x + sourceNode.width / 2,
		y: sourceNode.positionAbsolute.y + sourceNode.height / 2,
	};
	const targetCenter: Point = {
		x: targetNode.positionAbsolute.x + targetNode.width / 2,
		y: targetNode.positionAbsolute.y + targetNode.height / 2,
	};

	const offsetPoint = calculatePerpendicularOffsetPoint(
		sourceCenter,
		targetCenter,
		offset * 1,
	);
	const labelPoint = calculatePerpendicularOffsetPoint(
		sourceCenter,
		targetCenter,
		offset,
	);

	// Calculate the control point
	const controlPoint: Point = {
		x: 2 * offsetPoint.x - 0.5 * (sourceCenter.x + targetCenter.x),
		y: 2 * offsetPoint.y - 0.5 * (sourceCenter.y + targetCenter.y),
	};

	const sourceIntersection = getBezierNodeIntersection(
		sourceNode,
		sourceCenter,
		controlPoint,
		targetCenter,
	);
	const targetIntersection = getBezierNodeIntersection(
		targetNode,
		sourceCenter,
		controlPoint,
		targetCenter,
	);

	// Calculate the adjusted control point
	const adjustedControlPoint: Point = {
		x:
			2 * offsetPoint.x -
			0.5 * (sourceIntersection.x + targetIntersection.x),
		y:
			2 * offsetPoint.y -
			0.5 * (sourceIntersection.y + targetIntersection.y),
	};

	// If intersections were not found, fallback to original points
	const finalSource = sourceIntersection || sourceCenter;
	const finalTarget = targetIntersection || targetCenter;

	// Create the quadratic Bezier path command
	return {
		path: `M ${finalSource.x},${finalSource.y} Q ${adjustedControlPoint.x},${adjustedControlPoint.y} ${finalTarget.x},${finalTarget.y}`,
		labelPoint: labelPoint,
	};
};

export const createSmartSelfLoopPath = (
	node: Node,
	edgeId: string,
	idList: string[],
	offsetGap = 20,
	startOffset = 0,
) => {
	let radius = startOffset + offsetGap * idList.indexOf(edgeId);
	return createSelfLoopPath(node, radius);
};

const createSelfLoopPath = (node: Node, r: number) => {
	if (
		node.width == null ||
		node.height == null ||
		node.positionAbsolute == null ||
		node.positionAbsolute.x == null ||
		node.positionAbsolute.y == null
	) {
		console.error("Intersection Node is missing width, height, x or y");
		return { path: "", labelPoint: { x: 0, y: 0 } };
	}
	const centerX = node.positionAbsolute.x + node.width / 2;
	const centerY = node.positionAbsolute.y + node.height / 2;

	// Calculate circle center
	const circleCenter = { x: centerX, y: centerY + r };

	// Calculate label point
	const labelPoint = { x: centerX, y: centerY + 2 * r };

	// Calculate the intersection points of the node bounds and the circle
	const intersections = getNodeIntersectionWithCircle(node, circleCenter, r);

	if (intersections.length < 2) {
		console.error("Not enough intersection points found");
		return { path: "", labelPoint: { x: 0, y: 0 } };
	}

    // Calculate large-arc-flag and sweep-flag for arc
    const largeArcFlag = 0;
    const sweepFlag = 1;

    // Create the arc path command
    const path = `M ${intersections[0].x},${intersections[0].y} A ${r},${r} 0 1,0 ${intersections[1].x},${intersections[1].y}`;
    return {
		path,
		labelPoint,
	};
};

const CustomConnectionLine: ConnectionLineComponent = ({
	fromX,
	fromY,
	toX,
	toY,
	connectionLineStyle,
}) => {
	return (
		<g>
			<path
				style={connectionLineStyle}
				fill="none"
				d={getSimpleStraightPath(fromX, fromY, toX, toY)}
			/>
			<circle
				cx={toX}
				cy={toY}
				fill={STYLES.defaultEdgeColor}
				r={3}
				stroke={STYLES.defaultEdgeColor}
				strokeWidth={1.5}
			/>
		</g>
	);
};

export default CustomConnectionLine;

export const connectionLineStyle = {
	strokeWidth: STYLES.edgeWidth,
	stroke: STYLES.defaultEdgeColor,
};
