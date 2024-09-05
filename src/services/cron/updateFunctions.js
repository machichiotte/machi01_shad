// src/services/cron/updateFunctions.js
const {
  fetchCurrentTickers,
  saveDatabaseTickers,
} = require("../../controllers/tickersController.js");
const {
  fetchDatabaseBalancesByPlatform,
  fetchCurrentBalancesByPlatform,
  saveDatabaseBalance,
} = require("../balanceService.js");
const {
  fetchCurrentMarkets,
  saveDatabaseMarkets,
} = require("../../controllers/marketsController.js");

const { deleteAndSaveObject } = require("../../utils/mongodbUtil.js");

const {
  compareBalances,
  calculateAllMetrics,
  processBalanceChanges,
} = require("../balanceProcessor.js");

async function updateMarketsForPlatform(platform) {
  try {
    const currentMarkets = await fetchCurrentMarkets(platform, 3);
    await saveDatabaseMarkets(currentMarkets, platform);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des marchés pour ${platform}:`, error);
  }
}

async function updateTickersForPlatform(platform) {
  try {
    const currentTickers = await fetchCurrentTickers(platform, 3);
    await saveDatabaseTickers(currentTickers, platform);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des tickers pour ${platform}:`, error);
  }
}

async function updateBalancesForPlatform(platform) {
  try {
    const [currentBalances, previousBalances] = await Promise.all([
      fetchCurrentBalancesByPlatform(platform, 3),
      fetchDatabaseBalancesByPlatform(platform, 3)
    ]);
    
    const differences = compareBalances(previousBalances, currentBalances);
    if (differences.length > 0) {
      console.log(`Différences de solde détectées pour ${platform}:`, differences);
      await Promise.all([
        saveDatabaseBalance(currentBalances, platform),
        processBalanceChanges(differences, platform)
      ]);
    }

    const collectionName = process.env.MONGODB_COLLECTION_SHAD;
    const metrics = await calculateAllMetrics();
    await deleteAndSaveObject(metrics, collectionName);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des soldes pour ${platform}:`, error);
  }
}

module.exports = {
  updateMarketsForPlatform,
  updateTickersForPlatform,
  updateBalancesForPlatform,
};
