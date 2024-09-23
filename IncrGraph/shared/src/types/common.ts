export interface Empty {}

export interface TokenResponse {
	access: string;
	refresh: string;
}
export interface GetFileContentRequest {
	path: string;
}
export interface GetFileContentResponse {
	content: string;
    lastModified: number;
}
export interface SetFileContentRequest {
    path: string;
    content: string;
}
export interface FileNode {
	name: string;
	fullPath: string;
	type: "file" | "directory";
	children?: FileNode[];
}
export interface GetFileTreeRequest {
	path: string;
}
export interface GetFileTreeResponse {
	tree: FileNode[];
}

export interface SaveFilePathRequest {
	path: string;
	content: string;
}
export interface RenameRequest {
	oldPath: string;
	newPath: string;
}

export interface CopyRequest {
	sourcePath: string;
	destinationPath: string;
}

export interface DeleteRequest {
	targetPath: string;
}

export interface NewFileRequest {
	filePath: string;
	content?: string;
}

export interface NewDirectoryRequest {
	dirPath: string;
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
	metaNodeData?: any;
}

export interface CodeAnalysisRequest {
	code: string;
	language: string;
}

export interface Dependencies {
	variables: string[];
	functions: string[];
	classes: string[];
	modules: string[];
}
export interface Definitions {
	variables: string[];
	functions: string[];
	classes: string[];
}
export interface CodeAnalysisResponse {
	dependencies: Dependencies;
	new_definitions: Definitions;
}

export type Cache = CacheEntry[];
export interface CacheEntry {
	search_path: string;
	last_updated: string;
	files: string[];
    meta?: ModuleConfigurationData;
}
export interface ModuleConfigurationData {
    name: string;
}