// src/js/metrics/utils.js
function getCurrentPossession(currentPrice, balance) {
  return Math.round(currentPrice * balance, 2);
}

function getPercentageDifference(newValue, oldValue) {
  const newVal = parseFloat(newValue);
  const oldVal = parseFloat(oldValue);

  if (isNaN(newVal) || isNaN(oldVal) || oldVal === 0) {
    return "N/A";
  }

  const percentageDifference = ((newVal - oldVal) / oldVal);
  return percentageDifference.toFixed(2);
}

function getStatus(
  openSellOrders,
  amountTp1,
  amountTp2,
  amountTp3,
  amountTp4,
  amountTp5,
  priceTp1,
  priceTp2,
  priceTp3,
  priceTp4,
  priceTp5
) {
  const THRESHOLD = 0.01; // 1% threshold

  // Fonction pour vérifier si deux valeurs sont proches l'une de l'autre avec une marge d'erreur
  const isClose = (value1, value2) => {
    return Math.abs((value1 - value2) / value1) <= THRESHOLD;
  };

  // Initialiser un tableau de résultats avec des valeurs par défaut à 0
  const results = [0, 0, 0, 0, 0];

  // Vérifier chaque paire d'openSellOrders par rapport à chaque paire d'amount et price
  openSellOrders.forEach((order) => {
    if (isClose(order.amount, amountTp1) && isClose(order.price, priceTp1)) {
      results[0] = 1;
    }
    if (isClose(order.amount, amountTp2) && isClose(order.price, priceTp2)) {
      results[1] = 1;
    }
    if (isClose(order.amount, amountTp3) && isClose(order.price, priceTp3)) {
      results[2] = 1;
    }
    if (isClose(order.amount, amountTp4) && isClose(order.price, priceTp4)) {
      results[3] = 1;
    }
    if (isClose(order.amount, amountTp5) && isClose(order.price, priceTp5)) {
      results[4] = 1;
    }
  });

  return results;
}

/**
 * Get the balance for a given symbol from sortedBalances.
 *
 * @param {string} symbol - The symbol for which to get the balance.
 * @param {Array} balances - The array of balances.
 * @returns {number|string} - The balance for the given symbol or "N/A" if not found or if input is invalid.
 */
function getBalance(symbol, balances) {
  // Vérifier que sortedBalances est un tableau et qu'il contient des éléments
  if (!Array.isArray(balances) || balances.length === 0) {
    console.warn(`balances is invalid or empty: ${balances}`);
    return "N/A";
  }

  // Rechercher le balance correspondant au symbole
  const balanceItem = balances.find((item) => item.symbol === symbol);

  // Retourner le balance s'il existe, sinon "N/A"
  return balanceItem ? balanceItem.balance : "N/A";
} 

function getProfit(totalBuy, totalSell, currentPrice, balance) {
  const currentPossession = currentPrice * balance;
  return currentPossession + totalSell - totalBuy;
}

module.exports = { getProfit, getBalance, getCurrentPossession, getPercentageDifference, getStatus };
