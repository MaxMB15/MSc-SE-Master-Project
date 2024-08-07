import IGCRelationship from "@/graphComponents/relationships/IGCRelationship";
import { IGCNode } from "@/graphComponents/nodes/IGCNode";
import { ReactNode } from "react";
import { CodeAnalysisRequest, CodeAnalysisResponse, Definitions, Dependencies } from "shared";

export interface Item {
	type: "Node" | "Edge";
	item: IGCNode | IGCRelationship;
	id: string;
	name: string;
}

export class Point {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	static midpoint(p1: Point, p2: Point): Point {
		return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
	}
	static ZERO = new Point(0, 0);
}

export class Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

    get position(): Point {
        return new Point(this.x, this.y);
    }
    get size(): Point {
        return new Point(this.width, this.height);
    }

	get left(): number {
		return this.x;
	}

	get right(): number {
		return this.x + this.width;
	}

	get top(): number {
		return this.y;
	}

	get bottom(): number {
		return this.y + this.height;
	}

	center(): { x: number; y: number } {
		return {
			x: this.x + this.width / 2,
			y: this.y + this.height / 2,
		};
	}
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

export interface SessionData {
	configuration: any;
	executionPath: string[];
}

export interface UseEditor {
    code: string;
    language: string;
}
export interface EditorDisplayNode {
    beforeEditor?: ReactNode;
    useEditor?: UseEditor;
    afterEditor?: ReactNode;
}

export interface LabelProps {
    label: string;
    labelRadius: number;
}

export class Analysis {
    definitions: Definitions;
    dependencies: Dependencies;
    updateFunction: (request: CodeAnalysisRequest) => Promise<CodeAnalysisResponse>;

    constructor(updateFunction: (request: CodeAnalysisRequest) => Promise<CodeAnalysisResponse>) {
        this.definitions = {variables: [], functions: [], classes: []};
        this.dependencies = {variables: [], functions: [], classes: [], modules: []};
        this.updateFunction = updateFunction;
    }

    public update(request: CodeAnalysisRequest): Promise<CodeAnalysisResponse> {
        if (this.updateFunction !== undefined) {
            return this.updateFunction(request).then((newAnalysis) => {
                this.definitions = newAnalysis.definitions;
                this.dependencies = newAnalysis.dependencies;
                return newAnalysis;
            });
        }
        return Promise.reject("Update function not set");
    }

    // Convert newly defined variables in accordance to the scope
    public static setScope (
        metaNodeData: CodeAnalysisResponse,
        scope: string,
    ): CodeAnalysisResponse {
        if (metaNodeData.definitions !== undefined) {
            // Go through every new definition and set the scope
            Object.keys(metaNodeData.definitions).forEach((key) => {
                const typedKey = key as keyof typeof metaNodeData.definitions;
                metaNodeData.definitions[typedKey] = metaNodeData.definitions[
                    typedKey
                ].map((definition: string) => {
                    return `${scope}.${definition}`;
                });
            });
            // Add the scope to the dependencies
            if (metaNodeData.dependencies.classes.includes(scope) === false) {
                metaNodeData.dependencies.classes.push(scope);
            }
        }

        return metaNodeData;
    };
}