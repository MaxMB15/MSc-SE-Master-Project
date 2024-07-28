import { createLogger, format, log, transports } from "winston";
import {getConfigPath} from "./utils"
import * as path from "path";
import * as fs from "fs";

// Function to create a logger with a custom project name
export const createCustomLogger = (projectName: string) => {
	// Determine the log directory
	const logDirectory = path.join(getConfigPath(), "logs", projectName);

	// Ensure the log directory exists
	console.log("logDirectory", logDirectory);
	if (!fs.existsSync(logDirectory)) {
		fs.mkdirSync(logDirectory, { recursive: true });
	}

	// Create the logger
	const logger = createLogger({
		level: "info",
		format: format.combine(format.timestamp(), format.json()),
		transports: [
			new transports.File({
				filename: path.join(logDirectory, "error.log"),
				level: "error",
			}),
			new transports.File({
				filename: path.join(logDirectory, "combined.log"),
			}),
		],
	});

	// If we're not in production then log to the `console` with the format:
	// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `.
	if (process.env.NODE_ENV !== "production") {
		logger.add(
			new transports.Console({
				format: format.simple(),
			}),
		);
	}

	return logger;
};
