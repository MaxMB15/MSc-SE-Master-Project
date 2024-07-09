import {
	Position,
	MarkerType,
	NodeTypes,
	EdgeTypes,
	isEdge,
	Edge,
	Connection,
} from "reactflow";
import { Node, Point } from "./types";
import StartNode from "../nodes/StartNode";
import BaseNode from "../nodes/BaseNode";
import CodeFragmentNode from "../nodes/CodeFragmentNode";
import ClassNode from "../nodes/ClassNode";
import AbstractClassNode from "../nodes/AbstractClassNode";
import InterfaceNode from "../nodes/InterfaceNode";
import LibraryNode from "../nodes/LibraryNode";
import MethodNode from "../nodes/MethodNode";
import BaseRelationship from "../edges/BaseRelationship";
import InheritanceRelationship from "../edges/InheritanceRelationship";
import OverridesRelationship from "../edges/OverridesRelationship";
import MethodRelationship from "../edges/MethodRelationship";
import ExecutionRelationship from "../edges/ExecutionRelationship";
import DependencyRelationship from "../edges/DependencyRelationship";

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
const getNodeIntersection = (intersectionNode: Node, targetNode: Node) => {
	// https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
	if (
		intersectionNode.width == null ||
		intersectionNode.height == null ||
		intersectionNode.positionAbsolute == null ||
		intersectionNode.positionAbsolute.x == null ||
		intersectionNode.positionAbsolute.y == null
	) {
		console.error("Intersection Node is missing width, height, x or y");
		return { x: 0, y: 0 };
	}
	if (
		targetNode.width == null ||
		targetNode.height == null ||
		targetNode.positionAbsolute == null ||
		targetNode.positionAbsolute.x == null ||
		targetNode.positionAbsolute.y == null
	) {
		console.error("Target Node is missing width, height, x or y");
		return { x: 0, y: 0 };
	}
	const {
		width: intersectionNodeWidth,
		height: intersectionNodeHeight,
		positionAbsolute: intersectionNodePosition,
	} = intersectionNode;
	const targetPosition = targetNode.positionAbsolute;

	const w = intersectionNodeWidth / 2;
	const h = intersectionNodeHeight / 2;

	const x2 = intersectionNodePosition.x + w;
	const y2 = intersectionNodePosition.y + h;
	const x1 = targetPosition.x + targetNode.width / 2;
	const y1 = targetPosition.y + targetNode.height / 2;

	const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
	const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
	const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
	const xx3 = a * xx1;
	const yy3 = a * yy1;
	const x = w * (xx3 + yy3) + x2;
	const y = h * (-xx3 + yy3) + y2;

	return { x, y };
};

// returns the position (top,right,bottom or right) passed node compared to the intersection point
const getEdgePosition = (node: Node, intersectionPoint: Point) => {
	const n = { ...node.positionAbsolute, ...node };
	if (n.width == null || n.height == null || n.x == null || n.y == null) {
		console.error("Node is missing width, height, x or y");
		return Position.Top;
	}

	const nx = Math.round(n.x);
	const ny = Math.round(n.y);
	const px = Math.round(intersectionPoint.x);
	const py = Math.round(intersectionPoint.y);
	if (px <= nx + 1) {
		return Position.Left;
	}
	if (px >= nx + n.width - 1) {
		return Position.Right;
	}
	if (py <= ny + 1) {
		return Position.Top;
	}
	if (py >= n.y + n.height - 1) {
		return Position.Bottom;
	}

	return Position.Top;
};

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export const getEdgeParams = (source: Node, target: Node) => {
	const sourceIntersectionPoint = getNodeIntersection(source, target);
	const targetIntersectionPoint = getNodeIntersection(target, source);

	const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
	const targetPos = getEdgePosition(target, targetIntersectionPoint);

	return {
		sx: sourceIntersectionPoint.x,
		sy: sourceIntersectionPoint.y,
		tx: targetIntersectionPoint.x,
		ty: targetIntersectionPoint.y,
		sourcePos,
		targetPos,
	};
};

// Bezier curve functions
const calculateMidpoint = (p1: Point, p2: Point): Point => ({
	x: (p1.x + p2.x) / 2,
	y: (p1.y + p2.y) / 2,
});

