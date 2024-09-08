// src/services/migrationSwapsService.js
const { getData } = require("../utils/dataUtil");

const strategyService = require("../services/strategyService");
const tradesService = require("../services/tradesService");

/**
 * Fetches swap migration data from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of swap migration objects.
 */
async function fetchDatabaseSwapMigration() {
  const collectionName = process.env.MONGODB_COLLECTION_SWAP;
  return await getData(collectionName);
}

/**
 * Updates a trade with new asset information after a swap.
 * @param {Object} trade - The trade object to update.
 * @param {string} oldAsset - The old asset symbol.
 * @param {string} newAsset - The new asset symbol.
 * @param {number} swapMultiplier - The multiplier to adjust the trade amount and price.
 * @param {string} platform - The platform where the trade occurred.
 * @returns {Promise<void>}
 */
async function updateTrade(trade, oldAsset, newAsset, swapMultiplier, platform) {
  const updatedTrade = {
    base: newAsset,
    pair: trade.pair.replace(oldAsset, newAsset),
    amount: trade.amount * swapMultiplier,
    price: trade.total / (trade.amount * swapMultiplier),
    fee: trade.feecoin === oldAsset ? trade.fee * swapMultiplier : trade.fee,
    feecoin: trade.feecoin === oldAsset ? newAsset : trade.feecoin,
    swap: true,
  };

  await tradesService.updateTradeById(trade._id, updatedTrade);
  console.info(`Trade swap completed for ${oldAsset} to ${newAsset} on platform ${platform}.`);
}

/**
 * Updates a strategy with a new asset.
 * @param {Object} strategy - The strategy object to update.
 * @param {string} newAsset - The new asset symbol.
 * @param {string} platform - The platform where the strategy is applied.
 * @returns {Promise<void>}
 */
async function updateStrategy(strategy, newAsset, platform) {
  const updatedStrategy = { asset: newAsset };
  await strategyService.updateStrategyById(strategy._id, updatedStrategy);
  console.info(`Strategy swap completed for ${strategy.asset} to ${newAsset} on platform ${platform}.`);
}

/**
 * Handles the migration of swaps by updating trades and strategies.
 * This function fetches swap migration data, trades, and strategies from the database,
 * then processes each swap if the delisting date has passed.
 * @returns {Promise<void>}
 */
async function handleMigrationSwaps() {
  try {
    const [swaps, trades, strategies] = await Promise.all([
      fetchDatabaseSwapMigration(),
      tradesService.fetchDatabaseTrades(),
      strategyService.fetchDatabaseStrategies(),
    ]);

    const now = new Date();

    for (const swap of swaps) {
      const { oldAsset, newAsset, swapRate, platform, delistingDate } = swap;
      const delisting = new Date(delistingDate);

      if (now < delisting) {
        console.info(`Waiting for delisting date (${delistingDate}) of ${oldAsset} to be exceeded.`);
        continue;
      }

      const [oldRatio, newRatio] = swapRate.split(":").map(Number);
      const swapMultiplier = newRatio / oldRatio;

      const tradeUpdates = trades
        .filter(trade => trade.base === oldAsset && trade.platform === platform)
        .map(trade => updateTrade(trade, oldAsset, newAsset, swapMultiplier, platform));

      const strategyUpdates = strategies
        .filter(strategy => strategy.asset === oldAsset && strategy.strategies[platform])
        .map(strategy => updateStrategy(strategy, newAsset, platform));

      await Promise.all([...tradeUpdates, ...strategyUpdates]);
    }
  } catch (error) {
    console.error("Error handling swaps:", error);
  }
}

module.exports = { fetchDatabaseSwapMigration, handleMigrationSwaps };