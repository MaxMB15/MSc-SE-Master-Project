import React from "react";
import { EdgeProps, EdgeTypes } from "reactflow";

interface IGCRelationship {
	KEY: string;
	display: (props: EdgeProps) => React.ReactNode;
}

interface EdgeRegistryItem {
	customEdge: IGCRelationship;
	compatibleEdge: React.FC<EdgeProps>; // EdgeProps compatible with React Flow
}
interface EdgeRegistryDictionary {
	[key: string]: EdgeRegistryItem;
}
const edgeRegistry: EdgeRegistryDictionary = {};

// Function to register the new edge
export const registerCustomEdge = (newEdge: IGCRelationship) => {
	// Create a compatible edge for ReactFlow
	const compatibleEdge: React.FC<EdgeProps> = (props: EdgeProps) => {
		return newEdge.display(props);
	};

	// Store the mapping in the registry
	edgeRegistry[newEdge.KEY] = {
		customEdge: newEdge,
		compatibleEdge: compatibleEdge,
	};
};

// Function to get all edges for React Flow
export const getEdgeTypes = (): EdgeTypes => {
    const edgeTypes: EdgeTypes = {};
    Object.keys(edgeRegistry).forEach((key) => {
        edgeTypes[key] = edgeRegistry[key].compatibleEdge;
    });
    return edgeTypes;
};

// Get Custom Edge from the registry
export const getCustomEdge = (type: string): IGCRelationship => {
	return edgeRegistry[type].customEdge;
};
