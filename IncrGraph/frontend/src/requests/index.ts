// This file is for creating requests to the backend API
import { sendAxiosRequest, UseAxiosRequestOptions } from "@/utils/requests";
import { CodeAnalysisRequest, CodeAnalysisResponse, CodeExecutionRequest, CodeExecutionResponse } from "shared";

export const callAnalyze = (request: CodeAnalysisRequest) => {
    console.log("runAnalysis");
    const options: UseAxiosRequestOptions<CodeAnalysisRequest> = {
        method: "POST",
        route: "/api/code-handler/analyze",
        data: {
            code: request.code,
            language: request.language,
        },
        useJWT: false,
    };

    return sendAxiosRequest<CodeAnalysisRequest, CodeAnalysisResponse>(options);
}

export const callExecute = (code: string, language: string, projectPath: string, sessionId: string | null) => {
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

    return sendAxiosRequest<CodeExecutionRequest, CodeExecutionResponse>(options);
}