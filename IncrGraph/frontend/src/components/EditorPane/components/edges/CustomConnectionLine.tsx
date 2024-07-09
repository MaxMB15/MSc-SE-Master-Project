import { ConnectionLineComponent, getStraightPath } from "reactflow";
import { STYLES } from "@/styles/constants";
import { Node } from "reactflow";
import { Point } from "../utils/types";
import {
	calculatePerpendicularOffsetPoint,
	getBezierNodeIntersection,
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

	return `M ${sourceX} ${sourceY} Q ${controlX} ${
		controlY + offset
	} ${targetX} ${targetY}`;
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
): string => {
	if (
		sourceNode.width == null ||
		sourceNode.height == null ||
		sourceNode.positionAbsolute == null ||
		sourceNode.positionAbsolute.x == null ||
		sourceNode.positionAbsolute.y == null
	) {
		console.error("Intersection Node is missing width, height, x or y");
		return "";
	}
	if (
		targetNode.width == null ||
		targetNode.height == null ||
		targetNode.positionAbsolute == null ||
		targetNode.positionAbsolute.x == null ||
		targetNode.positionAbsolute.y == null
	) {
		console.error("Intersection Node is missing width, height, x or y");
		return "";
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

	// If intersections were not found, fallback to original points
	const finalSource = sourceIntersection || sourceCenter;
	const finalTarget = targetIntersection || targetCenter;

	// Create the quadratic Bezier path command
	return `M ${finalSource.x},${finalSource.y} Q ${controlPoint.x},${controlPoint.y} ${finalTarget.x},${finalTarget.y}`;
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
