import { Node, Edge } from "reactflow";

export interface Empty {}

export interface TokenResponse {
	access: string;
	refresh: string;
}

export interface FileNode {
	name: string;
	type: "file" | "directory";
	children?: FileNode[];
}

export interface SaveFilePathRequest {
	path: string;
	content: string;
}

export interface Item {
    type: "Node" | "Edge";
    item: Node | Edge;
    id: string;
    name: string;
}