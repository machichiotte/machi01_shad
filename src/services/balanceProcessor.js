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
  getSavedAllTickersByExchange,
} = require("../controllers/tickersController.js");
const {
  fetchBalancesInDatabase,
} = require("../controllers/balanceController.js");

async function processBalanceChanges(differences, exchangeId) {
  const quoteCurrencies = ["USDT", "BTC", "ETH", "USDC"];

  try {
    const update = await updateOrdersFromServer(exchangeId);
    const newTrades = [];
    const markets = await getSavedAllTickersByExchange(exchangeId);

    for (const difference of differences) {
      console.log(
        `Processing balance difference for symbol: ${difference.symbol}`
      );

      for (const quote of quoteCurrencies) {
        const symbol = `${difference.symbol}/${quote}`;
        const marketExists = markets.some((market) => market.symbol === symbol);

        if (marketExists) {
          try {
            const tradeList = await fetchLastTrades(exchangeId, symbol);
            const mappedTrades = mapTrades(exchangeId, tradeList);
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

    await saveTradesToDatabase(newTrades);
    console.log("New trades saved to database.");
  } catch (error) {
    console.error(
      `Error handling balance differences for ${exchangeId}:`,
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
      const assetSymbol = balance.symbol;
      const assetPlatform = balance.platform;

      const filteredCmc =
        lastCmc.find((cmc) => cmc.symbol === assetSymbol) || {};
      const filteredTrades =
        lastTrades.filter((trade) => trade.base === assetSymbol) || [];
      const filteredOpenOrders =
        lastOpenOrders.filter(
          (order) =>
            order.symbol === assetSymbol + "/USDT" ||
            order.symbol === assetSymbol + "/USDC" ||
            order.symbol === assetSymbol + "/BTC"
        ) || [];
      const filteredStrategy =
        lastStrategies.find(
          (strategy) =>
            strategy.asset === assetSymbol && strategy.strategies[assetPlatform]
        ) || {};

      console.log(
        `🚀 ~ file: balanceProcessor.js:135 ~ calculateAllMetrics ~ assetSymbol:`,
        assetSymbol
      );
      console.log(
        `🚀 ~ file: balanceProcessor.js:135 ~ calculateAllMetrics ~ assetPlatform:`,
        assetPlatform
      );

      const filteredTickers =
        lastTickers.filter(
          (ticker) =>
            ticker.symbol.startsWith(`${assetSymbol}/`) &&
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
        if (assetSymbol === "USDT" || assetSymbol === "USDC") {
          values = calculateAssetMetrics(
            assetSymbol,
            assetPlatform,
            balance,
            [],
            [],
            [],
            [],
            filteredTickers
          );
        } else {
          console.warn(`Skipping ${assetSymbol} due to insufficient data.`);
          continue;
        }
      }

      values = calculateAssetMetrics(
        assetSymbol,
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
  console.log(
    `🚀 ~ file: balanceProcessor.js:184 ~ compareBalances ~ lastBalance:`,
    lastBalance
  );
  const differences = [];
  // const lastBalancesBySymbol = new Map(lastBalance.map((b) => [b.symbol, b]));
  // console.log(`🚀 ~ file: balanceProcessor.js:186 ~ compareBalances ~ lastBalancesBySymbol:`, lastBalancesBySymbol)

  for (const current of currentBalance) {
    const last = lastBalance.find(
      (item) =>
        item.symbol === current.symbol && item.platform === current.platform
    );

    console.log(
      `🚀 ~ file: balanceProcessor.js:190 ~ compareBalances ~ current.symbol:`,
      current.platform
    );
    console.log(
      `🚀 ~ file: balanceProcessor.js:190 ~ compareBalances ~ current.symbol:`,
      current.symbol
    );
    console.log(
      `🚀 ~ file: balanceProcessor.js:190 ~ compareBalances ~ last:`,
      last
    );
    if (last) {
      differences.push({ symbol: current.symbol, balanceDifference: true });
    } else {
      differences.push({ symbol: current.symbol, newSymbol: true });
    }
  }
  return differences;
}

module.exports = {
  processBalanceChanges,
  calculateAllMetrics,
  compareBalances,
};
