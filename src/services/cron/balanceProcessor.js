// src/services/cron/balanceProcessor.js
const { calculateAssetMetrics } = require("../../services/metrics/global.js");
const {
  fetchCmcInDatabase,
  fetchStratsInDatabase,
  fetchTradesInDatabase,
  fetchOrdersInDatabase,
  fetchTickersInDatabase,
  fetchBalancesInDatabase,
  getSavedAllTickersByExchange,
  updateOrdersFromServer,
  saveTradesToDatabase,
  fetchLastTrades,
} = require("./dataFetcher.js");

const { mapTrades } = require("../mapping.js");

async function processBalanceChanges(differences, exchangeId) {
  try {
    const update = await updateOrdersFromServer(exchangeId);
    const newTrades = [];
    const markets = await getSavedAllTickersByExchange(exchangeId);

    for (const difference of differences) {
      console.log(
        `Processing balance difference for symbol: ${difference.symbol}`
      );
      const symbol = difference.symbol + "/USDT";
      const marketExists = markets.some((market) => market.symbol === symbol);

      if (marketExists) {
        try {
          const tradeList = await fetchLastTrades(exchangeId, symbol);
          const mappedTrades = mapTrades(exchangeId, tradeList);
          newTrades.push(...mappedTrades);
        } catch (err) {
          console.error(`Error fetching trades for ${symbol}: ${err.message}`);
          continue;
        }
      } else {
        console.log(`Symbol not available: ${symbol}`);
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

  console.log(
    `🚀 ~ file: balanceProcessor.js:53 ~ calculateAllMetrics ~ Data lengths:`,
    {
      lastCmc: lastCmc.length,
      lastStrategies: lastStrategies.length,
      lastTrades: lastTrades.length,
      lastOpenOrders: lastOpenOrders.length,
      lastTickers: lastTickers.length,
      lastBalances: lastBalances.length,
    }
  );

  const allValues = [];

  for (const balance of lastBalances) {
    const assetSymbol = balance.symbol;
    const assetPlatform = balance.platform;

    const filteredCmc = lastCmc.find((cmc) => cmc.symbol === assetSymbol) || {};
    const filteredTrades =
      lastTrades.filter((trade) => trade.altA === assetSymbol) || [];
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
    const filteredTickers =
      lastTickers.filter(
        (ticker) =>
          ticker.symbol.startsWith(`${assetSymbol}/`) &&
          ticker.platform === assetPlatform
      ) || [];
    /*
    console.log(`🚀 ~ file: balanceProcessor.js:67 ~ calculateAllMetrics ~ asset`, {
      assetSymbol,
      assetPlatform,
      filteredCmc: filteredCmc.length,
      filteredTrades: filteredTrades.length,
      filteredOpenOrders: filteredOpenOrders.length,
      filteredStrategy: filteredStrategy.length,
      filteredTickers: filteredTickers.length
    });
      console.log(`🚀 ~ file: balanceProcessor.js:96 ~ calculateAllMetrics ~ filteredTrades:`, filteredTrades)
*/
    if (
      !filteredCmc.length &&
      !filteredTrades.length &&
      !filteredOpenOrders.length &&
      !filteredStrategy.length &&
      !filteredTickers.length
    ) {
      console.warn(`Skipping ${assetSymbol} due to insufficient data.`);
      continue;
    }

    const values = calculateAssetMetrics(
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

  return allValues;
}

function compareBalances(lastBalance, currentBalance) {
  const differences = [];
  const lastBalancesBySymbol = new Map(lastBalance.map((b) => [b.symbol, b]));

  for (const current of currentBalance) {
    const last = lastBalancesBySymbol.get(current.symbol);
    if (
      last &&
      last.balance !== current.balance &&
      last.platform === current.platform
    ) {
      differences.push({ symbol: current.symbol, balanceDifference: true });
    } else if (!last) {
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
