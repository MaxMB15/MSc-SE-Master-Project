import { NodeProps, Position } from "reactflow";

import { IGCEdge } from "../edges/IGCEdge";
import { EditorDisplayNode, Point } from "@/types/frontend";
import { Analysis, Dependencies, Definitions } from "shared";
import { callAnalyze } from "@/requests";
import IGCNodeDisplay from "./IGCNodeDisplay";
import { runCode } from "@/utils/codeExecution";

export interface IGCNodeProps extends NodeProps{
	id: string;
	type: string;
    label: string;
    backgroundColor: string;
	position: Point;
}

export abstract class IGCNode implements IGCNodeProps {
	id: string;
	type: string;
    label: string;
	position: Point;
    backgroundColor: string;

    data: any;
    dragHandle?: string | undefined;
    selected: boolean;
    zIndex: number;
    isConnectable: boolean;
    xPos: number;
    yPos: number;
    dragging: boolean;
    targetPosition?: Position | undefined;
    sourcePosition?: Position | undefined;

	constructor({
		id,
		type,
        label,
		position,
        backgroundColor,
		...nodeProps
	}: IGCNodeProps) {
		this.id = id;
		this.type = type;
        this.label = label;
		this.position = position;
        this.backgroundColor = backgroundColor;

        this.selected = false;
        this.zIndex = 0;
        this.isConnectable = true;
        this.xPos = position.x;
        this.yPos = position.y;
        this.dragging = false;

		// Assign the rest of the optional node properties with values if passed
		Object.assign(this, {
			...nodeProps,
		});
	}

    public abstract editorDisplay(): EditorDisplayNode;

	// public static serialize(data: string): IGCNode => {
    //     return new IGCNode(JSON.parse(data));
    // };
	public abstract deserialize(): string;

	public abstract createRelationships(edges: IGCEdge[]): IGCEdge[];

    render() {
        return (<IGCNodeDisplay id={this.id} label={this.label} backgroundColor={this.backgroundColor} />);
    }
}

export interface IGCCodeNodeProps extends IGCNodeProps {
    code: string;
    analysis: Analysis;
}

export abstract class IGCCodeNode extends IGCNode implements IGCCodeNodeProps {
    code: string;
    analysis: Analysis;

	constructor({
		code,
		...restOfArgs
	}: IGCCodeNodeProps) {
        super(restOfArgs);
		this.code = code;
        this.analysis = new Analysis(Definitions.EMPTY, Dependencies.EMPTY, callAnalyze);
	}

    public editorDisplay = (): EditorDisplayNode => {
        return {
            useEditor: {code: this.code},
        }
    }

	// abstract serialize(edges: IGCEdge[]): IGCEdge[];
	public abstract deserialize(): string;

    public updateAnalysis = (): void => {
        this.analysis.update({code: this.code, language: "python"});
    }
    public getDefinitions = (): Definitions => {
        return this.analysis.definitions;
    }
    public getDependencies = (): Dependencies => {
        return this.analysis.dependencies;
    }


	abstract createRelationships(edges: IGCEdge[]): IGCEdge[];

    render() {
        return (<IGCNodeDisplay id={this.id} label={this.label} backgroundColor={this.backgroundColor} handleRun={() => runCode(this.code, this.id)}/>);
    }
}
