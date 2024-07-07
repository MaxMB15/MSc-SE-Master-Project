import { Node, Edge } from "reactflow";

export interface Item {
    type: "Node" | "Edge";
    item: Node | Edge;
    id: string;
    name: string;
}