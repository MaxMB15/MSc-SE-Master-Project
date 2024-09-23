import useStore from "@/store/store";
import { getEdgeId, getIncomingNodes, getOutgoingNodes } from "./utils";
import { Node, Edge } from "reactflow";
import { isCodeContainingNode } from "./types";
import InheritanceRelationship from "../relationships/InheritanceRelationship";

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
        let edges = [...prevEdges.filter((e) => e.type !== undefined && !(["dependencyRelationship", InheritanceRelationship.key, "overridesRelationship"].includes(e.type))), ...newEdges];
        for(let node of useStore.getState().nodes) {
            edges = detectRelationships(node, edges);
        }
        return edges;
    });
}

// Detects override relationships and inheritance relationships
const detectRelationships = (node: Node, edges: Edge[]): Edge[] => {
	edges.push(...detectInheritanceRelationships(node, edges));
	edges.push(...detectOverrideRelationships(node, edges));
	return edges;
};
const detectOverrideRelationships = (node: Node, edges: Edge[]): Edge[] => {
	/** Override Relationships are detected by if the following path exists:
	 * Method Node -> (Method relationship) -> Class Node -> (Inheritance relationship) -> Class Node <- (Method relationship) <- Method Node (with the same name)
	 */
    const overrideRelationships: Edge[] = [];

	if (node.type === "methodNode" && node.data !== undefined && node.data.new_definitions !== undefined) {
        const methodDefinitions = node.data.new_definitions.functions.filter((f: string) => f.includes(".")).map((f: string) => f.split(".")[1]);
        // Get the classes that are attached to the method node
		const classNodes = getOutgoingNodes(
			node.id,
			useStore.getState().nodes,
			edges,
			(n) => {
				const nodeType = n.type;
				return nodeType === undefined
					? false
					: nodeType.toLowerCase().includes("class");
			},
            (e) => {
				const edgeType = e.type;
				return edgeType === undefined
					? false
					: edgeType === "methodRelationship";
			},
		);

        // Get the class nodes that are attached to the class nodes from above through interface relationships
        for( let cn of classNodes) {
            const classNodes2 = getOutgoingNodes(
                cn.id,
                useStore.getState().nodes,
                edges,
                (n) => {
                    const nodeType = n.type;
                    return nodeType === undefined
                        ? false
                        : nodeType.toLowerCase().includes("class");
                },
                (e) => {
                    const edgeType = e.type;
                    return edgeType === undefined
                        ? false
                        : edgeType === InheritanceRelationship.key;
                },
            );

            // Get the method nodes that are attached to the class nodes from above through method relationships
            for(let cn2 of classNodes2) {
                const methodNodes = getIncomingNodes(
                    cn2.id,
                    useStore.getState().nodes,
                    edges,
                    (n) => {
                        return n.type === "methodNode";
                    },
                    (e) => {
                        return e.type === "methodRelationship"
                    },
                );

                // Check if the method node has the same name as the method node from the first step
                for(let mn of methodNodes) {
                    if(mn.data !== undefined && mn.data.new_definitions !== undefined) {
                        const methodDefinitions2 = mn.data.new_definitions.functions.filter((f: string) => f.includes(".")).map((f: string) => f.split(".")[1]);;
                        for(let mdef of methodDefinitions) {
                            for(let mdef2 of methodDefinitions2) {
                                if(mdef === mdef2) {
                                    overrideRelationships.push({
                                        id: getEdgeId(node.id, mn.id, edges),
                                        source: node.id,
                                        target: mn.id,
                                        type: "overridesRelationship",
                                        data: {label: mdef},
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

	}
	return overrideRelationships;
};
const detectInheritanceRelationships = (node: Node, edges: Edge[]): Edge[] => {
	// Inheritance relationships are detected by the class node having a class dependency
    const inheritanceEdges: Edge[] = [];
    const nodeType = node.type;
    if (nodeType !== undefined && nodeType.toLowerCase().includes("class")) {
        if(node.data !== undefined && node.data.dependencies !== undefined) {
            const classDependencies = node.data.dependencies.variables.filter((v: string) => v[0] === v[0].toUpperCase());
            if (classDependencies === undefined) {
                return [];
            }
            const classNodes = getOutgoingNodes(
                node.id,
                useStore.getState().nodes,
                edges,
                (n) => {
                    const nodeType = n.type;
                    return nodeType === undefined
                        ? false
                        : nodeType.toLowerCase().includes("class");
                },
                (e) => {
                    const edgeType = e.type;
                    return edgeType === undefined
                        ? false
                        : edgeType === "dependencyRelationship";
                },
            );
            for (let cn of classNodes) {
                if(cn.data !== undefined && cn.data.new_definitions !== undefined) {
                    const classDefinitions = cn.data.new_definitions.classes;
                    if (!classDefinitions) {
                        continue;
                    }
                    for (let cdep of classDependencies) {
                        for (let cdef of classDefinitions) {
                            if(cdep === cdef) {
                                inheritanceEdges.push({
                                    id: getEdgeId(node.id, cn.id, edges),
                                    source: node.id,
                                    target: cn.id,
                                    type: InheritanceRelationship.key,
                                    data: {label: cdep},
                                });
                            }
                        }
                    }
                }
            }
        }
	}
	return inheritanceEdges;
};