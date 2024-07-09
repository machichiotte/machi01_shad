const { getAllCalculs } = require("../services/metrics/global.js");
const { fetchCmcInDatabase, fetchStratsInDatabase, fetchTradesInDatabase, fetchOrdersInDatabase, fetchTickersInDatabase, fetchBalancesInDatabase } = require("./dataFetcher.js");

async function processBalanceChanges(differences, exchangeId) {
  try {
    const update = await updateOrdersFromServer(exchangeId);
    const newTrades = [];
    const markets = await getSavedAllTickersByExchange(exchangeId);

    for (const difference of differences) {
      console.log(`Processing balance difference for symbol: ${difference.symbol}`);
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
    console.error(`Error handling balance differences for ${exchangeId}:`, error);
    throw error;
  }
}

async function calculateAllMetrics() {
  const [lastCmc, lastStrategies, lastTrades, lastOpenOrders, lastTickers, lastBalances] = await Promise.all([
    fetchCmcInDatabase(),
    fetchStratsInDatabase(),
    fetchTradesInDatabase(),
    fetchOrdersInDatabase(),
    fetchTickersInDatabase(),
    fetchBalancesInDatabase(),
  ]);

  if (!lastCmc || !lastStrategies || !lastTrades || !lastOpenOrders || !lastTickers || !lastBalances) {
    console.error("Error: One or more data retrieval functions returned invalid data.");
    return;
  }

  for (const balance of lastBalances) {
    const assetSymbol = balance.symbol;
    const assetPlatform = balance.platform;

    const filteredCmc = lastCmc.find((cmc) => cmc.symbol === assetSymbol);
    const filteredTrades = lastTrades.filter((trade) => trade.altA === assetSymbol);
    const filteredOpenOrders = lastOpenOrders.filter(
      (order) =>
        order.symbol === assetSymbol + "/USDT" ||
        order.symbol === assetSymbol + "/USDC" ||
        order.symbol === assetSymbol + "/BTC"
    );
    const filteredStrategy = lastStrategies[assetSymbol]?.[assetPlatform];
    const filteredTickers = lastTickers.filter(
      (ticker) => ticker.symbol.startsWith(`${assetSymbol}/`) && ticker.platform === assetPlatform
    );

    const values = getAllCalculs(
      assetSymbol,
      assetPlatform,
      filteredCmc,
      balance,
      filteredTrades,
      filteredOpenOrders,
      filteredStrategy,
      filteredTickers
    );

    console.log(`Calculated values for ${assetSymbol}:`, values.length);
  }
}

function compareBalances(lastBalance, currentBalance) {
  const differences = [];
  const lastBalancesBySymbol = new Map(lastBalance.map((b) => [b.symbol, b]));

  for (const current of currentBalance) {
    const last = lastBalancesBySymbol.get(current.symbol);
    if (last && last.balance !== current.balance && last.platform === current.platform) {
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
