export interface Empty {}

export interface TokenResponse {
	access: string;
	refresh: string;
}

export interface FileNode {
	name: string;
	type: "file" | "directory";
	children?: FileNode[];
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
    state: any;
    executionTime: number;
    sessionId: string;
}