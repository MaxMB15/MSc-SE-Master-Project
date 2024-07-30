import useStore from "@/store/store";
import { getEdgeId } from "./utils";
import { Edge } from "reactflow";
import { isCodeContainingNode } from "./types";

interface DependencyEdge {
    source: string;
    target: string;
    dependencyFulfilled: string[]
}

export const createDependencyGraph = () => {
    const { nodes, edges, setEdges } = useStore.getState();

    // Create a graph from the nodes dependencies and new_definitions
    const graph: DependencyEdge[] = [];

    // Create a mapping of every dependency and new_definitions
    const dependencyMap: { [key: string]: string[] } = {};
    const newDefinitionsMap: { [key: string]: string[] } = {};

    // Go through every node and get the dependencies and new_definitions
    for(let node of nodes) {
        if(!isCodeContainingNode(node)) {
            continue;
        }
        if (node.data !== undefined) {
            if (node.data.dependencies !== undefined) {
                for(const type of Object.keys(node.data.dependencies)) {
                    for(const dependency of node.data.dependencies[type]) {
                        if(dependencyMap[dependency] === undefined) {
                            dependencyMap[dependency] = []
                        }
                        dependencyMap[dependency].push(node.id);
                    }
                }
            }
            if (node.data.new_definitions !== undefined) {
                for(const type of Object.keys(node.data.new_definitions)) {
                    for(const new_definition of node.data.new_definitions[type]) {
                        if(newDefinitionsMap[new_definition] === undefined) {
                            newDefinitionsMap[new_definition] = []
                        }
                        newDefinitionsMap[new_definition].push(node.id);
                    }
                }
            }
        }
    };
    
    // Go through every dependency and create an edge to a definition
    const edgeMap: { [source: string]: { [target: string]: string[] } } = {};
    for (let dependency in dependencyMap) {
        if (newDefinitionsMap[dependency] !== undefined) {
            for(let source of dependencyMap[dependency]) {
                for(let target of newDefinitionsMap[dependency]) {
                    if(edgeMap[source] === undefined) {
                        edgeMap[source] = {}
                    }
                    if(edgeMap[source][target] === undefined) {
                        edgeMap[source][target] = []
                    }
                    edgeMap[source][target].push(dependency);
                }
            }
        }
    }
    
    // Convert the edgeMap to a graph
    for (let source in edgeMap) {
        for (let target in edgeMap[source]) {
            graph.push({
                source,
                target,
                dependencyFulfilled: edgeMap[source][target]
            });
        }
    }

    // Create the edges and push them to reactflow
    const newEdges: Edge[] = [];
    for(let edge of graph) {
        newEdges.push({
            id: getEdgeId(edge.source, edge.target, [...newEdges, ...edges], "D"),
            source: edge.source,
            target: edge.target,
            type: "dependencyRelationship",
            data: {label: edge.dependencyFulfilled.join(", ")},
        });
    }

    setEdges((prevEdges) => {
        return [...prevEdges.filter((e) => e.type !== "dependencyRelationship"), ...newEdges];
    });
}