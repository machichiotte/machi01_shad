// src/js/metrics/utils.js

const THRESHOLD = 0.01; // 1% threshold

function getCurrentPossession(currentPrice, balance) {
  return Math.round(currentPrice * balance * 100) / 100;
}

function getPercentageDifference(newValue, oldValue) {
  const [newVal, oldVal] = [parseFloat(newValue), parseFloat(oldValue)];

  if (isNaN(newVal) || isNaN(oldVal) || oldVal === 0) return "N/A";

  return parseFloat(((newVal - oldVal) / oldVal).toFixed(2));
}

function getProfit(totalBuy, totalSell, currentPrice, balance) {
  if ([totalBuy, totalSell, currentPrice, balance].some(isNaN)) return NaN;

  return currentPrice * balance + totalSell - totalBuy;
}

function getBalanceBySymbol(base, balanceObj) {
  if (typeof balanceObj !== "object" || balanceObj === null) {
    console.warn(`balanceObj is invalid: ${balanceObj}`);
    return 0;
  }

  if (balanceObj.base !== base) {
    console.warn(`base not found: ${base}`);
    return 0;
  }

  const balanceAsNumber = parseFloat(balanceObj.balance);
  if (!isNaN(balanceAsNumber)) return balanceAsNumber;

  console.warn(`Invalid balance value for symbol ${base}: ${balanceObj.balance}`);
  return 0;
}

function getStatus(openSellOrders, ...tpValues) {
  const isClose = (value1, value2) => Math.abs((value1 - value2) / value1) <= THRESHOLD;
  const results = new Array(5).fill(0);

  openSellOrders.forEach((order) => {
    for (let i = 0; i < 5; i++) {
      if (isClose(order.amount, tpValues[i]) && isClose(order.price, tpValues[i + 5])) {
        results[i] = 1;
      }
    }
  });

  return results;
}

module.exports = {
  getCurrentPossession,
  getPercentageDifference,
  getProfit,
  getBalanceBySymbol,
  getStatus,
};