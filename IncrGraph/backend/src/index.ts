import express from "express";
import cors from "cors";
import fileExplorerRoutes from "./routes/file-explorer";
import codeHandlerRoutes from "./routes/code-handler";
import { logger } from "./utils/logger";

import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Configure CORS
const corsOptions = {
	origin: process.env.FRONTEND_URL,
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use("/api/file-explorer", fileExplorerRoutes);
app.use("/api/code-handler", codeHandlerRoutes);

app.listen(PORT, () => {
	logger.info(`Server running on http://localhost:${PORT}`);
});
