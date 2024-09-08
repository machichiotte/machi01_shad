// src/services/cron/cronTasks.js
const cron = require("node-cron");
const { cronSchedules } = require("../config.js");
const { errorLogger } = require("../../utils/loggerUtil.js");

const { cronTickers, cronMarkets, cronBalances } = require("./taskExecutor.js");

/**
 * Initializes and schedules cron tasks for tickers, markets, and balances.
 * 
 * This function sets up periodic tasks using node-cron to run at specified intervals.
 * It initializes tasks for updating tickers, markets, and balances based on the
 * schedules defined in the configuration.
 * 
 * @async
 * @function initializeCronTasks
 * @throws {Error} If there's an error during the initialization process
 */
async function initializeCronTasks() {
  try {
    console.log("Starting initialization of Cron tasks...");

    const tasks = [
      { schedule: cronSchedules.tickers, task: cronTickers, name: "Tickers" },
      { schedule: cronSchedules.markets, task: cronMarkets, name: "Markets" },
      {
        schedule: cronSchedules.balances,
        task: cronBalances,
        name: "Balances",
      },
    ];

    tasks.forEach(({ schedule, task, name }) => {
      cron.schedule(schedule, task);
      console.log(`Cron task initialized: ${name}`);
    });

    console.log("All Cron tasks have been successfully initialized.");
  } catch (error) {
    errorLogger.error("Error during Cron tasks initialization", { error });
    throw error;
  }
}

module.exports = { initializeCronTasks };
