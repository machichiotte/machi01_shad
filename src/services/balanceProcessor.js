// src/services/cron/balanceProcessor.js
const { calculateAssetMetrics } = require("./metrics/global.js");

const { mapTrades } = require("./mapping.js");
const { fetchDatabaseCmc } = require("../controllers/cmcController.js");
const {
  fetchDatabaseStrategies,
} = require("../controllers/strategyController.js");
const {
  fetchDatabaseTrades,
  saveTradesToDatabase,
  fetchLastTrades,
} = require("../controllers/tradesController.js");
const {
  fetchOrdersInDatabase,
  updateOrdersFromServer,
} = require("../controllers/ordersController.js");
const {
  fetchDatabaseTickers,
  getSavedAllTickersByPlatform,
} = require("../controllers/tickersController.js");
const {
  fetchDatabaseBalances,
} = require("../controllers/balanceController.js");
const { getSymbolForPlatform } = require("../utils/platformUtil.js");

async function processBalanceChanges(differences, platform) {
  const quoteCurrencies = ["USDT", "BTC", "ETH", "USDC"];

  try {
    const update = await updateOrdersFromServer(platform);
    const newTrades = [];
    //todo ici cest markets pas tickers
    const tickers = await getSavedAllTickersByPlatform(platform);

    for (const difference of differences) {
      for (const quote of quoteCurrencies) {
        const symbol = getSymbolForPlatform(platform, difference.base, quote);
        const marketExists = tickers.find(
          (ticker) =>
            ticker.symbol === difference.base + "/" + quote &&
            ticker.platform === platform
        );

        if (marketExists) {
          try {
            const tradeList = await fetchLastTrades(platform, symbol);
            const mappedTrades = mapTrades(platform, tradeList);
            newTrades.push(...mappedTrades);
          } catch (err) {
            console.error(
              `Error fetching trades for ${symbol}: ${err.message}`
            );
            continue;
          }
        } else {
          console.log(`Symbol not available: ${symbol}`);
        }
      }

      if (difference.newSymbol) {
        console.log(`New symbol detected: ${difference.newSymbol}`);
      }
    }
    if (newTrades.length > 0) await saveTradesToDatabase(newTrades);
  } catch (error) {
    console.error(`Error handling balance differences for ${platform}:`, error);
    throw error;
  }
}

async function calculateAllMetrics() {
  const [
    lastCmc,
    lastStrategies,
    lastTrades,
    lastOpenOrders,
    lastTickers,
    lastBalances,
  ] = await Promise.all([
    fetchDatabaseCmc(),
    fetchDatabaseStrategies(),
    fetchDatabaseTrades(),
    fetchOrdersInDatabase(),
    fetchDatabaseTickers(),
    fetchDatabaseBalances(),
  ]);

  if (
    !lastCmc ||
    !lastStrategies ||
    !lastTrades ||
    !lastOpenOrders ||
    !lastTickers ||
    !lastBalances
  ) {
    console.error(
      "Error: One or more data retrieval functions returned invalid data."
    );
    return [];
  }
  const allValues = [];

  for (const balance of lastBalances) {
    if (balance.balance != "" && balance.balance > 0) {
      const assetBase = balance.base;
      const assetPlatform = balance.platform;

      const filteredCmc = lastCmc.find((cmc) => cmc.symbol === assetBase) || {};
      const filteredTrades =
        lastTrades.filter((trade) => trade.base === assetBase) || [];
      const filteredOpenOrders =
        lastOpenOrders.filter(
          (order) =>
            order.symbol === assetBase + "/USDT" ||
            order.symbol === assetBase + "/USDC" ||
            order.symbol === assetBase + "/BTC"
        ) || [];
      const filteredStrategy =
        lastStrategies.find(
          (strategy) =>
            strategy.asset === assetBase && strategy.strategies[assetPlatform]
        ) || {};

      const filteredTickers =
        lastTickers.filter(
          (ticker) =>
            ticker.symbol.startsWith(`${assetBase}/`) &&
            ticker.platform === assetPlatform
        ) || [];

      let values;
      if (
        !filteredCmc.length &&
        !filteredTrades.length &&
        !filteredOpenOrders.length &&
        !filteredStrategy.length &&
        !filteredTickers.length
      ) {
        if (assetBase === "USDT" || assetBase === "USDC") {
          values = calculateAssetMetrics(
            assetBase,
            assetPlatform,
            balance,
            [],
            [],
            [],
            [],
            filteredTickers
          );
        } else {
          console.warn(`Skipping ${assetBase} due to insufficient data.`);
          continue;
        }
      }

      values = calculateAssetMetrics(
        assetBase,
        assetPlatform,
        balance,
        filteredCmc,
        filteredTrades,
        filteredOpenOrders,
        filteredStrategy,
        filteredTickers
      );

      //console.log(`calculateAllMetrics values for ${assetSymbol}:`, values);
      allValues.push(values);
    }
  }

  return allValues;
}

/**
 * Compare les balances actuelles avec celles de la base de données précédente.
 * @param {Object[]} lastBalances - Tableau d'objets représentant les balances précédentes.
 * @param {Object[]} currentBalances - Tableau d'objets représentant les balances actuelles.
 * @returns {Object[]} - Retourne un tableau d'objets représentant les différences trouvées.
 */
function compareBalances(lastBalances, currentBalances) {
  const differences = [];

  currentBalances.forEach((currentBalance) => {
    const { platform, base, balance: currentBalanceValue } = currentBalance;

    const matchedBalance = lastBalances.find(
      (item) => item.platform === platform && item.base === base
    );

    if (!matchedBalance) {
      // Nouveau symbole trouvé
      console.log(`🚀 ~ compareBalances ~ newSymbol: ${base}`);

      differences.push({
        base,
        platform,
        newSymbol: true,
      });
    } else if (matchedBalance.balance !== currentBalanceValue) {
      // Différence de balance trouvée
      console.log(`🚀 ~ compareBalances ~ unmatchedBalance: ${base}`);

      differences.push({
        base,
        platform,
        balanceDifference: true,
      });
    }
    // Pas besoin de traiter les cas où les balances sont identiques (laissons simplement la boucle continuer).
  });

  return differences;
}

module.exports = {
  processBalanceChanges,
  calculateAllMetrics,
  compareBalances,
};
