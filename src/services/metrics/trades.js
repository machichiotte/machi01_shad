// src/js/metrics/trades.js

/**
 * Calculate the total amount, total buy value, and average entry price from trades.
 * @param {string} symbol - The trading symbol to filter trades by.
 * @param {Array} trades - The array of trade objects.
 * @returns {Object} - An object containing total amount, total buy value, and average entry price.
 */
function getTotalAmountAndBuy(symbol, trades) {
  // Helper function to validate if a value is a positive number
  const isPositiveNumber = (value) => {
      return typeof value === 'number' && !isNaN(value) && value > 0;
  };

  // Helper function to convert fee to quote value
  const convertFeeToQuote = (fee, price) => {
      return isPositiveNumber(fee) && isPositiveNumber(price)
          ? parseFloat(fee) * parseFloat(price)
          : 0;
  };

  const filteredTrades = trades.filter(
      (trade) => trade.base === symbol && trade.type === "buy"
  );

  // Calculate the total buy value including fees
  const totalBuy = filteredTrades.reduce((total, trade) => {
      const fee = parseFloat(trade.fee);
      const price = parseFloat(trade.price);
      
      // Default to zero if fee is not a positive number
      const feeInQuote = trade.feecoin === trade.quote
          ? (isPositiveNumber(fee) ? fee : 0)
          : convertFeeToQuote(fee, price);

      return total + parseFloat(trade.totalUSDT) + feeInQuote;
  }, 0);

  // Calculate the total amount
  const totalAmount = filteredTrades.reduce(
      (total, trade) => total + (isPositiveNumber(parseFloat(trade.amount)) ? parseFloat(trade.amount) : 0),
      0
  );

  // Calculate the average entry price
  const averageEntryPrice = (
      totalAmount > 0
      ? parseFloat(totalBuy) / parseFloat(totalAmount)
      : 0
  ).toFixed(8);

  //todo
  return {
      totalAmount: parseFloat(totalAmount),
      totalBuy: parseFloat(totalBuy),
      averageEntryPrice: parseFloat(averageEntryPrice),
  };
}

/**
 * Calculate the total sell value for a given symbol, adjusting for fees.
 * @param {string} symbol - The trading symbol to filter trades by.
 * @param {Array} trades - The array of trade objects.
 * @returns {number} - The total sell value after adjusting for fees.
 */
function getTotalSell(symbol, trades) {
  // Helper function to validate if a value is a positive number
  const isPositiveNumber = (value) => {
      return typeof value === 'number' && !isNaN(value) && value > 0;
  };

  // Helper function to convert fee from base to quote
  const convertFeeToQuote = (fee, price) => {
      return isPositiveNumber(fee) && isPositiveNumber(price)
          ? parseFloat(fee) * parseFloat(price)
          : 0;
  };

  // Filter trades to include only sells for the specified symbol
  const filteredTrades = trades.filter(
      (trade) => trade.base === symbol && trade.type === "sell"
  );

  // Calculate total sell value considering fees
  const sellTotal = filteredTrades.reduce((total, trade) => {
      const fee = parseFloat(trade.fee);
      const price = parseFloat(trade.price);
      
      // Adjust fee in quote currency based on fee type
      const feeInQuote = trade.feecoin === trade.quote
          ? (isPositiveNumber(fee) ? fee : 0)
          : convertFeeToQuote(fee, price);

      return total + parseFloat(trade.totalUSDT) - feeInQuote;
  }, 0);

  //todo
  //return parseFloat(sellTotal).toFixed(2);
  return parseFloat(sellTotal);
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
