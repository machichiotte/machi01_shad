/**
 * Task Executor for Cron Jobs
 * 
 * This module contains functions for executing cron tasks across different platforms.
 * It handles task execution, error logging, and critical error notifications.
 */

import { sendMail } from "./sendMail";
import config from "../config";
import { errorLogger } from "../../utils/loggerUtil";
import { getPlatforms } from "../../utils/platformUtil";

import {
  updateMarketsForPlatform,
  updateTickersForPlatform,
  updateBalancesForPlatform
} from "./updateFunctions";

/**
 * Executes a cron task with retry mechanism and error handling
 * @param task - The task to be executed
 * @param isCritical - Whether the task is critical
 * @param retries - Number of retry attempts
 */
async function executeCronTask(task: () => Promise<void>, isCritical: boolean = false, retries: number = 3): Promise<void> {
  let attempts = 0;
  while (attempts < retries) {
    try {
      await task();
      return;
    } catch (error) {
      console.error(`Task execution failed: ${(error as Error).message}`, { error });
      errorLogger.error(`Task execution failed: ${(error as Error).message}`, { error });
      if (isCritical) {
        if (attempts < retries - 1) {
          await new Promise((res) => setTimeout(res, 5000 * (attempts + 1)));
        } else {
          sendMail({
            from: config.smtp.auth.user as string,
            to: process.env.EMAIL_ADDRESS_SEND as string,
            subject: "Critical Error Alert",
            text: `Critical error in scheduled task: ${(error as Error).message}`,
          });
        }
      }
      attempts++;
    }
  }
}

/**
 * Executes a given task function for all platforms
 * @param taskName - Name of the task
 * @param taskFunction - Function to be executed for each platform
 */
async function executeForPlatforms(taskName: string, taskFunction: (platform: string) => Promise<void>): Promise<void> {
  console.log(`Executing cron job for ${taskName}...`);
  const platforms = getPlatforms();
  await Promise.all(platforms.map(platform => 
    executeCronTask(() => taskFunction(platform), true)
  ));
}

/**
 * Cron function for updating tickers across all platforms
 */
export async function cronTickers(): Promise<void> {
  await executeForPlatforms('updateTickers', updateTickersForPlatform);
}

/**
 * Cron function for updating markets across all platforms
 */
export async function cronMarkets(): Promise<void> {
  await executeForPlatforms('updateMarkets', updateMarketsForPlatform);
}

/**
 * Cron function for updating balances across all platforms
 */
export async function cronBalances(): Promise<void> {
  await executeForPlatforms('updateBalances', updateBalancesForPlatform);
}
