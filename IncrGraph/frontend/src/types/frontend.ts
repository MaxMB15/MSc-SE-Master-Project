import { IGCNodeProps } from "@/IGCItems/nodes/BaseNode";
import { IGCRelationshipProps } from "@/IGCItems/relationships/BaseRelationship";
import { IGCViewProps } from "@/IGCItems/views/BaseView";
import { Node, Edge } from "reactflow";
import { FileNode } from "shared";

export interface Item {
	type: "Node" | "Edge";
	item: Node | Edge;
	id: string;
	name: string;
}

export class Point {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	static midpoint(p1: Point, p2: Point): Point {
		return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
	}
	static ZERO = new Point(0, 0);
}

export class Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	static fromNode(node: Node): Rectangle | null {
		if (
			node.positionAbsolute == null ||
			node.positionAbsolute.x == null ||
			node.positionAbsolute.y == null ||
			node.width == null ||
			node.height == null
		) {
			return null;
		}
		return new Rectangle(
			node.positionAbsolute.x,
			node.positionAbsolute.y,
			node.width,
			node.height,
		);
	}

	get left(): number {
		return this.x;
	}

	get right(): number {
		return this.x + this.width;
	}

	get top(): number {
		return this.y;
	}

	get bottom(): number {
		return this.y + this.height;
	}

	center(): { x: number; y: number } {
		return {
			x: this.x + this.width / 2,
			y: this.y + this.height / 2,
		};
	}
}

export interface CodeRunData {
	stdout: string;
	stderr: string;
	configuration: any;
	metrics: {
		executionTime: number;
		sessionId: string;
	};
}

export interface SessionData {
	configuration: any;
	executionPath: string[];
}

export interface TreeItemActionHandlers {
	onSelect?: (node: FileNode) => void;
	onRename?: (node: FileNode, newName: string) => void;
	onContextMenu?: (event: React.MouseEvent, node: FileNode) => void;
}
export interface TreeItemState {
	editing: string | null;
	setEditing: React.Dispatch<React.SetStateAction<string | null>>;
	expandedSet: Set<string>;
	setExpandedSet: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export interface RegistryComponent {
	NAME: string;
	COLOR: string;
	TYPE: "node" | "relationship" | "view";
	SETABLE?: boolean; // Default is false
}

export type ModuleComponentValues<T extends RegistryComponent> = {
	object: T;
	modulePath: string;
	enabled: boolean;
};
export type ModuleComponent<T extends RegistryComponent> = { [key: string]: ModuleComponentValues<T> };

export interface ModuleComponentStored {
    nodes: ModuleComponent<IGCNodeProps>;
    relationships: ModuleComponent<IGCRelationshipProps>;
    views: ModuleComponent<IGCViewProps>;
}