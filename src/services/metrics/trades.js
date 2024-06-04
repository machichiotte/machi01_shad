// src/js/metrics/trades.js
function getTotalAmountAndBuy(symbol, trades) {
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
    totalAmount,
    totalBuy: totalBuy.toFixed(2),
    averageEntryPrice,
  };
}

function getTotalSell(symbol, trades) {
  // Implementation for getting the total sell amount for a given symbol
  const filteredTrades = trades.filter(
    (trade) => trade.altA === symbol && trade.type === "sell"
  );
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
