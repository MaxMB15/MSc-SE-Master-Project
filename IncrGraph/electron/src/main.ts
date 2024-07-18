import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import { spawn } from "child_process";
import * as dotenv from "dotenv";

dotenv.config();

let mainWindow: BrowserWindow | null;

const createWindow = async () => {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		title: "IncrGraph2",
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
		// icon: path.join(__dirname, "../../.", "frontend", "public", "logo.png"),
	});

	const appUrl = process.env.FRONTEND_URL || "http://localhost:5174";
	mainWindow.loadURL(appUrl);

	mainWindow.webContents.openDevTools();

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
};

app.on("ready", async () => {
	await createWindow();

	// Start the backend server
	const backendPath = path.join(__dirname, "../../backend/dist/index.js");
	const backend = spawn("node", [backendPath]);

	backend.stdout.on("data", (data) => {
		console.log(`Backend: ${data}`);
	});

	backend.stderr.on("data", (data) => {
		console.error(`Backend error: ${data}`);
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", async () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		await createWindow();
	}
});

ipcMain.handle("select-directory", async () => {
	const result = await dialog.showOpenDialog({
		properties: ["openDirectory"],
	});
	return result.filePaths;
});
