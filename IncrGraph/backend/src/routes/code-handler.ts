import { Router, Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import { logger } from "../utils/logger";
import { spawn, exec } from "child_process";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const checkPythonInstallation = (): Promise<string | null> => {
	return new Promise((resolve) => {
		const commands = ["python3", "python"];
		let index = 0;

		const checkNext = () => {
			if (index >= commands.length) {
				resolve(null);
				return;
			}

			exec(`${commands[index]} --version`, (error) => {
				if (error) {
					index++;
					checkNext();
				} else {
					resolve(commands[index]);
				}
			});
		};

		checkNext();
	});
};

router.post("/execute", async (req: Request, res: Response) => {
	const { code, language, sessionId } = req.body;

	if (!code) {
		logger.error("No code provided in the request");
		return res.status(400).send({ error: "No code provided" });
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
		__dirname,
		"../../../../content",
		".sessions",
		sessionId || uuidv4(),
	);
	if (!fs.existsSync(sessionDir)) {
		fs.mkdirSync(sessionDir, { recursive: true });
	}

	const stateFilePath = path.join(sessionDir, "state.json");
	const scriptFilePath = path.join(sessionDir, "temp.py");

	let initialState = {};

	if (fs.existsSync(stateFilePath)) {
		try {
			initialState = JSON.parse(fs.readFileSync(stateFilePath, "utf8"));
		} catch (e) {
			logger.error("Error reading initial state", { error: e });
		}
	}

	const completeCode = `
# Load initial state
_state = ${JSON.stringify(initialState)}
globals().update(_state)

# User code
${code}

# Capture the state of all variables
_state = {key: value for key, value in globals().items() if not key.startswith('_')}
def capture_state():
    import json
    with open("${stateFilePath
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')}", 'w') as f:
        json.dump(_state, f)
capture_state()
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

	pythonProcess.on("close", () => {
		const endTime = process.hrtime(startTime);
		const execTime = endTime[0] * 1000 + endTime[1] / 1000000; // Execution time in milliseconds

		let state = {};

		try {
			if (fs.existsSync(stateFilePath)) {
				state = JSON.parse(fs.readFileSync(stateFilePath, "utf8"));
			} else {
				logger.error("State file does not exist", { sessionId });
			}
		} catch (e) {
			logger.error("Error reading state after execution", { error: e });
		}

		const result = {
			output: stdout,
			error: stderr,
			state,
			executionTime: execTime,
			sessionId: path.basename(sessionDir),
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

export default router;
