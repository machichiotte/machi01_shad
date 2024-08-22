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
  return parseFloat(percentageDifference.toFixed(2));
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
 * Get the balance for a given symbol from a balance object.
 *
 * @param {string} base - The symbol for which to get the balance.
 * @param {Object} balanceObj - The object containing balance information.
 * @returns {number} - The balance for the given symbol or 0 if not found or if input is invalid.
 */
function getBalanceBySymbol(base, balanceObj) {
  // Vérification de la validité de l'objet balance
  if (typeof balanceObj !== 'object' || balanceObj === null) {
    console.warn(`balanceObj is invalid: ${balanceObj}`);
    return 0;
  }

  // Vérification si le symbole dans l'objet correspond au symbole donné
  if (balanceObj.base !== base) {
    console.warn(`base not found: ${base}`);
    return 0;
  }

  // Parsing et vérification de la valeur du solde
  const balanceAsNumber = parseFloat(balanceObj.balance);
  if (!isNaN(balanceAsNumber)) {
    return balanceAsNumber;
  } else {
    console.warn(`Invalid balance value for symbol ${base}: ${balanceObj.balance}`);
    return 0;
  }
}

function getProfit(totalBuy, totalSell, currentPrice, balance) {
  const currentPossession = currentPrice * balance;
  return currentPossession + totalSell - totalBuy;
}

module.exports = { getProfit, getBalanceBySymbol, getCurrentPossession, getPercentageDifference, getStatus };
