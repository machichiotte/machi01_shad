// src/services/cron/balanceProcessor.js
const { calculateAssetMetrics } = require("./metrics/global.js");

const { mapTrades } = require("./mapping.js");
const { fetchCmcInDatabase } = require("../controllers/cmcController.js");
const {
  fetchStratsInDatabase,
} = require("../controllers/strategyController.js");
const {
  fetchTradesInDatabase,
  saveTradesToDatabase,
  fetchLastTrades,
} = require("../controllers/tradesController.js");
const {
  fetchOrdersInDatabase,
  updateOrdersFromServer,
} = require("../controllers/ordersController.js");
const {
  fetchTickersInDatabase,
  getSavedAllTickersByPlatform,
} = require("../controllers/tickersController.js");
const {
  fetchBalancesInDatabase,
} = require("../controllers/balanceController.js");

async function processBalanceChanges(differences, platform) {
  const quoteCurrencies = ["USDT", "BTC", "ETH", "USDC"];

  try {
    const update = await updateOrdersFromServer(platform);
    const newTrades = [];
    const markets = await getSavedAllTickersByPlatform(platform);

    for (const difference of differences) {
      /*console.log(
        `Processing balance difference for base: ${difference.base}`
      );*/

      for (const quote of quoteCurrencies) {
        const base = `${difference.base}/${quote}`;
        const marketExists = markets.some((market) => market.base === base);

        if (marketExists) {
          try {
            const tradeList = await fetchLastTrades(platform, base);
            const mappedTrades = mapTrades(platform, tradeList);
            newTrades.push(...mappedTrades);
          } catch (err) {
            console.error(
              `Error fetching trades for ${base}: ${err.message}`
            );
            continue;
          }
        } else {
          console.log(`Symbol not available: ${base}`);
        }
      }

      if (difference.newSymbol) {
        console.log(`New symbol detected: ${difference.newSymbol}`);
      }
    }

    await saveTradesToDatabase(newTrades);
    console.log("New trades saved to database.");
  } catch (error) {
    console.error(
      `Error handling balance differences for ${platform}:`,
      error
    );
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
    fetchCmcInDatabase(),
    fetchStratsInDatabase(),
    fetchTradesInDatabase(),
    fetchOrdersInDatabase(),
    fetchTickersInDatabase(),
    fetchBalancesInDatabase(),
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

      const filteredCmc =
        lastCmc.find((cmc) => cmc.symbol === assetBase) || {};
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

      console.log(
        `🚀 ~ file: balanceProcessor.js:135 ~ calculateAllMetrics ~ assetSymbol:`,
        assetBase
      );
      console.log(
        `🚀 ~ file: balanceProcessor.js:135 ~ calculateAllMetrics ~ assetPlatform:`,
        assetPlatform
      );

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

function compareBalances(lastBalance, currentBalance) {
  console.log(`🚀 ~ file: balanceProcessor.js:190 ~ compareBalances ~ lastBalance:`, lastBalance.length)
  console.log(
    `🚀 ~ file: balanceProcessor.js:184 ~ compareBalances ~ lastBalance:`,
    lastBalance[0]
  );
  const differences = [];
  for (const current of currentBalance) {
    const last = lastBalance.find(
      (item) =>
        item.base === current.base && item.platform === current.platform
    );

    console.log(
      `🚀 ~ file: balanceProcessor.js:190 ~ compareBalances ~ current.base:`,
      {
        'platform':current.platform,
        'base':current.base,
        'last':last,
      }
    );
    if (last) {
      differences.push({ base: current.base, balanceDifference: true });
    } else {
      differences.push({ base: current.base, newSymbol: true });
    }
  }
  return differences;
}

module.exports = {
  processBalanceChanges,
  calculateAllMetrics,
  compareBalances,
};
