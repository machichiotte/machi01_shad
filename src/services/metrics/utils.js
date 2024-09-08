// src/js/metrics/utils.js

const THRESHOLD = 0.01; // 1% threshold

/**
 * Calcule la possession actuelle en fonction du prix actuel et du solde.
 * @param {number} currentPrice - Le prix actuel.
 * @param {number} balance - Le solde.
 * @returns {number} La possession actuelle arrondie à deux décimales.
 */
function getCurrentPossession(currentPrice, balance) {
  return Math.round(currentPrice * balance * 100) / 100;
}

/**
 * Calcule la différence en pourcentage entre deux valeurs.
 * @param {number|string} newValue - La nouvelle valeur.
 * @param {number|string} oldValue - L'ancienne valeur.
 * @returns {number|string} La différence en pourcentage ou "N/A" si invalide.
 */
function getPercentageDifference(newValue, oldValue) {
  const [newVal, oldVal] = [parseFloat(newValue), parseFloat(oldValue)];

  if (isNaN(newVal) || isNaN(oldVal) || oldVal === 0) return "N/A";

  return parseFloat(((newVal - oldVal) / oldVal).toFixed(2));
}

/**
 * Calcule le profit en fonction des achats totaux, des ventes totales, du prix actuel et du solde.
 * @param {number} totalBuy - Le total des achats.
 * @param {number} totalSell - Le total des ventes.
 * @param {number} currentPrice - Le prix actuel.
 * @param {number} balance - Le solde.
 * @returns {number} Le profit calculé ou NaN si les entrées sont invalides.
 */
function getProfit(totalBuy, totalSell, currentPrice, balance) {
  if ([totalBuy, totalSell, currentPrice, balance].some(isNaN)) return NaN;

  return currentPrice * balance + totalSell - totalBuy;
}

/**
 * Récupère le solde pour un symbole donné à partir d'un objet de solde.
 * @param {string} base - Le symbole de base.
 * @param {Object} balanceObj - L'objet contenant les informations de solde.
 * @returns {number} Le solde pour le symbole donné ou 0 si invalide.
 */
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

/**
 * Détermine le statut des ordres de vente ouverts par rapport aux valeurs TP.
 * @param {Array} openSellOrders - Les ordres de vente ouverts.
 * @param {...number} tpValues - Les valeurs TP.
 * @returns {Array} Un tableau de résultats indiquant le statut de chaque ordre.
 */
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