// src/server.ts
import dotenv from "dotenv";
import {
  connectToMongoDB,
  cleanCollectionTrades,
} from "./services/mongodbService";
import { app, startServer } from "./services/requestHandlers";
import { initializeCronTasks } from "./services/cron/cronTasks";

import { cronBalances } from "./services/cron/taskExecutor";
import { handleMigrationSwaps } from "./services/migrationSwapsService";

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
