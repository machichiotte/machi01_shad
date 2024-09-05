// src/services/cron/updateFunctions.js
const tickersService = require('../services/tickersService');
const balanceService = require('../services/balanceService');
const marketsService = require('../services/marketsService');

const { deleteAndSaveObject } = require("../../utils/mongodbUtil.js");

const {
  compareBalances,
  calculateAllMetrics,
  processBalanceChanges,
} = require("../balanceProcessor.js");

async function updateMarketsForPlatform(platform) {
  try {
    const currentMarkets = await marketsService.fetchCurrentMarkets(platform, 3);
    await marketsService.saveDatabaseMarkets(currentMarkets, platform);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des marchés pour ${platform}:`, error);
  }
}

async function updateTickersForPlatform(platform) {
  try {
    const currentTickers = await tickersService.fetchCurrentTickers(platform, 3);
    await tickersService.saveDatabaseTickers(currentTickers, platform);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des tickers pour ${platform}:`, error);
  }
}

async function updateBalancesForPlatform(platform) {
  try {
    const [currentBalances, previousBalances] = await Promise.all([
      balanceService.fetchCurrentBalancesByPlatform(platform, 3),
      balanceService.fetchDatabaseBalancesByPlatform(platform, 3)
    ]);
    
    const differences = compareBalances(previousBalances, currentBalances);
    if (differences.length > 0) {
      console.log(`Différences de solde détectées pour ${platform}:`, differences);
      await Promise.all([
        balanceService.saveDatabaseBalance(currentBalances, platform),
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
