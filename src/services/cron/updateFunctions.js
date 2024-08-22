// src/services/cron/updateFunctions.js
const { fetchCurrentTickers, saveTickersInDatabase, getSavedAllTickersByPlatform } = require("../../controllers/tickersController.js");
const { fetchCurrentBalance, saveBalanceInDatabase } = require("../../controllers/balanceController.js");
const { fetchCurrentMarkets, saveMarketsInDatabase } = require("../../controllers/marketsController.js");

const {
  deleteAndSaveObject,
} = require("../../utils/mongodbUtil.js");

const {
  compareBalances,
  calculateAllMetrics,
  processBalanceChanges,
} = require("../balanceProcessor.js");

async function updateMarketsForPlatform(platform) {
  const currentmarkets = await fetchCurrentMarkets(platform, 3);
  try {
    await saveMarketsInDatabase(currentmarkets, platform);
  } catch (error) {
    console.log(`🚀 ~ file: updateFunctions.js:21 ~ updateMarketsForPlatform ~ error:`, error)
  }
}

async function updateTickersForPlatform(platform) {
  const currentTickers = await fetchCurrentTickers(platform, 3);
  try {
    await saveTickersInDatabase(currentTickers, platform);
  } catch (error) {
    console.log(`🚀 ~ file: updateFunctions.js:30 ~ updateTickersForPlatform ~ error:`, error)
  }
}

async function updateBalancesForPlatform(platform)  {
  const currentBalance = await fetchCurrentBalance(platform, 3);
  const lastBalance = await getSavedAllTickersByPlatform(platform);
  const differences = compareBalances(lastBalance, currentBalance);
  console.log(`🚀 ~ file: updateFunctions.js:38 ~ updateBalancesForPlatform ~ differences:`, differences)
  if (differences.length > 0) {
    await saveBalanceInDatabase(currentBalance, platform);
    await processBalanceChanges(differences, platform);
    //await calculateMetrics(differences, exchsangeId);
  }

  try {
    const collectionName = process.env.MONGODB_COLLECTION_SHAD;
    const metrics = await calculateAllMetrics();
    console.log(`🚀 ~ file: updateFunctions.js:48 ~ updateBalancesForPlatform ~ metrics:`, metrics.length.length)
    deleteAndSaveObject(metrics, collectionName);
  } catch (error) {
    console.log(`🚀 ~ file: updateFunctions.js:51 ~ updateBalancesForPlatform ~ error:`, error)
  }
}

module.exports = {
  updateMarketsForPlatform,
  updateTickersForPlatform,
  updateBalancesForPlatform
};
