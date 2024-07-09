// src/services/cron/tasExecutor.js
const { sendMail } = require("./sendMail.js");
const { smtp } = require("../config.js");

const { errorLogger } = require("../../utils/loggerUtil.js");
const {
  fetchBalancesInDatabase,
  fetchCurrentBalance,
  saveBalanceInDatabase,
} = require("../../controllers/balanceController.js");
const {
  compareBalances,
  calculateAllMetrics,
} = require("./balanceProcessor.js");

const exchangesToUpdate = ["binance", "kucoin", "htx", "okx", "gateio"];

async function executeCronTask(task, isCritical = false, retries = 3) {
  let attempts = 0;
  while (attempts < retries) {
    try {
      await task();
      return;
    } catch (error) {
      errorLogger.error(`Task execution failed: ${error.message}`, { error });
      if (isCritical) {
        if (attempts < retries - 1) {
          await new Promise((res) => setTimeout(res, 5000 * (attempts + 1)));
        } else {
          sendMail({
            from: smtp.auth.user,
            to: process.env.EMAIL_ADDRESS_SEND,
            subject: "Critical Error Alert",
            text: `Critical error in scheduled task: ${error.message}`,
          });
        }
      }
      attempts++;
    }
  }
}

async function executeForExchanges(taskName, taskFunction) {
  console.log(`Running the cron job for ${taskName}...`);
  for (const exchangeId of exchangesToUpdate) {
    await executeCronTask(async () => {
      await taskFunction(exchangeId);
    }, true);
  }
}

async function cronTickers() {
  await executeForExchanges("updateTickers", updateTickersForExchange);
}

async function cronMarkets() {
  await executeForExchanges("updateMarkets", updateMarketsForExchange);
}

async function cronBalances() {
  const lastBalance = await fetchBalancesInDatabase();
  await executeForExchanges("updateBalances", async (exchangeId) => {
    const currentBalance = await fetchCurrentBalance(exchangeId, 3);
    const differences = compareBalances(lastBalance, currentBalance);
    if (differences.length > 0) {
      await saveBalanceInDatabase(currentBalance, exchangeId);
      await processBalanceChanges(differences, exchangeId);
      await calculateMetrics(differences, exchangeId);
    }
    await calculateAllMetrics();
  });
}

module.exports = {
  cronTickers,
  cronMarkets,
  cronBalances,
  executeForExchanges,
};
