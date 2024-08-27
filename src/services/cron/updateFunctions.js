// src/services/cron/updateFunctions.js
const { fetchCurrentTickers, saveDatabaseTickers } = require("../../controllers/tickersController.js");
const { fetchDatabaseBalancesByPlatform, fetchCurrentBalancesByPlatform, saveDatabaseBalance } = require("../../controllers/balanceController.js");
const { fetchCurrentMarkets, saveDatabaseMarkets } = require("../../controllers/marketsController.js");

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
    await saveDatabaseMarkets(currentmarkets, platform);
  } catch (error) {
    console.log(`🚀 ~ file: updateFunctions.js:21 ~ updateMarketsForPlatform ~ error:`, error)
  }
}

async function updateTickersForPlatform(platform) {
  const currentTickers = await fetchCurrentTickers(platform, 3);
  try {
    await saveDatabaseTickers(currentTickers, platform);
  } catch (error) {
    console.log(`🚀 ~ file: updateFunctions.js:30 ~ updateTickersForPlatform ~ error:`, error)
  }
}

async function updateBalancesForPlatform(platform)  {
  const currentBalances = await fetchCurrentBalancesByPlatform(platform, 3);
  const previousBalances = await fetchDatabaseBalancesByPlatform(platform, 3);
  const differences = compareBalances(previousBalances, currentBalances);
  console.log(`🚀 ~ file: updateFunctions.js:38 ~ updateBalancesForPlatform ~ differences:`, differences)
  if (differences.length > 0) {
    await saveDatabaseBalance(currentBalances, platform);
    await processBalanceChanges(differences, platform);
    //await calculateMetrics(differences, exchsangeId);
  }

  try {
    const collectionName = process.env.MONGODB_COLLECTION_SHAD;
    const metrics = await calculateAllMetrics();
    console.log(`🚀 ~ file: updateFunctions.js:48 ~ updateBalancesForPlatform ~ metrics:`, metrics.length)
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
