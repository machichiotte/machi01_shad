// src/services/cron/updateFunctions.js

/**
 * This module contains functions for updating markets, tickers, and balances for a given platform.
 * It uses various services to fetch, compare, and save data to the database.
 */

const tickersService = require('../tickersService');
const balanceService = require('../balanceService');
const marketsService = require('../marketsService');
const mongodbService = require("../mongodbService.js");
const processorService = require("../processorService.js");

/**
 * Updates the markets for a specified platform.
 * @param {string} platform - The platform to update markets for.
 */
async function updateMarketsForPlatform(platform) {
  try {
    const currentMarkets = await marketsService.fetchCurrentMarkets(platform, 3);
    await marketsService.saveDatabaseMarkets(currentMarkets, platform);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des marchés pour ${platform}:`, error);
  }
}

/**
 * Updates the tickers for a specified platform.
 * @param {string} platform - The platform to update tickers for.
 */
async function updateTickersForPlatform(platform) {
  try {
    const currentTickers = await tickersService.fetchCurrentTickers(platform, 3);
    await tickersService.saveDatabaseTickers(currentTickers, platform);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des tickers pour ${platform}:`, error);
  }
}

/**
 * Updates the balances for a specified platform, compares with previous balances,
 * and processes any changes. Also calculates and saves metrics.
 * @param {string} platform - The platform to update balances for.
 */
async function updateBalancesForPlatform(platform) {
  try {
    const [currentBalances, previousBalances] = await Promise.all([
      balanceService.fetchCurrentBalancesByPlatform(platform, 3),
      balanceService.fetchDatabaseBalancesByPlatform(platform, 3)
    ]);
    
    const differences = processorService.compareBalances(previousBalances, currentBalances);
    if (differences.length > 0) {
      console.log(`Différences de solde détectées pour ${platform}:`, differences);
      await Promise.all([
        balanceService.saveDatabaseBalance(currentBalances, platform),
        processorService.processBalanceChanges(differences, platform)
      ]);
    }

    const collectionName = process.env.MONGODB_COLLECTION_SHAD;
    const metrics = await processorService.calculateAllMetrics();
    await mongodbService.deleteAndSaveObject(metrics, collectionName);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des soldes pour ${platform}:`, error);
  }
}

module.exports = {
  updateMarketsForPlatform,
  updateTickersForPlatform,
  updateBalancesForPlatform,
};
