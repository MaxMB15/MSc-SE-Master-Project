import { Router, Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import { createCustomLogger } from "shared";
import { spawn, execFile } from "child_process";
import os from "os";
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

	const stateFilePath = path.join(sessionDir, "state.pkl");
	const configFilePath = path.join(sessionDir, "configuration.json");
	const scriptFilePath = path.join(sessionDir, "script.py");
	const codeFilePath = path.join(sessionDir, "code.py");
	const metaNodeDataPath = path.join(sessionDir, "metaNodeData.json");

	fs.writeFileSync(codeFilePath, code);

	const completeCode = `
import dill as IGC_RUN_VARIABLE_DILL
import json as IGC_RUN_VARIABLE_JSON
import os as IGC_RUN_VARIABLE_OS
import types as IGC_RUN_VARIABLE_TYPES
import ast as IGC_RUN_VARIABLE_AST
import builtins as IGC_RUN_VARIABLE_BUILTINS

state = {}
config = {}

# Paths for temporary files
IGC_RUN_VARIABLE_stateFilePath = "${stateFilePath.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
IGC_RUN_VARIABLE_configFilePath = "${configFilePath.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
IGC_RUN_VARIABLE_metaNodeDataPath = "${metaNodeDataPath.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
IGC_RUN_VARIABLE_codeFilePath = "${codeFilePath.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"

# Read the code from the code file
IGC_RUN_VARIABLE_code = ""
with open(IGC_RUN_VARIABLE_codeFilePath, "r") as IGC_RUN_VARIABLE_codeFile:
    IGC_RUN_VARIABLE_code = IGC_RUN_VARIABLE_codeFile.read()

# Analysis function
def IGC_RUN_VARIABLE_analyze_code(code):
    # Parse the code into an AST
    tree = IGC_RUN_VARIABLE_AST.parse(code)
    
    # Initialize sets to keep track of the variables, functions, classes, and modules
    dependencies = {
        'variables': set(),
        'functions': set(),
        'classes': set(),
        'modules': set()
    }
    new_definitions = {
        'variables': set(),
        'functions': set(),
        'classes': set()
    }
    both_dependency_and_new_definition = {
        'variables': set(),
        'functions': set(),
        'classes': set()
    }

    class DependencyVisitor(IGC_RUN_VARIABLE_AST.NodeVisitor):
        def __init__(self):
            super().__init__()
            self.current_scope = [set()]

        def visit_Name(self, node):
            if isinstance(node.ctx, IGC_RUN_VARIABLE_AST.Load):
                # Add variable to dependencies if it's being loaded (i.e., used)
                if node.id not in dir(IGC_RUN_VARIABLE_BUILTINS) and node.id not in new_definitions['variables']:  # Exclude built-in functions and variables
                    dependencies['variables'].add(node.id)
            elif isinstance(node.ctx, IGC_RUN_VARIABLE_AST.Store):
                # Check if the variable is already a dependency, if so, it's both
                if node.id in dependencies['variables']:
                    both_dependency_and_new_definition['variables'].add(node.id)
                # Add variable to new_definitions if it's being stored (i.e., defined)
                new_definitions['variables'].add(node.id)
                for scope in reversed(self.current_scope):
                    if node.id in scope:
                        break
                    scope.add(node.id)
        
        def visit_FunctionDef(self, node):
            # Add function name to new_definitions
            new_definitions['functions'].add(node.name)
            args = {arg.arg for arg in node.args.args}
            self.current_scope.append(args)
            self.generic_visit(node)
            self.current_scope.pop()
        
        def visit_ClassDef(self, node):
            # Add class name to new_definitions
            new_definitions['classes'].add(node.name)
            self.current_scope[-1].add(node.name)
            self.generic_visit(node)
        
        def visit_Import(self, node):
            for alias in node.names:
                dependencies['modules'].add(alias.name.split('.')[0])
        
        def visit_ImportFrom(self, node):
            dependencies['modules'].add(node.module.split('.')[0])
        
        def visit_Assign(self, node):
            # Visit assigned values first to capture dependencies
            self.visit(node.value)
            for target in node.targets:
                self.visit(target)
        
        def visit_AugAssign(self, node):
            # Visit augmented assignments
            self.visit(node.value)
            self.visit(node.target)

    DependencyVisitor().visit(tree)
    
    # Identify classes from dependencies
    def is_class(name):
        # Assuming a class starts with a capital letter for this example
        return name[0].isupper()

    dependencies['classes'].update({var for var in dependencies['variables'] if is_class(var)})
    dependencies['variables'].difference_update(dependencies['classes'])

    # Remove any variables, functions, and classes defined in the code from the dependencies set
    dependencies['variables'].difference_update(new_definitions['variables'])
    dependencies['functions'].difference_update(new_definitions['functions'])
    dependencies['classes'].difference_update(new_definitions['classes'])

    # Add back variables that are both dependencies and definitions
    dependencies['variables'].update(both_dependency_and_new_definition['variables'])

    # Convert sets to lists for JSON serialization
    dependencies = {k: list(v) for k, v in dependencies.items()}
    new_definitions = {k: list(v) for k, v in new_definitions.items()}

    return {
        'dependencies': dependencies,
        'new_definitions': new_definitions
    }

IGC_RUN_VARIABLE_metaNodeData = IGC_RUN_VARIABLE_analyze_code(IGC_RUN_VARIABLE_code)

# Write the combined results to a JSON file
with open(IGC_RUN_VARIABLE_metaNodeDataPath, 'w') as IGC_RUN_VARIABLE_metaFile:
    json_data = IGC_RUN_VARIABLE_JSON.dumps(IGC_RUN_VARIABLE_metaNodeData, default=str)
    IGC_RUN_VARIABLE_metaFile.write(json_data)
    IGC_RUN_VARIABLE_metaFile.flush()
    IGC_RUN_VARIABLE_OS.fsync(IGC_RUN_VARIABLE_metaFile.fileno())

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

		let config = {};
		let metaNodeData = {};

		try {
			if (fs.existsSync(configFilePath)) {
				config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
			} else {
				logger.error("Config file does not exist", { sessionId });
			}

			if (fs.existsSync(metaNodeDataPath)) {
				console.log("Reading metaNodeDataPath");
				const text = fs.readFileSync(metaNodeDataPath, "utf8");
				console.log(text);
				console.log("Parsing metaNodeDataPath");
				metaNodeData = JSON.parse(text);
				console.log(metaNodeData);
			} else {
				logger.error("Combined result file does not exist", {
					sessionId,
				});
			}
		} catch (e) {
			logger.error(
				"Error reading config or combined result after execution",
				{ error: e },
			);
			console.log(e);
		}

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
		fs.unlinkSync(codeFilePath);
		fs.unlinkSync(scriptFilePath);

		return res.send(result);
	});
});

router.post("/analyze", async (req: Request, res: Response) => {
	const { code, language } = req.body;

	if (!code) {
		logger.error("No code provided in the request");
		return res.status(400).send({ error: "No code provided" });
	}

	if (language !== "python") {
		logger.error("Unsupported language", { language });
		return res.status(400).send({ error: "Unsupported language" });
	}

	const tmpDir = os.tmpdir();
	const codeFilePath = path.join(tmpDir, "code.py");
	const analysisFilePath = path.join(tmpDir, "analysis.json");

	fs.writeFileSync(codeFilePath, code);

	const analysisCode = `
import ast as IGC_RUN_VARIABLE_AST
import json as IGC_RUN_VARIABLE_JSON
import builtins as IGC_RUN_VARIABLE_BUILTINS
import os as IGC_RUN_VARIABLE_OS

# Analysis function
def IGC_RUN_VARIABLE_analyze_code(code):
    # Parse the code into an AST
    tree = IGC_RUN_VARIABLE_AST.parse(code)
    
    # Initialize sets to keep track of the variables, functions, classes, and modules
    dependencies = {
        'variables': set(),
        'functions': set(),
        'classes': set(),
        'modules': set()
    }
    new_definitions = {
        'variables': set(),
        'functions': set(),
        'classes': set()
    }
    both_dependency_and_new_definition = {
        'variables': set(),
        'functions': set(),
        'classes': set()
    }

    class DependencyVisitor(IGC_RUN_VARIABLE_AST.NodeVisitor):
        def __init__(self):
            super().__init__()
            self.current_scope = [set()]

        def visit_Name(self, node):
            if isinstance(node.ctx, IGC_RUN_VARIABLE_AST.Load):
                # Add variable to dependencies if it's being loaded (i.e., used)
                if node.id not in dir(IGC_RUN_VARIABLE_BUILTINS) and node.id not in new_definitions['variables']:  # Exclude built-in functions and variables
                    dependencies['variables'].add(node.id)
            elif isinstance(node.ctx, IGC_RUN_VARIABLE_AST.Store):
                # Check if the variable is already a dependency, if so, it's both
                if node.id in dependencies['variables']:
                    both_dependency_and_new_definition['variables'].add(node.id)
                # Add variable to new_definitions if it's being stored (i.e., defined)
                new_definitions['variables'].add(node.id)
                for scope in reversed(self.current_scope):
                    if node.id in scope:
                        break
                    scope.add(node.id)
        
        def visit_FunctionDef(self, node):
            # Add function name to new_definitions
            new_definitions['functions'].add(node.name)
            args = {arg.arg for arg in node.args.args}
            self.current_scope.append(args)
            self.generic_visit(node)
            self.current_scope.pop()
        
        def visit_ClassDef(self, node):
            # Add class name to new_definitions
            new_definitions['classes'].add(node.name)
            self.current_scope[-1].add(node.name)
            self.generic_visit(node)
        
        def visit_Import(self, node):
            for alias in node.names:
                dependencies['modules'].add(alias.name.split('.')[0])
        
        def visit_ImportFrom(self, node):
            dependencies['modules'].add(node.module.split('.')[0])
        
        def visit_Assign(self, node):
            # Visit assigned values first to capture dependencies
            self.visit(node.value)
            for target in node.targets:
                self.visit(target)
        
        def visit_AugAssign(self, node):
            # Visit augmented assignments
            self.visit(node.value)
            self.visit(node.target)

    DependencyVisitor().visit(tree)
    
    # Identify classes from dependencies
    def is_class(name):
        # Assuming a class starts with a capital letter for this example
        return name[0].isupper()

    dependencies['classes'].update({var for var in dependencies['variables'] if is_class(var)})
    dependencies['variables'].difference_update(dependencies['classes'])

    # Remove any variables, functions, and classes defined in the code from the dependencies set
    dependencies['variables'].difference_update(new_definitions['variables'])
    dependencies['functions'].difference_update(new_definitions['functions'])
    dependencies['classes'].difference_update(new_definitions['classes'])

    # Add back variables that are both dependencies and definitions
    dependencies['variables'].update(both_dependency_and_new_definition['variables'])

    # Convert sets to lists for JSON serialization
    dependencies = {k: list(v) for k, v in dependencies.items()}
    new_definitions = {k: list(v) for k, v in new_definitions.items()}

    return {
        'dependencies': dependencies,
        'new_definitions': new_definitions
    }

IGC_RUN_VARIABLE_code = ""
with open("${codeFilePath.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}", "r") as IGC_RUN_VARIABLE_codeFile:
    IGC_RUN_VARIABLE_code = IGC_RUN_VARIABLE_codeFile.read()

IGC_RUN_VARIABLE_metaNodeData = IGC_RUN_VARIABLE_analyze_code(IGC_RUN_VARIABLE_code)

with open("${analysisFilePath.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}", 'w') as IGC_RUN_VARIABLE_analysisFile:
    json_data = IGC_RUN_VARIABLE_JSON.dumps(IGC_RUN_VARIABLE_metaNodeData, default=str)
    IGC_RUN_VARIABLE_analysisFile.write(json_data)
    IGC_RUN_VARIABLE_analysisFile.flush()
    IGC_RUN_VARIABLE_OS.fsync(IGC_RUN_VARIABLE_analysisFile.fileno())
`;

	const analysisScriptPath = path.join(tmpDir, "analysis_script.py");
	fs.writeFileSync(analysisScriptPath, analysisCode);

	const pythonPath = await checkPythonInstallation();
	if (!pythonPath) {
		logger.error("Python is not installed");
		return res.status(500).send({ error: "Python is not installed" });
	}

	const pythonProcess = spawn(pythonPath, [analysisScriptPath]);

	let stdout = "";
	let stderr = "";

	pythonProcess.stdout.on("data", (data) => {
		stdout += data.toString();
	});

	pythonProcess.stderr.on("data", (data) => {
		stderr += data.toString();
        console.log(stderr);
	});

	pythonProcess.on("close", async () => {
		if (stderr) {
			logger.error("Error executing Python code", {
				error: stderr,
			});
			return res.status(500).send({ error: stderr });
		}

		let analysisResult = {};
		try {
			if (fs.existsSync(analysisFilePath)) {
				analysisResult = JSON.parse(fs.readFileSync(analysisFilePath, "utf8"));
			} else {
				logger.error("Analysis file does not exist");
			}
		} catch (e) {
			logger.error("Error reading analysis result", { error: e });
			return res.status(500).send({ error: e });
		}

		return res.send(analysisResult);
	});
});

export default router;
