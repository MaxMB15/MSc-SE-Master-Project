import { Node, Edge } from "reactflow";

export interface Item {
	type: "Node" | "Edge";
	item: Node | Edge;
	id: string;
	name: string;
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
