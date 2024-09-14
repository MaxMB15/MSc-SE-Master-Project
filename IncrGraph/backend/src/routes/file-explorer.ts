import { Router, Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import { FileNode, Cache, CacheEntry, createCustomLogger, ModuleConfigurationData } from "shared";
// import { Project } from "ts-morph";

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

/**
 * Handle new Components / Modules
 *
 */

// interface ComponentType {
// 	type: string; // The type of component, e.g., "IGCNodeProps"
// 	components: string[]; // List of component names that match this type
// }

// interface CacheEntry {
// 	search_path: string;
// 	last_updated: string;
// 	files: {
// 		[filePath: string]: ComponentType[];
// 	};
// }





// const componentTypesToSearchFor: string[] = ["IGCNodeProps"];

// Cache file path
const CACHE_FILE = path.join(__dirname, "../../cache.json");
const IGC_MODULE_CONFIG_FILE = "igc.module.json";

// Function to read the cache
const readCache = async (): Promise<Cache> => {
	try {
		// Check if the file exists
		if (!fs.existsSync(CACHE_FILE)) {
			// If file doesn't exist, create it with an empty array
			await fs.promises.writeFile(
				CACHE_FILE,
				JSON.stringify([]),
				"utf-8",
			);
			return [];
		}

		// If file exists, read its contents
		const rawData = await fs.promises.readFile(CACHE_FILE, "utf-8");
		return JSON.parse(rawData) as Cache;
	} catch (error) {
		// If an error occurs during file read (but the file exists), fail without overriding the file
		console.error("Error reading the cache file:", error);
		throw new Error("Failed to read cache file");
	}
};

// Function to write to the cache
const writeCache = (cacheData: Cache): void => {
	fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
};

// Function to scan the directory for .tsx files and compare with cache
// const getMissingOrExtraFiles = (
// 	directoryPath: string,
// 	cache: CacheEntry,
// ): { missing: string[]; extra: string[] } => {
// 	const currentFiles = fs
// 		.readdirSync(directoryPath)
// 		.filter((file) => file.endsWith(".tsx"));
// 	const cachedFiles = Object.keys(cache.files);

// 	const missingFiles = currentFiles.filter(
// 		(file) => !cachedFiles.includes(file),
// 	);
// 	const extraFiles = cachedFiles.filter(
// 		(file) => !currentFiles.includes(file),
// 	);

// 	return { missing: missingFiles, extra: extraFiles };
// };

// Function to detect components of specific types in a given file (This works, it is just slow, so instead we will just return the files)
// const findComponentsByType = (
// 	filePath: string,
// 	types: string[],
// ): ComponentType[] => {
// 	const project = new Project();
// 	const sourceFile = project.addSourceFileAtPath(filePath);
// 	const componentMatches: ComponentType[] = [];

// 	types.forEach((type) => {
//         const components: string[] = sourceFile.getVariableDeclarations().filter(s => s.getType().getText().includes(type)).map(s => s.getName());

// 		if (components.length > 0) {
// 			componentMatches.push({ type, components });
// 		}
// 	});

// 	return componentMatches;
// };
router.post("/add-module", async (req: Request, res: Response) => {
	const directoryPath = req.body.directory as string;
	if (!directoryPath) {
		return res.status(400).json({ error: "Directory path is required" });
	}

	let cache = await readCache();

	// Check if the directory already exists in the cache
	const cacheEntryExists = cache.some(
		(entry) => entry.search_path === directoryPath,
	);
	if (cacheEntryExists) {
		return res
			.status(400)
			.json({ error: "Directory already exists in the cache" });
	}

	// Add the new directory to the cache
	const newCacheEntry: CacheEntry = {
		search_path: directoryPath,
		last_updated: new Date().toISOString(),
		files: [],
	};
	cache.push(newCacheEntry);
	writeCache(cache);

	res.status(201).json({ message: "Directory added to cache", cache });
});

router.delete("/remove-module", async (req: Request, res: Response) => {
	const directoryPath = req.body.directory as string;
	if (!directoryPath) {
		return res.status(400).json({ error: "Directory path is required" });
	}

	let cache = await readCache();

	// Filter out the directory to remove it from the cache
	const newCache = cache.filter(
		(entry) => entry.search_path !== directoryPath,
	);

	if (newCache.length === cache.length) {
		return res
			.status(400)
			.json({ error: "Directory not found in the cache" });
	}

	writeCache(newCache);
	res.status(200).json({
		message: "Directory removed from cache",
		cache: newCache,
	});
});

// // Function to check if a cache entry needs updating
// const isCacheEntryOutdated = (entry: CacheEntry): boolean => {
// 	const now = new Date();
// 	const lastUpdated = new Date(entry.last_updated);
// 	const timeDiff =
// 		(now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24); // difference in days
// 	return timeDiff > 1;
// };

// Function to find the cache for a specific directory
const findCacheForDirectory = (
	cache: Cache,
	directoryPath: string,
): any | null => {
	return cache.find((entry) => entry.search_path === directoryPath) || null;
};

// Function to scan the directory for .tsx files, excluding symlinks
const getTsxFiles = (directoryPath: string): string[] => {
	let tsxFiles: string[] = [];

	const files = fs.readdirSync(directoryPath);

	files.forEach((file) => {
		const filePath = path.join(directoryPath, file);
		const stat = fs.lstatSync(filePath);

		if (stat.isDirectory() && file !== "node_modules") {
			// Recursively search subdirectories
			tsxFiles = tsxFiles.concat(getTsxFiles(filePath));
		} else if (file.endsWith(".tsx") && !stat.isSymbolicLink()) {
			// Add the .tsx file if it's not a symlink
			tsxFiles.push(filePath);
		}
	});

	return tsxFiles;
};

// Function to process files and update cache for a directory
const updateCacheForDirectory = (
	directoryPath: string,
	cache: Cache,
): CacheEntry => {
	let cacheEntry = findCacheForDirectory(cache, directoryPath);

	const tsxFiles = getTsxFiles(directoryPath);
	// const missingOrExtraFiles = getMissingOrExtraFiles(
	// 	directoryPath,
	// 	cacheEntry,
	// );

	// // If there are missing or extra files, or the cache is outdated, re-process
	// if (
	// 	missingOrExtraFiles.missing.length > 0 ||
	// 	missingOrExtraFiles.extra.length > 0 ||
	// 	isCacheEntryOutdated(cacheEntry)
	// ) {
		// tsxFiles.forEach((file) => {
		// 	const filePath = path.join(directoryPath, file);
		// 	const components = findComponentsByType(
		// 		filePath,
		// 		componentTypesToSearchFor,
		// 	);
		// 	cacheEntry.files[filePath] = components;
		// });
    cacheEntry.files = tsxFiles;
    cacheEntry.last_updated = new Date().toISOString();
	// }

	return cacheEntry;
};

const checkModuleConfig = (modulePath: string): ModuleConfigurationData | undefined => {
    const configPath = path.join(modulePath, IGC_MODULE_CONFIG_FILE);
    if (fs.existsSync(configPath)) {
        const rawData = fs.readFileSync(configPath, "utf-8");
        return JSON.parse(rawData) as ModuleConfigurationData;
    }
    return undefined;
}

router.get("/find-components", async (_, res: Response) => {
	let cache = await readCache();

	cache.forEach((entry) => {
        const moduleConfig = checkModuleConfig(entry.search_path);
        if (moduleConfig){
            entry.meta = moduleConfig;
        }
		updateCacheForDirectory(entry.search_path, cache);
	});

	writeCache(cache); // Update cache after processing
	res.json(cache);
});

export default router;