export const calculatePerpendicularOffsetPoint = (
	p1: Point,
	p2: Point,
	offset: number,
): Point => {
	const midpoint = calculateMidpoint(p1, p2);
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;

	// Normalize the vector (dx, dy)
	const length = Math.sqrt(dx * dx + dy * dy);
	const ux = dx / length;
	const uy = dy / length;

	// Perpendicular vector (ux, uy) -> (-uy, ux)
	const offsetX = -uy * offset;
	const offsetY = ux * offset;

	// Calculate the offset point on the perpendicular line
	return { x: midpoint.x + offsetX, y: midpoint.y + offsetY };
};

const bezierPoint = (p0: Point, p1: Point, p2: Point, t: number): Point => ({
	x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x,
	y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y,
});

const solveQuadratic = (a: number, b: number, c: number): number[] => {
	if (a === 0) {
		// Handle linear case
		if (b !== 0) {
			const t = -c / b;
			return t >= 0 && t <= 1 ? [t] : [];
		}
		return [];
	}
	const discriminant = b * b - 4 * a * c;
	if (discriminant < 0) return [];
	const sqrtDiscriminant = Math.sqrt(discriminant);
	return [
		(-b + sqrtDiscriminant) / (2 * a),
		(-b - sqrtDiscriminant) / (2 * a),
	].filter((t) => t >= 0 && t <= 1);
};

export const getBezierNodeIntersection = (
	node: Node,
	p0: Point,
	p1: Point,
	p2: Point,
): Point => {
	if (
		node.width == null ||
		node.height == null ||
		node.positionAbsolute == null ||
		node.positionAbsolute.x == null ||
		node.positionAbsolute.y == null
	) {
		console.error("Intersection Node is missing width, height, x or y");
		return { x: 0, y: 0 };
	}
	const { width, height, positionAbsolute } = node;
	const nodeLeft = positionAbsolute.x;
	const nodeRight = positionAbsolute.x + width;
	const nodeTop = positionAbsolute.y;
	const nodeBottom = positionAbsolute.y + height;

	const intersections: Point[] = [];

	// Check for intersections with the left and right sides
	const checkSideIntersection = (nodeX: number) => {
		const a = p0.x - 2 * p1.x + p2.x;
		const b = -2 * p0.x + 2 * p1.x;
		const c = p0.x - nodeX;

		solveQuadratic(a, b, c).forEach((t) => {
			const pt = bezierPoint(p0, p1, p2, t);
			if (pt.y >= nodeTop && pt.y <= nodeBottom) intersections.push(pt);
		});
	};

	checkSideIntersection(nodeLeft);
	checkSideIntersection(nodeRight);

	// Check for intersections with the top and bottom sides
	const checkTopBottomIntersection = (nodeY: number) => {
		const a = p0.y - 2 * p1.y + p2.y;
		const b = -2 * p0.y + 2 * p1.y;
		const c = p0.y - nodeY;

		solveQuadratic(a, b, c).forEach((t) => {
			const pt = bezierPoint(p0, p1, p2, t);
			if (pt.x >= nodeLeft && pt.x <= nodeRight) intersections.push(pt);
		});
	};

	checkTopBottomIntersection(nodeTop);
	checkTopBottomIntersection(nodeBottom);

	if (intersections.length > 0) {
		return intersections[0]; // Return the first valid intersection
	}
	return { x: 0, y: 0 };;
};

export const getEdgeId = ({ source, target }: Edge | Connection): string =>
	`${Date.now()}-${source}>${target}`;

// Custom logic to handle the connection
export const addEdge = (
	edgeParams: Edge | Connection,
	edges: Edge[],
): Edge[] => {
	if (!edgeParams.source || !edgeParams.target) {
		return edges;
	}

	let edge: Edge;
	if (isEdge(edgeParams)) {
		edge = { ...edgeParams };
	} else {
		edge = {
			...edgeParams,
			id: getEdgeId(edgeParams),
		} as Edge;
	}

	return edges.concat(edge);
};

//Base, Class, Abstract Class, Interface, Library, Method, Code Fragment
export const nodeTypes: NodeTypes = {
	startNode: StartNode,
	baseNode: BaseNode,
	classNode: ClassNode,
	abstractClassNode: AbstractClassNode,
	interfaceNode: InterfaceNode,
	libraryNode: LibraryNode,
	methodNode: MethodNode,
	codeFragmentNode: CodeFragmentNode,
};

export const edgeTypes: EdgeTypes = {
	baseRelationship: BaseRelationship,
	inheritanceRelationship: InheritanceRelationship,
	overridesRelationship: OverridesRelationship,
	methodRelationship: MethodRelationship,
	executionRelationship: ExecutionRelationship,
	dependencyRelationship: DependencyRelationship,
};
