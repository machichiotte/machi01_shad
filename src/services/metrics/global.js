// src/js/metrics/global.js
const {
  calculateRecups,
  calculateAmountsAndPricesForShad,
} = require("./strategies.js");
const { getCmcValues } = require("./cmc.js");
const {
  getBalance,
  getProfit,
  getCurrentPossession,
  getPercentageDifference,
  getStatus,
} = require("./utils.js");
const { getTotalAmountAndBuy, getTotalSell } = require("./trades.js");

/**
 * Récupère le prix actuel d'un actif sur une plateforme donnée.
 *
 * @param {Array} lastTickers - Liste des tickers.
 * @param {string} asset - Le symbole de l'actif.
 * @param {string} exchangeId - L'identifiant de la plateforme.
 * @returns {number|string} - Le prix actuel ou "N/A" si non trouvé.
 */
function getCurrentPrice(lastTickers, asset, exchangeId) {
  // Cherche le ticker correspondant à l'actif et à la plateforme
  const ticker = lastTickers.find(
    (ticker) =>
      ticker.symbol === `${asset}/USDT` && ticker.platform === exchangeId
  );

  // Retourne la valeur 'last' si trouvée, sinon retourne "N/A"
  return ticker?.last ?? "N/A";
}

function getAllCalculs(
  asset,
  exchangeId,
  lastCmc,
  lastBalance,
  lastTrades,
  lastOpenOrders,
  lastStrategies,
  lastTickers
) {
  //TODO add cmc, trades, strats, buyOrders, sellOrders
  console.log("🚀 ~ asset:", asset);

  const symbol = asset + "/USDT";
  const balance = getBalance(asset, lastBalance);
  console.log("🚀 ~ balance:", balance);

  const {
    rank,
    iconUrl,
    cryptoPercentChange24h,
    cryptoPercentChange7d,
    cryptoPercentChange30d,
    cryptoPercentChange60d,
    cryptoPercentChange90d,
  } = getCmcValues(asset, lastCmc);

  console.log("🚀 ~ rank:", rank);

  const currentPrice = getCurrentPrice(lastTickers, asset, exchangeId);
  console.log("🚀 ~ currentPrice:", currentPrice);

  const totalSell = getTotalSell(asset, lastTrades);

  const buyOrders = lastOpenOrders.filter(
    (order) => order.side === "buy" && order.platform === exchangeId
  );
  const sellOrders = lastOpenOrders.filter(
    (order) => order.side === "sell" && order.platform === exchangeId
  );

  const openBuyOrders = buyOrders.filter((order) => {
    const [leftSymbol] = order.symbol.split("/");
    return leftSymbol === asset;
  });

  const openSellOrders = sellOrders.filter((order) => {
    const [leftSymbol] = order.symbol.split("/");
    return leftSymbol === asset;
  });
  console.log("🚀 ~ openSellOrders:", openSellOrders.length);

  const { totalAmount, totalBuy, averageEntryPrice } = getTotalAmountAndBuy(
    symbol,
    lastTrades
  );

  const currentPossession = getCurrentPossession(currentPrice, balance);
  const profit = getProfit(totalBuy, totalSell, currentPrice, balance);

  const {
    strat,
    stratExpo,
    maxExposition,
    ratioShad,
    recupTpX,
    recupShad,
    recupTp1,
    totalShad,
  } = calculateRecups(asset, exchangeId, totalBuy, totalSell, lastStrategies);

  const {
    amountTp1,
    amountTp2,
    amountTp3,
    amountTp4,
    amountTp5,
    priceTp1,
    priceTp2,
    priceTp3,
    priceTp4,
    priceTp5,
  } = calculateAmountsAndPricesForShad(
    recupTp1,
    balance,
    totalShad,
    recupTpX,
    averageEntryPrice,
    maxExposition
  );

  const percentageDifference = getPercentageDifference(
    currentPrice,
    averageEntryPrice
  );

  const status = getStatus(
    openSellOrders,
    amountTp1,
    amountTp2,
    amountTp3,
    amountTp4,
    amountTp5,
    priceTp1,
    priceTp2,
    priceTp3,
    priceTp4,
    priceTp5
  );

  const percentToNextTp = (priceTp1 - currentPrice) / currentPrice;

  return {
    iconUrl,
    asset: symbol,
    status,
    strat,
    ratioShad,
    totalShad,
    rank,
    averageEntryPrice,
    totalBuy,
    maxExposition,
    percentageDifference,
    currentPrice,
    currentPossession,
    profit,
    totalSell,
    recupShad,
    nbOpenBuyOrders: openBuyOrders.length,
    nbOpenSellOrders: openSellOrders.length,
    totalAmount,
    balance,
    recupTp1,
    recupTpX,
    amountTp1,
    priceTp1,
    amountTp2,
    priceTp2,
    amountTp3,
    priceTp3,
    amountTp4,
    priceTp4,
    amountTp5,
    priceTp5,
    cryptoPercentChange24h,
    cryptoPercentChange7d,
    cryptoPercentChange30d,
    cryptoPercentChange60d,
    cryptoPercentChange90d,
    exchangeId,
    percentToNextTp,
  };
}

module.exports = {
  getAllCalculs,
};
