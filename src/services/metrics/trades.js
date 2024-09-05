// src/js/metrics/trades.js
const isPositiveNumber = (value) => typeof value === 'number' && !isNaN(value) && value > 0;
const convertFeeToQuote = (fee, price) => isPositiveNumber(fee) && isPositiveNumber(price) ? fee * price : 0;

/**
 * Calculate the total amount, total buy value, and average entry price from trades.
 * @param {string} symbol - The trading symbol to filter trades by.
 * @param {Array} trades - The array of trade objects.
 * @returns {Object} - An object containing total amount, total buy value, and average entry price.
 */
function getTotalAmountAndBuy(symbol, trades) {
    const filteredTrades = trades.filter(trade => trade.base === symbol && trade.type === "buy");
    
    return filteredTrades.reduce((acc, trade) => {
      const fee = parseFloat(trade.fee);
      const price = parseFloat(trade.price);
      const feeInQuote = trade.feecoin === trade.quote ? (isPositiveNumber(fee) ? fee : 0) : convertFeeToQuote(fee, price);
      const amount = isPositiveNumber(parseFloat(trade.amount)) ? parseFloat(trade.amount) : 0;
  
      acc.totalBuy += parseFloat(trade.totalUSDT) + feeInQuote;
      acc.totalAmount += amount;
  
      return acc;
    }, { totalAmount: 0, totalBuy: 0 });
  }

/**
 * Calculate the total sell value for a given symbol, adjusting for fees.
 * @param {string} symbol - The trading symbol to filter trades by.
 * @param {Array} trades - The array of trade objects.
 * @returns {number} - The total sell value after adjusting for fees.
 */
function getTotalSell(symbol, trades) {
  return trades
    .filter((trade) => trade.base === symbol && trade.type === "sell")
    .reduce((total, trade) => {
      const fee = parseFloat(trade.fee);
      const price = parseFloat(trade.price);
      const feeInQuote =
        trade.feecoin === trade.quote
          ? isPositiveNumber(fee)
            ? fee
            : 0
          : convertFeeToQuote(fee, price);
      return total + parseFloat(trade.totalUSDT) - feeInQuote;
    }, 0);
}

function getTradesHistory(symbol, trades) {
  // Implementation for getting the trades history for a given symbol
  return trades.filter((trade) => trade.base === symbol);
}

module.exports = {
  getTotalAmountAndBuy,
  getTotalSell,
  getTradesHistory,
};
