import { Router, Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import { createCustomLogger } from "shared";
import { FileNode } from "shared";

const router = Router();

// Logger
const logger = createCustomLogger("backend");

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

router.get("/", (req: Request, res: Response) => {
	try {
		const requestedPath = req.query.path as string;
		if (!requestedPath) {
			res.status(400).send("Path parameter is required");
			return;
		}

		if (
			!fs.existsSync(requestedPath) ||
			!fs.lstatSync(requestedPath).isDirectory()
		) {
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

router.get("/file-content", async (req: Request, res: Response) => {
	const filePath = req.query.path as string;

	try {
		const resolvedPath = path.resolve(
			__dirname,
			"../../../../content",
			filePath,
		);
		if (
			!fs.existsSync(resolvedPath) ||
			fs.lstatSync(resolvedPath).isDirectory()
		) {
			res.status(400).send("Invalid file path");
			return;
		}

		const fileContent = await fs.promises.readFile(resolvedPath, "utf-8");
		const stats = await fs.promises.stat(resolvedPath);
		const lastModified = stats.mtimeMs; // Get last modified timestamp in milliseconds

		res.json({ content: fileContent, lastModified: lastModified });
	} catch (error) {
		logger.error("Failed to read file", { error });
		res.status(500).send("Internal Server Error");
	}
});
router.post("/file-content", async (req: Request, res: Response) => {
	const filePath = req.body.path as string;
	try {
		const resolvedPath = path.resolve(
			__dirname,
			"../../../../content",
			filePath,
		);
		if (
			!fs.existsSync(resolvedPath) ||
			fs.lstatSync(resolvedPath).isDirectory()
		) {
			res.status(400).send("Invalid file path");
			return;
		}
		fs.writeFile(resolvedPath, req.body.content, "utf8", (err) => {
			if (err) {
				res.status(500).send("Error saving file");
				return;
			}
			logger.info(
				`Successfully wrote file (${resolvedPath}) with:\n${req.body.content}\n`,
			);
			res.status(200).send("File saved successfully");
		});
	} catch (error) {
		logger.error("Failed to read file", { error });
		res.status(500).send("Error saving file");
	}
});
//

// try {
// 	const resolvedPath = path.resolve(
// 		__dirname,
// 		"../../../../content",
// 		filePath,
// 	);
// 	if (
// 		!fs.existsSync(resolvedPath) ||
// 		fs.lstatSync(resolvedPath).isDirectory()
// 	) {
// 		res.status(400).send("Invalid file path");
// 		return;
// 	}

// 	const fileContent = await fs.readFile(resolvedPath, "utf-8");
// 	res.send(fileContent);
// } catch (error) {
// 	logger.error("Failed to read file", { error });
// 	res.status(500).send("Internal Server Error");
// }

export default router;
