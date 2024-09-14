import { Router, Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import {
	CodeAnalysisRequest,
	CodeAnalysisResponse,
	CodeExecutionRequest,
	createCustomLogger,
} from "shared";
import { spawn, execFile } from "child_process";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Logger
const logger = createCustomLogger("backend");

const checkPythonInstallation = (): Promise<string | null> => {
	const languageDir = path.join(__dirname, "../../../languages");
	return new Promise((resolve) => {
		const commands = [path.join(languageDir, "python/venv/bin/python")];
		console.log(`Commands to check: ${commands}`);
		let index = 0;

		const checkNext = () => {
			if (index >= commands.length) {
				resolve(null);
				return;
			}

			const command = commands[index];
			console.log(`Executing command: ${command} --version`);

			execFile(command, ["--version"], (error, stdout, stderr) => {
				if (error) {
					console.log(`Error executing command: ${error}`);
					console.log(`stderr: ${stderr}`);
					index++;
					checkNext();
				} else {
					console.log(`Python version output: ${stdout}`);
					resolve(commands[index]);
				}
			});
		};

		checkNext();
	});
};

router.post("/execute", async (req: Request, res: Response) => {
	const { code, language, projectPath, sessionId }: CodeExecutionRequest =
		req.body;

	if (!code) {
		logger.error("No code was provided in the request");
		return res.status(400).send({ error: "No code provided" });
	}
	if (!projectPath) {
		logger.error(
			"No project path (projectPath) was provided in the request",
		);
		return res.status(400).send({ error: "No path provided" });
	}

	// Currently only python is supported. Change this to support different languages
	if (language !== "python") {
		logger.error("Unsupported language", { language });
		return res.status(400).send({ error: "Unsupported language" });
	}

	const pythonPath = await checkPythonInstallation();
	if (!pythonPath) {
		logger.error("Python is not installed");
		return res.status(500).send({ error: "Python is not installed" });
	}

	const sessionDir = path.join(
		projectPath,
		".sessions",
		sessionId || uuidv4(),
	);
	if (!fs.existsSync(sessionDir)) {
		fs.mkdirSync(sessionDir, { recursive: true });
	}

	const stateFilePath = path.join(sessionDir, "state.pkl");
	const configFilePath = path.join(sessionDir, "configuration.json");
	const scriptFilePath = path.join(sessionDir, "script.py");

	const completeCode = `
import dill as IGC_RUN_VARIABLE_DILL
import json as IGC_RUN_VARIABLE_JSON
import os as IGC_RUN_VARIABLE_OS
import types as IGC_RUN_VARIABLE_TYPES

state = {}
config = {}

# Paths for temporary files
IGC_RUN_VARIABLE_stateFilePath = "${stateFilePath
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')}"
IGC_RUN_VARIABLE_configFilePath = "${configFilePath
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')}"

# Save the initial state to compare later
IGC_RUN_VARIABLE_initial_globals = set(globals().keys())

# Load initial state if it exists
if IGC_RUN_VARIABLE_OS.path.exists(IGC_RUN_VARIABLE_stateFilePath):
    IGC_RUN_VARIABLE_DILL.load_session(IGC_RUN_VARIABLE_stateFilePath)

# User code
${code}

# Capture the state of all variables
IGC_RUN_VARIABLE_global_items = list(globals().items())
config = {}

for IGC_RUN_VARIABLE_key, IGC_RUN_VARIABLE_value in IGC_RUN_VARIABLE_global_items:
    if IGC_RUN_VARIABLE_key not in IGC_RUN_VARIABLE_initial_globals and not IGC_RUN_VARIABLE_key.startswith('IGC_RUN_VARIABLE_'):
        if isinstance(IGC_RUN_VARIABLE_value, (int, float, str, bool, dict, list, tuple, set)):
            config[IGC_RUN_VARIABLE_key] = IGC_RUN_VARIABLE_value
        elif isinstance(IGC_RUN_VARIABLE_value, IGC_RUN_VARIABLE_TYPES.FunctionType):
            config[IGC_RUN_VARIABLE_key] = "<function>"
        elif isinstance(IGC_RUN_VARIABLE_value, type):
            config[IGC_RUN_VARIABLE_key] = "<class>"
        else:
            config[IGC_RUN_VARIABLE_key] = f"<{type(IGC_RUN_VARIABLE_value).__name__}>"

# Save the state for the next execution
IGC_RUN_VARIABLE_DILL.dump_session(IGC_RUN_VARIABLE_stateFilePath)

# Save the config to a separate JSON file
with open(IGC_RUN_VARIABLE_configFilePath, "w") as IGC_RUN_VARIABLE_configFile:
    IGC_RUN_VARIABLE_JSON.dump(config, IGC_RUN_VARIABLE_configFile, default=str)
`;

	fs.writeFileSync(scriptFilePath, completeCode);

	const startTime = process.hrtime();
	logger.info("Executing Python code", { sessionId, code });

	const pythonProcess = spawn(pythonPath, [scriptFilePath]);

	let stdout = "";
	let stderr = "";

	pythonProcess.stdout.on("data", (data) => {
		stdout += data.toString();
	});

	pythonProcess.stderr.on("data", (data) => {
		stderr += data.toString();
	});

	pythonProcess.on("close", async () => {
		const endTime = process.hrtime(startTime);
		const execTime = endTime[0] * 1000 + endTime[1] / 1000000; // Execution time in milliseconds

		// Get analysis data
		let metaNodeData: CodeAnalysisResponse;
        try{
            metaNodeData = await analyzeCode({ code, language });
        }
        catch (error) {
            logger.error("Error analyzing code", { error });
            res.status(500).send({ error: error });
            return;
        }

		// Get configuration data
		let config = {};
		try {
			if (fs.existsSync(configFilePath)) {
				config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
			} else {
				logger.error("Config file does not exist", { sessionId });
			}
		} catch (e) {
			logger.error(
				"Error reading config or combined result after execution",
				{ error: e },
			);
			console.log(e);
		}

		// Create the result
		const result = {
			output: stdout,
			error: stderr,
			executionTime: execTime,
			sessionId: path.basename(sessionDir),
			configuration: config,
			metaNodeData: metaNodeData,
		};

		// Log the result of execution
		if (stderr) {
			logger.error("Error executing Python code", {
				sessionId,
				error: stderr,
			});
		} else {
			logger.info("Python code executed successfully", {
				sessionId,
				result,
			});
		}

		// Clean up temporary script file but keep the state file
		fs.unlinkSync(scriptFilePath);

		return res.send(result);
	});
});
const analyzeCode = async ({
	code,
	language,
}: {
	code: string;
	language: string;
}): Promise<CodeAnalysisResponse> => {
    if (language !== "python") {
        console.error("Unsupported language", { language });
        throw new Error("Unsupported language");
    }

    const pythonPath = await checkPythonInstallation();
    if (!pythonPath) {
        console.error("Python is not installed");
        throw new Error("Python is not installed");
    }

    const analysisScriptPath = path.join(
        __dirname,
        "../scripts/python",
        "analyze_code.py"
    );

    return new Promise((resolve, reject) => {
        const pythonProcess = spawn(pythonPath, [analysisScriptPath]);

        let stdout = "";
        let stderr = "";

        pythonProcess.stdout.on("data", (data: Buffer) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on("data", (data: Buffer) => {
            stderr += data.toString();
        });

        pythonProcess.on("close", (code: number) => {
            if (code !== 0) {
                console.error("Error executing Python code", { error: stderr });
                reject(new Error(stderr));
                return;
            }

            try {
                const analysisResult = JSON.parse(stdout);
                resolve(analysisResult);
            } catch (e) {
                console.error("Error reading analysis result", { error: e });
                reject(new Error(`Error reading analysis result: ${e}`));
            }
        });

        if (pythonProcess.stdin) {
            pythonProcess.stdin.write(code);
            pythonProcess.stdin.end();
        } else {
            reject(new Error("Failed to write to Python process stdin"));
        }
    });
};

router.post("/analyze", async (req: Request, res: Response) => {
	const { code, language }: CodeAnalysisRequest = req.body;

	if (!code) {
		logger.error("No code provided in the request");
		return res.status(400).send({ error: "No code provided" });
	}

	if (language !== "python") {
		logger.error("Unsupported language", { language });
		return res.status(400).send({ error: "Unsupported language" });
	}

    try {
        const result = await analyzeCode({ code, language });
        res.send(result);
    }
    catch (error) {
        logger.error("Error analyzing code", { error });
        res.status(500).send({ error: error });
    }
});

export default router;
