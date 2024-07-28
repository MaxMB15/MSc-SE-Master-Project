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
	sessionId?: string;
}
export interface CodeExecutionResponse {
	output: string;
	error: string;
	configuration: any;
	executionTime: number;
	sessionId: string;
	metaNodeData?: any;
}

export interface CodeAnalysisRequest {
	code: string;
	language: string;
}
export interface CodeAnalysisResponse {
	dependencies: string;
	new_definitions: string;
}
