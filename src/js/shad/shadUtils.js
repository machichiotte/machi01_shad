// src/js/shadUtils.js

// src/js/shadUtils.js

import {
  BINANCE_PLATFORM_ID,
  HTX_PLATFORM_ID,
  BINANCE_THRESHOLD,
  HTX_THRESHOLD,
} from '../shad/constants.js'

/**
 * Calculate the price threshold based on the current price and a given threshold.
 * @param {number} currentPrice - The current price.
 * @param {number} threshold - The threshold to apply.
 * @returns {number} - The calculated price threshold.
 */
export const calculatePriceThreshold = (currentPrice, threshold) => currentPrice * threshold;

/**
 * Count consecutive occurrences of the value '1' in the status array.
 * @param {Array<number>} status - The array of status values.
 * @returns {number} - The count of consecutive pairs.
 */
export const countConsecutivePairs = (status) => status.filter(value => value === 1).length;

/**
 * Determine the status of an asset based on its current data and trading conditions.
 * @param {Object} data - The data object containing asset and trading information.
 * @returns {Object} - An object containing severity and label for the status.
 */
export function getStatus(data) {
  const { currentPrice, platform, status, nbOpenSellOrders, priceTp1, priceTp2 } = data;

  if (status === 'stable coin') {
    return { severity: 'secondary', label: 'stable coin' };
  }

  if (!Array.isArray(status)) {
    console.warn('data.status is not an array:', status);
    return { severity: 'warning', label: `STATUS ERROR` };
  }

  const totalOrders = status.reduce((acc, val) => acc + val, 0);

  if (nbOpenSellOrders === 0) {
    return { severity: 'danger', label: "Pas d'ordres ouverts" };
  } else if (currentPrice > priceTp1) {
    return priceTp1 < priceTp2
      ? { severity: 'info', label: 'Tu peux vendre depuis un moment' }
      : { severity: 'danger', label: 'tp2 < tp1' };
  }

  if (totalOrders === 5) {
    return { severity: 'success', label: '5 ordres placés' };
  }

  const platformThreshold = platform === BINANCE_PLATFORM_ID ? BINANCE_THRESHOLD : HTX_THRESHOLD;
  const priceThreshold = calculatePriceThreshold(currentPrice, platformThreshold);

  const nextOrder = status.findIndex(value => value === 0);
  if (nextOrder !== -1) {
    return priceThreshold < data[`priceTp${nextOrder + 1}`]
      ? { severity: 'success', label: 'Max ordres placés' }
      : { severity: 'warning', label: `L'ordre ${nextOrder + 1} peut être placé` };
  }

  return { severity: 'warning', label: `STATUS ERROR` };
}

/**
 * Generic function to update a specific field of an item in a list and recalculate related values.
 * @param {Array} items - A reactive list of items.
 * @param {Object} data - The data object to update.
 * @param {string} field - The name of the field to update.
 * @param {*} newValue - The new value for the field.
 */
function updateItemField(items, data, field, newValue) {
  if (!Array.isArray(items)) {
    console.warn('Invalid items reference or items is not an array:', items);
    return;
  }

  const rowIndex = items.findIndex((item) => item.asset === data.asset);
  if (rowIndex === -1) {
    console.warn('Item not found in the list:', data.asset);
    return;
  }

  const item = { ...items[rowIndex], [field]: newValue };

  Object.assign(item, calculateRecups(item), calculateAmountsAndPricesForShad(item));
  items[rowIndex] = item;
}

export const updateRowByStratChange = (items, data, newStrat) => 
  updateItemField(items, data, 'strat', newStrat);

export const updateMaxExposition = (items, data, maxExposition) => {
  if (isNaN(maxExposition) || maxExposition < 0) {
    console.warn('Invalid maxExposition value:', maxExposition);
    return;
  }
  updateItemField(items, data, 'maxExposition', maxExposition);
};

const ERROR_ALLOWED = 0.05;
const MAX_EXPO = 10000;

/**
 * Calculate the amounts and prices for each take profit level.
 * @param {Object} data - The data object containing necessary trading information.
 * @returns {Object} - Calculated amounts and prices.
 */
