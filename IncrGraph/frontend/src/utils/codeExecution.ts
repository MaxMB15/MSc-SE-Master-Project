import { CodeExecutionRequest, CodeExecutionResponse } from "@/types/common";
import { UseAxiosRequestOptions } from "./requests";

// export const runCodeAnalysis = (
// 	runCodeSendRequest: (options: UseAxiosRequestOptions<CodeExecutionRequest>) => Promise<CodeExecutionResponse>,
// 	code: string,
// ) => {
//     runCodeSendRequest({
//         method: "POST",
//         data: { code, language: "python"},
//         route: "/api/file-explorer/file-content",
//         useJWT: false,
//     }).then((response: CodeExecutionResponse) => {
//         console.log(response)
//     });
// };

export const runCode = (
	runCodeSendRequest: (options: UseAxiosRequestOptions<CodeExecutionRequest>) => Promise<CodeExecutionResponse>,
	code: string,
) => {
    runCodeSendRequest({
        method: "POST",
        data: { code, language: "python", sessionId: "e5733cd1-6a12-453c-8427-7c0a86564eb2"},
        route: "/api/code-handler/execute",
        useJWT: false,
    }).then((response: CodeExecutionResponse) => {
        console.log(response)
    });
};
