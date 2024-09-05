// src/services/migrationSwapsService.js

const {
  fetchDatabaseMigrationSwaps,
} = require("../controllers/swapController");
const {
  fetchDatabaseStrategies,
  updateStrategyById,
} = require("../controllers/strategyController");
const {
  fetchDatabaseTrades,
  updateTradeById,
} = require("../controllers/tradesController");
const logger = require("../utils/loggerUtil"); // Supposons que nous avons un module de journalisation

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

  await updateTradeById(trade._id, updatedTrade);
  logger.info(`Trade swap completed for ${oldAsset} to ${newAsset} on platform ${platform}.`);
}

async function updateStrategy(strategy, newAsset, platform) {
  const updatedStrategy = { asset: newAsset };
  await updateStrategyById(strategy._id, updatedStrategy);
  logger.info(`Strategy swap completed for ${strategy.asset} to ${newAsset} on platform ${platform}.`);
}

async function handleMigrationSwaps() {
  try {
    const [swaps, trades, strategies] = await Promise.all([
      fetchDatabaseMigrationSwaps(),
      fetchDatabaseTrades(),
      fetchDatabaseStrategies(),
    ]);

    const now = new Date();

    for (const swap of swaps) {
      const { oldAsset, newAsset, swapRate, platform, delistingDate } = swap;
      const delisting = new Date(delistingDate);

      if (now < delisting) {
        logger.info(`Waiting for delisting date (${delistingDate}) of ${oldAsset} to be exceeded.`);
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
    logger.error("Error handling swaps:", error);
  }
}

module.exports = { handleMigrationSwaps };