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

/**
 * Récupère le prix actuel d'un actif sur une plateforme donnée.
 *
 * @param {Array} lastTickers - Liste des tickers.
 * @param {string} asset - Le symbole de l'actif.
 * @param {string} platform - L'identifiant de la plateforme.
 * @returns {number|string} - Le prix actuel ou "N/A" si non trouvé.
 */
function getCurrentPrice(lastTickers, asset, platform) {
  const ticker = lastTickers.find(
    (ticker) =>
      ticker.symbol === `${asset}/USDT` && ticker.platform === platform
  );
  return ticker?.last ?? "N/A";
}

/**
 * Récupère toutes les informations de calcul pour un actif.
 *
 * @param {string} asset - Le symbole de l'actif.
 * @param {string} platform - L'identifiant de la plateforme.
 * @param {Array} lastCmc - Données CMC.
 * @param {Array} lastBalances - Soldes.
 * @param {Array} lastTrades - Transactions.
 * @param {Array} lastOpenOrders - Ordres ouverts.
 * @param {Array} lastStrategies - Stratégies.
 * @param {Array} lastTickers - Tickers.
 * @returns {Object} - Objet contenant toutes les informations de calcul.
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
  const cmcValues = getCmcValues(asset, lastCmc);
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
  const percentageDifference = getPercentageDifference(
    currentPrice,
    averageEntryPrice
  );
  const currentPossession = getCurrentPossession(currentPrice, balance);
  const profit = getProfit(totalBuy, totalSell, currentPrice, balance);

  // Handle stablecoin case
  if (stableCoins.includes(asset)) {
    return {
      iconUrl: cmcValues.iconUrl,
      asset,
      status: "stable coin",
      strat: "N/A",
      ratioShad: "N/A",
      totalShad: "N/A",
      rank: cmcValues.rank,
      averageEntryPrice: "N/A",
      totalBuy: "N/A",
      maxExposition: "N/A",
      percentageDifference: "N/A",
      currentPrice,
      currentPossession,
      profit: "N/A",
      totalSell: "N/A",
      recupShad: "N/A",
      nbOpenBuyOrders: "N/A",
      nbOpenSellOrders: "N/A",
      totalAmount,
      balance,
      recupTp1: "N/A",
      recupTpX: "N/A",
      tp1: "N/A",
      tp2: "N/A",
      tp3: "N/A",
      tp4: "N/A",
      tp5: "N/A",
      percentToNextTp: "N/A",
      ...cmcValues,
       platform,
    };
  }

  // Handle non-stablecoin case
  if (balance === 0 || !isValidStrategies(lastStrategies)) {
    return {
      iconUrl: cmcValues.iconUrl,
      asset,
      status: "N/A",
      strat: "N/A",
      ratioShad: "N/A",
      totalShad: "N/A",
      rank: cmcValues.rank,
      averageEntryPrice,
      totalBuy,
      maxExposition: "N/A",
      percentageDifference,
      currentPrice,
      currentPossession,
      profit,
      totalSell,
      recupShad: "N/A",
      nbOpenBuyOrders: buyOrders.length,
      nbOpenSellOrders: sellOrders.length,
      totalAmount,
      balance,
      recupTp1: "N/A",
      recupTpX: "N/A",
      tp1: "N/A",
      tp2: "N/A",
      tp3: "N/A",
      tp4: "N/A",
      tp5: "N/A",
      percentToNextTp: "N/A",
      ...cmcValues,
       platform,
    };
  }

  const recups = calculateRecups(
    asset,
    platform,
    totalBuy,
    totalSell,
    lastStrategies
  );
  const amountsAndPrices = calculateAmountsAndPricesForShad(
    recups.recupTp1,
    balance,
    recups.totalShad,
    recups.recupTpX,
    averageEntryPrice,
    recups.maxExposition, 
    platform
  );

  const status = getStatus(
    sellOrders,
    amountsAndPrices.amountTp1,
    amountsAndPrices.amountTp2,
    amountsAndPrices.amountTp3,
    amountsAndPrices.amountTp4,
    amountsAndPrices.amountTp5,
    amountsAndPrices.priceTp1,
    amountsAndPrices.priceTp2,
    amountsAndPrices.priceTp3,
    amountsAndPrices.priceTp4,
    amountsAndPrices.priceTp5
  );
  
  const percentToNextTp =
    (amountsAndPrices.priceTp1 - currentPrice) / currentPrice;

  return {
    iconUrl: cmcValues.iconUrl,
    asset,
    status,
    strat: recups.strat,
    ratioShad: recups.ratioShad,
    totalShad: recups.totalShad,
    rank: cmcValues.rank,
    averageEntryPrice,
    totalBuy,
    maxExposition: recups.maxExposition,
    percentageDifference,
    currentPrice,
    currentPossession,
    profit,
    totalSell,
    recupShad: recups.recupShad,
    nbOpenBuyOrders: buyOrders.length,
    nbOpenSellOrders: sellOrders.length,
    totalAmount,
    balance,
    recupTp1: recups.recupTp1,
    recupTpX: recups.recupTpX,
    ...amountsAndPrices,
    ...cmcValues,
    platform,
    percentToNextTp,
  };
}

/**
 * Filtre les ordres ouverts par type (achat/vente) et plateforme.
 *
 * @param {Array} orders - Liste des ordres ouverts.
 * @param {string} platform - L'identifiant de la plateforme.
 * @param {string} asset - Le symbole de l'actif.
 * @returns {Object} - Objets contenant les listes d'ordres d'achat et de vente.
 */
function filterOpenOrdersBySide(orders, platform, asset) {
  const buyOrders = orders.filter(
    (order) => order.side === "buy" && order.platform === platform
  );
  const sellOrders = orders.filter(
    (order) => order.side === "sell" && order.platform === platform
  );

  const openBuyOrders = buyOrders.filter((order) => {
    const [leftSymbol] = order.symbol.split("/");
    return leftSymbol === asset;
  });

  const openSellOrders = sellOrders.filter((order) => {
    const [leftSymbol] = order.symbol.split("/");
    return leftSymbol === asset;
  });

  return { buyOrders: openBuyOrders, sellOrders: openSellOrders };
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
