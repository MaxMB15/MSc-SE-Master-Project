import { Position, MarkerType, NodeTypes, EdgeTypes } from "reactflow";
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
    if(n.width == null || n.height == null || n.x == null || n.y == null) {
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

// export const createNodesAndEdges = () => {
// 	const nodes = [];
// 	const edges = [];
// 	const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

// 	nodes.push({ id: "target", data: { label: "Target" }, position: center });

// 	for (let i = 0; i < 8; i++) {
// 		const degrees = i * (360 / 8);
// 		const radians = degrees * (Math.PI / 180);
// 		const x = 250 * Math.cos(radians) + center.x;
// 		const y = 250 * Math.sin(radians) + center.y;

// 		nodes.push({
// 			id: `${i}`,
// 			data: { label: "Source" },
// 			position: { x, y },
// 		});

// 		edges.push({
// 			id: `edge-${i}`,
// 			target: "target",
// 			source: `${i}`,
// 			type: "baseNode",
// 			markerEnd: {
// 				type: MarkerType.Arrow,
// 			},
// 		});
// 	}

// 	return { nodes, edges };
// };

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
};
