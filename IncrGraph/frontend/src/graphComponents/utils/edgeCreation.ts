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

    // Create a graph from the nodes dependencies and definitions
    const graph: DependencyEdge[] = [];

    // Create a mapping of every dependency and definitions
    const dependencyMap: { [key: string]: string[] } = {};
    const definitionsMap: { [key: string]: string[] } = {};

    // Go through every node and get the dependencies and definitions
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
            if (node.data.definitions !== undefined) {
                for(const type of Object.keys(node.data.definitions)) {
                    for(const definition of node.data.definitions[type]) {
                        if(definitionsMap[definition] === undefined) {
                            definitionsMap[definition] = []
                        }
                        definitionsMap[definition].push(node.id);
                    }
                }
            }
        }
    };
    
    // Go through every dependency and create an edge to a definition
    const edgeMap: { [source: string]: { [target: string]: string[] } } = {};
    for (let dependency in dependencyMap) {
        if (definitionsMap[dependency] !== undefined) {
            for(let source of dependencyMap[dependency]) {
                for(let target of definitionsMap[dependency]) {
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
    const newEdges: IGCEdge[] = [];
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