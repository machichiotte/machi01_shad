// src/services/metrics/global.js

/**
 * This module contains functions for calculating global metrics for assets.
 * It includes utility functions for retrieving balances, prices, and other
 * financial data, as well as the main function for calculating asset metrics.
 */

const {
  calculateRecups,
  calculateAmountsAndPricesForShad,
} = require("./strategies.js");
const { getCmcValues } = require("./cmc.js");
const {
  getBalanceBySymbol,
  getProfit,
  getCurrentPossession,
  getPercentageDifference,
  getStatus,
} = require("./utils.js");
const { getTotalAmountAndBuy, getTotalSell } = require("./trades.js");

// Define stable coins
const stableCoins = ["USDT", "USDC", "DAI", "BUSD", "TUSD"];

/**
 * Default metrics object with initial values set to "N/A".
 * This serves as a template for asset metrics.
 */
const DEFAULT_METRICS = {
  iconUrl: "N/A",
  asset: "N/A",
  status: "N/A",
  strat: "N/A",
  ratioShad: "N/A",
  totalShad: "N/A",
  rank: "N/A",
  averageEntryPrice: "N/A",
  totalBuy: "N/A",
  maxExposition: "N/A",
  percentageDifference: "N/A",
  currentPrice: "N/A",
  currentPossession: "N/A",
  profit: "N/A",
  totalSell: "N/A",
  recupShad: "N/A",
  nbOpenBuyOrders: "N/A",
  nbOpenSellOrders: "N/A",
  totalAmount: "N/A",
  balance: "N/A",
  recupTp1: "N/A",
  recupTpX: "N/A",
  tp1: "N/A",
  tp2: "N/A",
  tp3: "N/A",
  tp4: "N/A",
  tp5: "N/A",
  percentToNextTp: "N/A",
  platform: "N/A",
};

/**
 * Retrieves the current price of an asset from the last tickers.
 * 
 * @param {Array} lastTickers - Array of recent ticker data.
 * @param {string} base - The base asset symbol.
 * @param {string} platform - The platform identifier.
 * @returns {string|number} - The current price or "N/A" if not found.
 */
function getCurrentPrice(lastTickers, base, platform) {
  if (!Array.isArray(lastTickers) || !base || !platform) {
    console.warn("Paramètres invalides pour getCurrentPrice");
    return "N/A";
  }

  const ticker = lastTickers.find(
    (ticker) =>
      ticker?.symbol === `${base}/USDT` && ticker.platform === platform
  );

  return ticker?.last ?? "N/A";
}

/**
 * Calculates various metrics for a given asset.
 * 
 * @param {string} asset - The asset symbol.
 * @param {string} platform - The platform identifier.
 * @param {Array} lastBalances - Recent balance data.
 * @param {Object} lastCmc - Recent CoinMarketCap data.
 * @param {Array} lastTrades - Recent trade data.
 * @param {Array} lastOpenOrders - Recent open orders data.
 * @param {Object} lastStrategies - Recent strategy data.
 * @param {Array} lastTickers - Recent ticker data.
 * @returns {Object} - An object containing calculated metrics for the asset.
 */
function calculateAssetMetrics(
  asset,
  platform,
  lastBalances,
  lastCmc,
  lastTrades,
  lastOpenOrders,
  lastStrategies,
  lastTickers
) {
  const balance = getBalanceBySymbol(asset, lastBalances);
  const currentPrice = getCurrentPrice(lastTickers, asset, platform);
  const cmcValues = getCmcValues(lastCmc);
  const totalSell = getTotalSell(asset, lastTrades);
  const { buyOrders, sellOrders } = filterOpenOrdersBySide(
    lastOpenOrders,
    platform,
    asset
  );
  const { totalAmount, totalBuy, averageEntryPrice } = getTotalAmountAndBuy(
    asset,
    lastTrades
  );

  const baseMetrics = {
    ...DEFAULT_METRICS,
    iconUrl: cmcValues.iconUrl,
    asset,
    rank: cmcValues.rank,
    currentPrice,
    currentPossession: getCurrentPossession(currentPrice, balance),
    totalAmount,
    balance,
    ...cmcValues,
    platform,
  };

  if (stableCoins.includes(asset)) {
    return { ...baseMetrics, status: "stable coin" };
  }

  if (balance === 0 || !isValidStrategies(lastStrategies)) {
    return {
      ...baseMetrics,
      averageEntryPrice,
      totalBuy,
      percentageDifference: getPercentageDifference(currentPrice, averageEntryPrice),
      profit: getProfit(totalBuy, totalSell, currentPrice, balance),
      totalSell,
      nbOpenBuyOrders: buyOrders.length,
      nbOpenSellOrders: sellOrders.length,
    };
  }

  const recups = calculateRecups(asset, platform, totalBuy, totalSell, lastStrategies);
  const amountsAndPrices = calculateAmountsAndPricesForShad(
    recups.recupTp1,
    balance,
    recups.totalShad,
    recups.recupTpX,
    averageEntryPrice,
    recups.maxExposition,
    platform
  );

  return {
    ...baseMetrics,
    ...recups,
    ...amountsAndPrices,
    status: getStatus(sellOrders, ...Object.values(amountsAndPrices)),
    averageEntryPrice,
    totalBuy,
    percentageDifference: getPercentageDifference(currentPrice, averageEntryPrice),
    profit: getProfit(totalBuy, totalSell, currentPrice, balance),
    totalSell,
    nbOpenBuyOrders: buyOrders.length,
    nbOpenSellOrders: sellOrders.length,
    percentToNextTp: (amountsAndPrices.priceTp1 - currentPrice) / currentPrice,
  };
}

/**
 * Filters open orders by type (buy/sell) and platform.
 *
 * @param {Array} orders - List of open orders.
 * @param {string} platform - The platform identifier.
 * @param {string} base - The asset symbol.
 * @returns {Object} - Objects containing lists of buy and sell orders.
 */
function filterOpenOrdersBySide(orders, platform, base) {
  return orders.reduce((acc, order) => {
    if (order.platform === platform && order.symbol.split("/")[0] === base) {
      acc[order.side === "buy" ? "buyOrders" : "sellOrders"].push(order);
    }
    return acc;
  }, { buyOrders: [], sellOrders: [] });
}

/**
 * Checks if the strategies are valid.
 *
 * @param {Object} strategies - The strategies to check.
 * @returns {boolean} - Returns true if it's a non-empty object.
 */
function isValidStrategies(strategies) {
  const isObject = typeof strategies === "object" && strategies !== null;
  const isNotEmpty = isObject && Object.keys(strategies).length > 0;
  return isObject && isNotEmpty;
}

module.exports = {
  calculateAssetMetrics,
};
