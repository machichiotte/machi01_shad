// src/services/cron/tasExecutor.js
const { sendMail } = require("./sendMail.js");
const { smtp } = require("../config.js");

const { errorLogger } = require("../../utils/loggerUtil.js");
const { getExchanges } = require("../../utils/exchangeUtil.js");

const {
  updateMarketsForExchange,
  updateTickersForExchange,
  updateBalancesForExchange
} = require("./updateFunctions.js");

async function executeCronTask(task, isCritical = false, retries = 3) {
  let attempts = 0;
  while (attempts < retries) {
    try {
      await task();
      return;
    } catch (error) {
      console.error(`Task execution failed: ${error.message}`, { error });
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
  const exchanges = getExchanges();
  for (const exchangeId of exchanges) {
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
  await executeForExchanges("updateBalances", updateBalancesForExchange);
}

module.exports = {
  cronTickers,
  cronMarkets,
  cronBalances,
  executeForExchanges,
};
