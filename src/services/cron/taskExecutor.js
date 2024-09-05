// src/services/cron/tasExecutor.js
const { sendMail } = require("./sendMail.js");
const { smtp } = require("../config.js");
const { errorLogger } = require("../../utils/loggerUtil.js");
const { getPlatforms } = require("../../utils/platformUtil.js");

const {
  updateMarketsForPlatform,
  updateTickersForPlatform,
  updateBalancesForPlatform
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

async function executeForPlatforms(taskName, taskFunction) {
  console.log(`Executing cron job for ${taskName}...`);
  const platforms = getPlatforms();
  await Promise.all(platforms.map(platform => 
    executeCronTask(() => taskFunction(platform), true)
  ));
}

const cronFunctions = {
  Tickers: updateTickersForPlatform,
  Markets: updateMarketsForPlatform,
  Balances: updateBalancesForPlatform
};

module.exports = Object.fromEntries(
  Object.entries(cronFunctions).map(([key, func]) => [
    `cron${key}`,
    () => executeForPlatforms(`update${key}`, func)
  ])
);
