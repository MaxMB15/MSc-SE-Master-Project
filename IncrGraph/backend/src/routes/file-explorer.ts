import { Router, Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import { createCustomLogger } from "shared";
import { FileNode } from "shared";

const router = Router();

// Logger
const logger = createCustomLogger("backend");

// Helper function to validate file paths
const validatePath = (filePath: string, res: Response): boolean => {
	if (!filePath) {
		res.status(400).send("Path parameter is required");
		return false;
	}
	if (!fs.existsSync(filePath)) {
		res.status(400).send("Invalid path");
		return false;
	}
	return true;
};

// Get directory structure
const getDirectoryStructure = (dirPath: string): FileNode[] => {
	const files = fs.readdirSync(dirPath);

	return files.map((file) => {
		const filePath = path.join(dirPath, file);
		const isDirectory = fs.lstatSync(filePath).isDirectory();

		return {
			name: file,
			fullPath: filePath,
			type: isDirectory ? "directory" : "file",
			children: isDirectory ? getDirectoryStructure(filePath) : [],
		};
	});
};

// Get directory structure endpoint
router.get("/file-tree", (req: Request, res: Response) => {
	try {
		const requestedPath = req.query.path as string;
		if (!validatePath(requestedPath, res)) return;

		if (!fs.lstatSync(requestedPath).isDirectory()) {
			res.status(400).send("Invalid directory path");
			return;
		}

		const directoryStructure = getDirectoryStructure(requestedPath);
		res.json(directoryStructure);
	} catch (error) {
		logger.error("Failed to get directory structure", { error });
		res.status(500).send("Internal Server Error");
	}
});

// Get file content endpoint
router.get("/file-content", async (req: Request, res: Response) => {
	const filePath = req.query.path as string;

	try {
		if (!validatePath(filePath, res)) return;

		if (fs.lstatSync(filePath).isDirectory()) {
			res.status(400).send("Invalid file path");
			return;
		}

		const fileContent = await fs.promises.readFile(filePath, "utf-8");
		const stats = await fs.promises.stat(filePath);
		const lastModified = stats.mtimeMs; // Get last modified timestamp in milliseconds

		res.json({ content: fileContent, lastModified: lastModified });
	} catch (error) {
		logger.error("Failed to read file", { error });
		res.status(500).send("Internal Server Error");
	}
});

// Save file content endpoint
router.post("/file-content", async (req: Request, res: Response) => {
	const { path: filePath, content } = req.body as {
		path: string;
		content: string;
	};

	try {
		if (!validatePath(filePath, res)) return;

		if (fs.lstatSync(filePath).isDirectory()) {
			res.status(400).send("Invalid file path");
			return;
		}

		await fs.promises.writeFile(filePath, content, "utf8");
		logger.info(
			`Successfully wrote file (${filePath}) with content: ${content}`,
		);
		res.status(200).send("File saved successfully");
	} catch (error) {
		logger.error("Failed to save file", { error });
		res.status(500).send("Error saving file");
	}
});

// Rename file or directory
router.put("/rename", async (req: Request, res: Response) => {
	const { oldPath, newPath } = req.body as {
		oldPath: string;
		newPath: string;
	};

	try {
		if (!validatePath(oldPath, res) || !newPath) return;

		await fs.rename(oldPath, newPath);
		logger.info(`Renamed ${oldPath} to ${newPath}`);
		res.status(200).send("Renamed successfully");
	} catch (error) {
		logger.error("Failed to rename", { error });
		res.status(500).send("Internal Server Error");
	}
});

// Copy file or directory
router.post("/copy", async (req: Request, res: Response) => {
	const { sourcePath, destinationPath } = req.body as {
		sourcePath: string;
		destinationPath: string;
	};

	try {
		if (!validatePath(sourcePath, res) || !destinationPath) return;

		await fs.copy(sourcePath, destinationPath);
		logger.info(`Copied ${sourcePath} to ${destinationPath}`);
		res.status(200).send("Copied successfully");
	} catch (error) {
		logger.error("Failed to copy", { error });
		res.status(500).send("Internal Server Error");
	}
});

// Delete file or directory
router.delete("/delete", async (req: Request, res: Response) => {
	const { targetPath } = req.body as { targetPath: string };

	try {
		if (!validatePath(targetPath, res)) return;

		await fs.remove(targetPath);
		logger.info(`Deleted ${targetPath}`);
		res.status(200).send("Deleted successfully");
	} catch (error) {
		logger.error("Failed to delete", { error });
		res.status(500).send("Internal Server Error");
	}
});

// Create new file
router.post("/new-file", async (req: Request, res: Response) => {
	const { filePath, content = "" } = req.body as {
		filePath: string;
		content?: string;
	};

	try {
		if (!filePath) {
			res.status(400).send("File path is required");
			return;
		}

		if (fs.existsSync(filePath)) {
			res.status(400).send("File already exists");
			return;
		}

		await fs.ensureFile(filePath);
		await fs.writeFile(filePath, content, "utf8");
		logger.info(`Created new file at ${filePath}`);
		res.status(200).send("File created successfully");
	} catch (error) {
		logger.error("Failed to create file", { error });
		res.status(500).send("Internal Server Error");
	}
});

// Create new directory
router.post("/new-directory", async (req: Request, res: Response) => {
	const { dirPath } = req.body as { dirPath: string };

	try {
		if (!dirPath) {
			res.status(400).send("Directory path is required");
			return;
		}

		if (fs.existsSync(dirPath)) {
			res.status(400).send("Directory already exists");
			return;
		}

		await fs.ensureDir(dirPath);
		logger.info(`Created new directory at ${dirPath}`);
		res.status(200).send("Directory created successfully");
	} catch (error) {
		logger.error("Failed to create directory", { error });
		res.status(500).send("Internal Server Error");
	}
});

export default router;
