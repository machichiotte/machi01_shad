// src/js/metrics/trades.js
function getTotalAmountAndBuy(symbol, trades) {
  //TODO ICI SYMBOL A UN SLASHHHHHH
  const filteredTrades = trades.filter(
    (trade) => trade.altA === symbol && trade.type === "buy"
  );
  const totalBuy = filteredTrades.reduce(
    (total, trade) => total + parseFloat(trade.totalUSDT),
    0
  );
  const totalAmount = filteredTrades.reduce(
    (total, trade) => total + parseFloat(trade.amount),
    0
  );

  const averageEntryPrice = (
    parseFloat(totalBuy) / parseFloat(totalAmount)
  ).toFixed(8);

  return {
    totalAmount: parseFloat(totalAmount),
    totalBuy: Math.round(parseFloat(totalBuy, 2)),
    averageEntryPrice: parseFloat(averageEntryPrice),
  };
}

function getTotalSell(symbol, trades) {
  // Implementation for getting the total sell amount for a given symbol
  const filteredTrades = trades.filter(
    (trade) => trade.altA === symbol && trade.type === "sell"
  );
  //console.log(`🚀 ~ file: trades.js:32 ~ getTotalSell ~ filteredTrades:`, filteredTrades.length)
  const sellTotal = filteredTrades.reduce(
    (total, trade) => total + parseFloat(trade.totalUSDT),
    0
  );

  return Math.round(sellTotal, 2);
}

function getTradesHistory(symbol, trades) {
  // Implementation for getting the trades history for a given symbol
  return trades.filter((trade) => trade.altA === symbol);
}

module.exports = {
  getTotalAmountAndBuy,
  getTotalSell,
  getTradesHistory,
};
