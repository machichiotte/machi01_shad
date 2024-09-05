// src/services/metrics/global.js
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

// ... code existant ...

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
 * Vérifie si les stratégies sont valides.
 *
 * @param {Object} strategies - Les stratégies à vérifier.
 * @returns {boolean} - Retourne vrai si c'est un objet non vide.
 */
function isValidStrategies(strategies) {
  const isObject = typeof strategies === "object" && strategies !== null;
  const isNotEmpty = isObject && Object.keys(strategies).length > 0;
  return isObject && isNotEmpty;
}

module.exports = {
  calculateAssetMetrics,
};
