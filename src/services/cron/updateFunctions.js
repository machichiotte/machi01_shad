// src/services/cron/updateFunctions.js
const { fetchCurrentTickers, saveTickersInDatabase, getSavedAllTickersByExchange } = require("../../controllers/tickersController.js");
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

async function updateMarketsForExchange(exchangeId) {
  const currentmarkets = await fetchCurrentMarkets(exchangeId, 3);
  try {
    await saveMarketsInDatabase(currentmarkets, exchangeId);
  } catch (error) {
    console.log(`🚀 ~ file: taskExecutor.js:23 ~ awaitexecuteForExchanges ~ error:`, error)
  }
}

async function updateTickersForExchange(exchangeId) {
  const currentTickers = await fetchCurrentTickers(exchangeId, 3);
  try {
    await saveTickersInDatabase(currentTickers, exchangeId);
  } catch (error) {
    console.log(`🚀 ~ file: taskExecutor.js:32 ~ awaitexecuteForExchanges ~ error:`, error)
  }
}

async function updateBalancesForExchange(exchangeId)  {
  const currentBalance = await fetchCurrentBalance(exchangeId, 3);
  const lastBalance = await getSavedAllTickersByExchange(exchangeId);
  const differences = compareBalances(lastBalance, currentBalance);
  if (differences.length > 0) {
    await saveBalanceInDatabase(currentBalance, exchangeId);
    await processBalanceChanges(differences, exchangeId);
    //await calculateMetrics(differences, exchsangeId);
  }

  try {
    const collectionName = process.env.MONGODB_COLLECTION_SHAD;
    const metrics = await calculateAllMetrics();
    console.log(`🚀 ~ file: taskExecutor.js:49 ~ awaitexecuteForExchanges ~ metrics:`, metrics.length)
    deleteAndSaveObject(metrics, collectionName);
  } catch (error) {
    console.log(`🚀 ~ file: taskExecutor.js:52 ~ awaitexecuteForExchanges ~ error:`, error)
  }
}

module.exports = {
  updateMarketsForExchange,
  updateTickersForExchange,
  updateBalancesForExchange
};
