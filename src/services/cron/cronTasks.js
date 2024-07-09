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
    console.log("Starting to initialize Cron tasks...");

    await cronBalances();

    cron.schedule(cronSchedules.tickers, cronTickers);
    cron.schedule(cronSchedules.markets, cronMarkets);
    cron.schedule(cronSchedules.balances, cronBalances);
    console.log("Cron tasks initialized.");
  } catch (error) {
    errorLogger.error(`Error initializing cron tasks: ${error.message}`, {
      error,
    });
    throw error;
  }
}

module.exports = { initializeCronTasks };
