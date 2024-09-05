// src/services/cron/cronTasks.js
const cron = require("node-cron");
const { cronSchedules } = require("../config.js");
const { errorLogger } = require("../../utils/loggerUtil.js");

const {
  cronTickers,
  cronMarkets,
  cronBalances
} = require("./taskExecutor.js");

async function initializeCronTasks() {
  try {
    console.log("Starting initialization of Cron tasks...");
    
    const tasks = [
      { schedule: cronSchedules.tickers, task: cronTickers },
      { schedule: cronSchedules.markets, task: cronMarkets },
      { schedule: cronSchedules.balances, task: cronBalances }
    ];

    tasks.forEach(({ schedule, task }) => {
      cron.schedule(schedule, task);
      console.log(`Cron task initialized: ${task.name}`);
    });

    console.log("All Cron tasks have been successfully initialized.");
  } catch (error) {
    errorLogger.error("Error during Cron tasks initialization", { error });
    throw error;
  }
}

module.exports = { initializeCronTasks };
