// server.ts
import dotenv from "dotenv";
import {
  connectToMongoDB,
  cleanCollectionTrades,
} from "./src/services/mongodbService";
import { app, startServer } from "./src/services/requestHandlers";
import { initializeCronTasks } from "./src/services/cron/cronTasks";

import { cronBalances } from "./src/services/cron/taskExecutor";
import { handleMigrationSwaps } from "./src/services/migrationSwapsService";

dotenv.config();

const isOfflineMode = process.env.OFFLINE_MODE === "true";
(app as any).offlineMode = isOfflineMode;

async function initializeServer(): Promise<void> {
  try {
    await connectToMongoDB();

    await cleanCollectionTrades();

    await handleMigrationSwaps();

    await cronBalances();

    await initializeCronTasks();
    startServer();
  } catch (error) {
    console.error("Error during server initialization:", error);
    process.exit(1); // Exit the process if initialization fails
  }
}

initializeServer();
