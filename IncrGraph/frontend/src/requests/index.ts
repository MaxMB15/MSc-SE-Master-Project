// This file is for creating requests to the backend API
import { sendAxiosRequest, UseAxiosRequestOptions } from "@/utils/requests";
import {
	CodeAnalysisRequest,
	CodeAnalysisResponse,
	CodeExecutionRequest,
	CodeExecutionResponse,
	FileNode,
	GetFileTreeRequest,
	CopyRequest,
	RenameRequest,
	Empty,
	NewDirectoryRequest,
	NewFileRequest,
	DeleteRequest,
} from "shared";

export const callAnalyze = (code: string) => {
	console.log("runAnalysis");
	const options: UseAxiosRequestOptions<CodeAnalysisRequest> = {
		method: "POST",
		route: "/api/code-handler/analyze",
		data: {
			code: code,
			language: "python",
		},
		useJWT: false,
	};

	return sendAxiosRequest<CodeAnalysisRequest, CodeAnalysisResponse>(options);
};

export const callExecute = (
	code: string,
	language: string,
	projectPath: string,
	sessionId: string | null,
) => {
	console.log("runAnalysis");
	const options: UseAxiosRequestOptions<CodeExecutionRequest> = {
		method: "POST",
		data: {
			code,
			language: language,
			projectPath: projectPath,
			sessionId: sessionId ? sessionId : undefined,
		},
		route: "/api/code-handler/execute",
		useJWT: false,
	};

	return sendAxiosRequest<CodeExecutionRequest, CodeExecutionResponse>(
		options,
	);
};

export const getFileTree = (projectDirectory: string) => {
	const options: UseAxiosRequestOptions<GetFileTreeRequest> = {
		method: "GET",
		route: "/api/file-explorer/file-tree",
		data: {
			path: projectDirectory,
		},
		useJWT: false,
	};

	return sendAxiosRequest<GetFileTreeRequest, FileNode[]>(options);
};
export const renameFileOrDirectory = (oldPath: string, newPath: string) => {
	const options: UseAxiosRequestOptions<RenameRequest> = {
		method: "PUT",
		route: "/api/file-explorer/rename",
		data: {
			oldPath: oldPath,
			newPath: newPath,
		},
		useJWT: false,
	};

	return sendAxiosRequest<RenameRequest, Empty>(options);
};

export const copyFileOrDirectory = (
	sourcePath: string,
	destinationPath: string,
) => {
	const options: UseAxiosRequestOptions<CopyRequest> = {
		method: "POST",
		route: "/api/file-explorer/copy",
		data: {
			sourcePath: sourcePath,
			destinationPath: destinationPath,
		},
		useJWT: false,
	};

	return sendAxiosRequest<CopyRequest, Empty>(options);
};

export const deleteFileOrDirectory = (targetPath: string) => {
	const options: UseAxiosRequestOptions<DeleteRequest> = {
		method: "DELETE",
		route: "/api/file-explorer/delete",
		data: {
			targetPath: targetPath,
		},
		useJWT: false,
	};

	return sendAxiosRequest<DeleteRequest, Empty>(options);
};

export const createNewFile = (filePath: string, content?: string) => {
	const options: UseAxiosRequestOptions<NewFileRequest> = {
		method: "POST",
		route: "/api/file-explorer/new-file",
		data: {
			filePath: filePath,
			content: content,
		},
		useJWT: false,
	};

	return sendAxiosRequest<NewFileRequest, Empty>(options);
};

export const createNewDirectory = (dirPath: string) => {
	const options: UseAxiosRequestOptions<NewDirectoryRequest> = {
		method: "POST",
		route: "/api/file-explorer/new-directory",
		data: {
			dirPath: dirPath,
		},
		useJWT: false,
	};

	return sendAxiosRequest<NewDirectoryRequest, Empty>(options);
};
