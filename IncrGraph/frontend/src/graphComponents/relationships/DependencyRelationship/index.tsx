import "./DependencyRelationship.css";
import { STYLES } from "@/styles/constants";
import IGCRelationship, { IGCRelationshipProps } from "../IGCRelationship";
import { IGCCodeNode, IGCNode } from "@/graphComponents/nodes/IGCNode";
import { Definitions, Dependencies } from "shared";

interface DependencyEdge {
    source: string;
    target: string;
    dependencyFulfilled: string[]
}

class DependencyRelationship extends IGCRelationship {
	public static KEY = "DependencyRelationship";
	constructor(props: IGCRelationshipProps, label?: string) {
		const l = label || props.data?.labelObj?.label;
		super(
			props,
			STYLES.dependencyRelationshipColor,
            DependencyRelationship.KEY,
			l !== undefined
				? {
						label: l,
						labelRadius: 5,
				  }
				: undefined,
		);
	}

    
    public static createDependencyGraph(nodes: IGCNode[], edges: IGCRelationship[]) : IGCRelationship[] {
        /**
         * Assumes all nodes are at the latest code analysis
         */
    
        // Create a graph from the nodes dependencies and definitions
        const graph: DependencyEdge[] = [];
    
        // Create a mapping of every dependency and definitions
        const dependencyMap: { [key: string]: string[] } = {};
        const definitionsMap: { [key: string]: string[] } = {};
    
        // Go through every node and get the dependencies and definitions
        for(let node of nodes) {
            if(!(node instanceof IGCCodeNode)) {
                continue;
            }
                    for(const type of Object.keys(node.getDependencies()) as (keyof Dependencies)[]) {
                        for(const dependency of node.getDependencies()[type]) {
                            if(dependencyMap[dependency] === undefined) {
                                dependencyMap[dependency] = []
                            }
                            dependencyMap[dependency].push(node.id);
                        }
                    }
                    for(const type of Object.keys(node.getDefinitions()) as (keyof Definitions)[]) {
                        for(const definition of node.getDefinitions()[type]) {
                            if(definitionsMap[definition] === undefined) {
                                definitionsMap[definition] = []
                            }
                            definitionsMap[definition].push(node.id);
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
        const newEdges: IGCRelationship[] = [];
        for(let edge of graph) {
            const newId = IGCRelationship.generateId(edge.source, edge.target, [...newEdges, ...edges], "D");
            newEdges.push(
                new DependencyRelationship({
                    id: newId,
                    source: edge.source,
                    target: edge.target,
                }, edge.dependencyFulfilled.join(", "),)
            );
        }
        
        // Return the new edges
        return [...edges, ...newEdges];
    }
}

export default DependencyRelationship;