export function calculateAmountsAndPricesForShad(data) {
  const { recupTp1, balance, recupTpX, averageEntryPrice, maxExposition } = data;
  const FACTOR_SELL_SHAD = 0.5;

  const parsedRecupTp1 = parseFloat(recupTp1);
  const parsedBalance = parseFloat(balance);
  const parsedRecupTpX = parseFloat(recupTpX);
  const parsedAverageEntryPrice = parseFloat(averageEntryPrice);

  const amountTp1 = data.totalShad > -1 
    ? FACTOR_SELL_SHAD * (parsedRecupTp1 / parsedRecupTpX) * parsedBalance 
    : parsedBalance - maxExposition / parsedAverageEntryPrice;

  const priceTp1 = data.totalShad > -1 
    ? parsedRecupTp1 / amountTp1 
    : parsedAverageEntryPrice;

  const amountsAndPrices = { amountTp1, priceTp1 };

  for (let i = 2; i <= 5; i++) {
    const { amount, price } = calculateAmountAndPriceForShad(
      parsedRecupTpX,
      parsedBalance - Object.values(amountsAndPrices).reduce((acc, val) => acc + val.amount, 0),
      FACTOR_SELL_SHAD
    );
    amountsAndPrices[`amountTp${i}`] = amount;
    amountsAndPrices[`priceTp${i}`] = price;
  }

  return amountsAndPrices;
}

function calculateAmountAndPriceForShad(parsedRecup, parsedBalance, factor) {
  const amount = factor * parsedBalance;
  const price = parsedRecup / amount;
  return { amount, price };
}

/**
 * Calculate recovery values based on trading strategy and market conditions.
 * @param {Object} data - The data object containing necessary trading information.
 * @returns {Object} - Calculated recovery values.
 */
export function calculateRecups(data) {
  const stratExpo = data.maxExposition ?? MAX_EXPO;
  const maxExposition = Math.max(5 + 0.05, Math.min(data.totalBuy, stratExpo));
  const ratioShad = getRatioShad(data.strat);
  const recupShad = getRecupShad(data.totalBuy, data.totalSell, maxExposition);
  const recupTpX = getRecupTpX(maxExposition, ratioShad);
  const totalShad = getDoneShad(data.totalBuy, data.totalSell, maxExposition, recupShad, recupTpX);
  const recupTp1 = getRecupTp1(data.totalBuy, data.totalSell, maxExposition, recupTpX, totalShad);

  return {
    maxExposition,
    ratioShad,
    recupTpX,
    recupShad,
    recupTp1,
    totalShad
  };
}

function getRatioShad(strat) {
  if (strat !== undefined) {
    switch (strat) {
      case 'Shad':
        return 2
      case 'Shad skip x2':
        return 4
      case 'Strategy 3':
        return 8
      case 'Strategy 4':
        return 16
      default:
        return '8' // 'NULL' ou une valeur par défaut de votre choix
    }
  }
  // Gérez le cas où la structure n'est pas conforme à ce que vous attendez
  return '/' // 'NULL' ou une valeur par défaut de votre choix
}

function getRecupShad(totalBuy, totalSell, maxExposition) {
  if (totalSell > 0) {
    if (maxExposition < totalBuy && totalSell < totalBuy - maxExposition) {
      return 0
    } else {
      return Math.round(totalSell - (totalBuy - maxExposition), 2)
    }
  }
  return 0
}

function getRecupTp1(totalBuy, totalSell, maxExposition, recupTpX, totalShad) {
  let valueToRecup = 0
  if (maxExposition < totalBuy) {
    if (totalSell < totalBuy - maxExposition) {
      valueToRecup = totalBuy - maxExposition - totalSell
    } else {
      const result = (totalSell - (totalBuy - maxExposition)) / maxExposition
      const decimalPart = result - Math.floor(result)
      valueToRecup = decimalPart * maxExposition
    }
  } else if (
    (totalShad + 1) * totalBuy > totalSell &&
    totalShad * totalBuy < (1 - ERROR_ALLOWED) * totalSell
  ) {
    valueToRecup = recupTpX - (totalShad + 1) * totalBuy - totalSell
  }

  if (valueToRecup > 5.05) {
    return valueToRecup
  }

  return recupTpX
}

function getRecupTpX(maxExposition, ratioShad) {
  const result = (maxExposition * ratioShad * 0.5).toFixed(2)
  return parseFloat(result)
}

function getDoneShad(totalBuy, totalSell, maxExposition, recupShad, recupTpX) {
  if (
    maxExposition < (1 - ERROR_ALLOWED) * totalBuy &&
    totalSell < (1 - ERROR_ALLOWED) * (totalBuy - maxExposition)
  ) {
    return -1
  } else if (recupShad >= (1 - ERROR_ALLOWED) * recupTpX) {
    return -1 + Math.round(1 + ERROR_ALLOWED + recupShad / recupTpX, 2)
  } else {
    return 0
  }
}
