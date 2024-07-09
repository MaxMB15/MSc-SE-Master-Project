import { CodeExecutionRequest, CodeExecutionResponse } from "@/types/common";
import { UseAxiosRequestOptions } from "./requests";
import { CodeRunData } from "@/types/frontend";
import { set } from "lodash";

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
	runCodeSendRequest: (
		options: UseAxiosRequestOptions<CodeExecutionRequest>,
	) => Promise<CodeExecutionResponse>,
	code: string,
	nodeId: string,
	setRunCodeData: React.Dispatch<
		React.SetStateAction<Map<string, CodeRunData>>
	>,
	currentSessionId: string | null,
	setCurrentSessionId: (
		updater: (prev: string | null) => string | null,
	) => void,
	setSessions: (
		updater: (prev: Map<string, any>) => Map<string, any>,
	) => void,
): void => {
	runCodeSendRequest({
		method: "POST",
		data: {
			code,
			language: "python",
			sessionId: currentSessionId !== null ? currentSessionId : undefined,
		},
		route: "/api/code-handler/execute",
		useJWT: false,
	}).then((response: CodeExecutionResponse) => {
		setRunCodeData((prevData) =>
			prevData.set(nodeId, {
				stdout: response.output,
				stderr: response.error,
				configuration: response.state,
				metrics: {
					executionTime: response.executionTime,
					sessionId: response.sessionId,
				},
			}),
		);
		setSessions((prevSessions) =>
			prevSessions.set(response.sessionId, response.state),
		);
		setCurrentSessionId(() => response.sessionId);
	});
};
