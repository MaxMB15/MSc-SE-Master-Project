import { applyEdgeChanges, Edge, EdgeChange, EdgeProps, Position } from "reactflow";
import React from "react";
import IGCRelationshipDisplay from "./IGCRelationshipDisplay";
import { LabelProps } from "@/types/frontend";
import { PartialExcept } from "@/utils/typeUtils";

type IGCRelationshipDataProps <T = {}> = T &{
    color: string;
    labelObj?: LabelProps;
    data?: T;
}
type RequiredEdgeProps = 'id' | 'source' | 'target';

export type IGCRelationshipProps = PartialExcept<EdgeProps<IGCRelationshipDataProps>, RequiredEdgeProps>;

abstract class IGCRelationship extends React.Component<EdgeProps<IGCRelationshipDataProps>> {
	edgeProps: EdgeProps<IGCRelationshipDataProps>;

    id: string;
    source: string;
    target:string;
    data: IGCRelationshipDataProps;
    selected: boolean;

    color: string;
    type: string;
    labelObj?: LabelProps;
    
	constructor(partialEdgeProps: IGCRelationshipProps, color: string, type: string, labelObj?: LabelProps) {
        const edgeProps = IGCRelationship.createDefaultEdgeProps(partialEdgeProps);
        super(edgeProps);
        this.edgeProps = edgeProps;

        this.id = edgeProps.id;
        this.source = edgeProps.source;
        this.target = edgeProps.target;
        this.data = {...edgeProps.data, color: color, labelObj:labelObj};
        this.selected = edgeProps.selected || false;

        this.color = color;
        this.type = type;
        this.labelObj = labelObj
	}

	public render() {
		return (
			<IGCRelationshipDisplay
				{...this.edgeProps}
                color={this.color}
                labelObj={this.labelObj}
			/>
		);
	}

    public toRFEdge(): Edge {
        return this;
    }

    // Create a new Edge id
    public static generateId(
        source: string,
        target: string,
        edges: IGCRelationship[],
        prefix = "",
    ): string {
        // Create an unused edge id
        let i = 0;
        let id = `${prefix}${i}-${source}>${target}`;
        while (edges.some((edge) => edge.id === id)) {
            i++;
            id = `${prefix}${i}-${source}>${target}`;
        }
        return id;
    };
    
    // Custom logic to handle the connection
    public static addEdge = (
        edge: IGCRelationship,
        edges: IGCRelationship[],
    ): IGCRelationship[] => {
        if (!edge.source || !edge.target) {
            return edges;
        }

        return edges.concat(edge);
    };

    public static createDefaultEdgeProps(partialEdgeProps: IGCRelationshipProps): EdgeProps<IGCRelationshipDataProps> {
        return {
            ...partialEdgeProps,
            id: partialEdgeProps.id,
            source: partialEdgeProps.source,
            target: partialEdgeProps.target,
            sourceX: partialEdgeProps.sourceX || 0,
            sourceY: partialEdgeProps.sourceY || 0,
            targetX: partialEdgeProps.targetX || 0,
            targetY: partialEdgeProps.targetY || 0,
            sourcePosition: partialEdgeProps.sourcePosition || Position.Right,
            targetPosition: partialEdgeProps.targetPosition || Position.Left,
        }
    }

    public static applyRelationshipChanges(changes: EdgeChange[], relationships: IGCRelationship[]) {
		return applyEdgeChanges(changes, relationships) as unknown as IGCRelationship[];
	}
}

export default IGCRelationship;
