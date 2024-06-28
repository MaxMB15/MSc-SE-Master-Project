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
