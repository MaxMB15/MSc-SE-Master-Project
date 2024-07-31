export interface Empty {}

export interface TokenResponse {
	access: string;
	refresh: string;
}

export interface FileNode {
	name: string;
    fullPath: string;
	type: "file" | "directory";
	children?: FileNode[];
}
export interface GetDirectoryStructureRequest {
	path?: string;
}

export interface SaveFilePathRequest {
	path: string;
	content: string;
}
export interface CodeExecutionRequest {
	code: string;
	language: string;
    projectPath: string;
	sessionId?: string;
}
export interface CodeExecutionResponse {
	output: string;
	error: string;
	configuration: any;
	executionTime: number;
	sessionId: string;
	metaNodeData?: Analysis;
}

export interface CodeAnalysisRequest {
	code: string;
	language: string;
}
export class Dependencies {
    variables: string[];
    functions: string[];
    classes: string[];
    modules: string[];

    constructor(variables: string[], functions: string[], classes: string[], modules: string[]) {
        this.variables = variables;
        this.functions = functions;
        this.classes = classes;
        this.modules = modules;
    }

    static EMPTY: Dependencies = new Dependencies([], [], [], []);

}
export class Definitions {
    variables: string[];
    functions: string[];
    classes: string[];

    constructor(variables: string[], functions: string[], classes: string[]) {
        this.variables = variables;
        this.functions = functions;
        this.classes = classes;
    }

    static EMPTY: Definitions = new Definitions([], [], []);
}
export class Analysis {
    definitions: Definitions;
    dependencies: Dependencies;
    updateFunction?: (request: CodeAnalysisRequest) => Promise<CodeAnalysisResponse>;

    constructor(definitions?: Definitions, dependencies?: Dependencies, updateFunction?: (request: CodeAnalysisRequest) => Promise<CodeAnalysisResponse>) {
        this.definitions = definitions || Definitions.EMPTY;
        this.dependencies = dependencies || Dependencies.EMPTY;
        this.updateFunction = updateFunction;
    }

    public update(request: CodeAnalysisRequest): void {
        if (this.updateFunction !== undefined) {
            this.updateFunction(request).then((newAnalysis) => {
                this.definitions = newAnalysis.definitions;
                this.dependencies = newAnalysis.dependencies;
            });
        }
    }

    static EMPTY: Analysis = new Analysis(Definitions.EMPTY, Dependencies.EMPTY);
}

export type CodeAnalysisResponse = Analysis;
