import { EdgeProps, Position } from "reactflow";
import IGCEdgeDisplay from "./IGCEdgeDisplay";
import { LabelProps } from "@/types/frontend";

export interface IGCEdgeProps extends EdgeProps {
	id: string;
	source: string;
	target: string;
    backgroundColor: string;
	type: string;
    labelObj?: LabelProps;
}

export abstract class IGCEdge implements IGCEdgeProps {
	id: string;
	source: string;
	target: string;
    backgroundColor: string;
	type: string;
    labelObj?: LabelProps;

	sourcePosition: Position;
	targetPosition: Position;
	targetX: number;
	targetY: number;
	sourceX: number;
	sourceY: number;
    selected: boolean;
    label: string;

	constructor({
		id,
		source,
		target,
        backgroundColor,
		type,
        labelObj,
		...edgeProps
	}: IGCEdgeProps) {
		this.id = id;
		this.source = source;
		this.target = target;
        this.backgroundColor = backgroundColor;
		this.type = type;
        this.labelObj = labelObj;

        this.sourcePosition = Position.Left
        this.targetPosition = Position.Right
        this.targetX = 0;
        this.targetY = 0
        this.sourceX = 0;
        this.sourceY = 0;
        this.selected = false;
        this.label = labelObj?.label || "";

		// Assign the rest of the optional node properties with values if passed
		Object.assign(this, {
			...edgeProps,
		});
	}

    render() {
        return (<IGCEdgeDisplay id={this.id} source={this.source} target={this.target} color={this.backgroundColor} selected={this.selected} labelObj={this.labelObj} />);
    }
}

