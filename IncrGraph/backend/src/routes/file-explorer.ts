import { Router, Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import { logger } from "../utils/logger";
import { FileNode } from "../types/common";

const router = Router();

const getDirectoryStructure = (dirPath: string): FileNode[] => {
	const files = fs.readdirSync(dirPath);

	return files.map((file) => {
		const filePath = path.join(dirPath, file);
		const isDirectory = fs.lstatSync(filePath).isDirectory();

		return {
			name: file,
			type: isDirectory ? "directory" : "file",
			children: isDirectory ? getDirectoryStructure(filePath) : [],
		};
	});
};

router.get("/", (req: Request, res: Response) => {
	try {
		const requestedPath = (req.query.path as string) || path.resolve(__dirname, "../../../../content");
        console.log(requestedPath);

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

export default router;
