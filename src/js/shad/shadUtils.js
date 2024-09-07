// src/js/shad/shadUtils.js
import {
  BINANCE_PLATFORM_ID,
  HTX_PLATFORM_ID,
  BINANCE_THRESHOLD,
  HTX_THRESHOLD
} from '../shad/constants.js'

/**
 * Calculate the price threshold based on the current price and a given threshold.
 * @param {number} currentPrice - The current price.
 * @param {number} threshold - The threshold to apply.
 * @returns {number} - The calculated price threshold.
 */
export const calculatePriceThreshold = (currentPrice, threshold) => currentPrice * threshold

/**
 * Count consecutive occurrences of the value '1' in the status array.
 * @param {Array<number>} status - The array of status values.
 * @returns {number} - The count of consecutive pairs.
 */
export const countConsecutivePairs = (status) => status.filter((value) => value === 1).length

/**
 * Determine the status of an asset based on its current data and trading conditions.
 * @param {Object} data - The data object containing asset and trading information.
 * @returns {Object} - An object containing severity and label for the status.
 */
export function getStatus(data) {
  const { currentPrice, platform, status, nbOpenSellOrders, priceTp1, priceTp2 } = data

  if (status === 'stable coin') {
    return { severity: 'secondary', label: 'stable coin' }
  }

  if (!Array.isArray(status)) {
    console.warn('data.status is not an array:', status)
    return { severity: 'warning', label: `STATUS ERROR` }
  }

  const totalOrders = status.reduce((acc, val) => acc + val, 0)

  if (nbOpenSellOrders === 0) {
    return { severity: 'danger', label: "Pas d'ordres ouverts" }
  } else if (currentPrice > priceTp1) {
    return priceTp1 < priceTp2
      ? { severity: 'info', label: 'Tu peux vendre depuis un moment' }
      : { severity: 'danger', label: 'tp2 < tp1' }
  }

  if (totalOrders === 5) {
    return { severity: 'success', label: '5 ordres placés' }
  }

  const platformThreshold = platform === BINANCE_PLATFORM_ID ? BINANCE_THRESHOLD : HTX_THRESHOLD
  const priceThreshold = calculatePriceThreshold(currentPrice, platformThreshold)

  const nextOrder = status.findIndex((value) => value === 0)
  if (nextOrder !== -1) {
    return priceThreshold < data[`priceTp${nextOrder + 1}`]
      ? { severity: 'success', label: 'Max ordres placés' }
      : { severity: 'warning', label: `L'ordre ${nextOrder + 1} peut être placé` }
  }

  return { severity: 'warning', label: `STATUS ERROR` }
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
    console.warn('Invalid items reference or items is not an array:', items)
    return
  }

  const rowIndex = items.findIndex((item) => item.asset === data.asset)
  if (rowIndex === -1) {
    console.warn('Item not found in the list:', data.asset)
    return
  }

  const item = { ...items[rowIndex], [field]: newValue }

  // Object.assign(item, calculateRecups(item), calculateAmountsAndPricesForShad(item))
  const calculatedItems = calculateRecups(item);
  console.log(`🚀 ~ file: shadUtils.js:94 ~ updateItemField ~ calculatedItems:`, calculatedItems)
  
  Object.assign(item, calculatedItems)
  items[rowIndex] = item
}

export const updateRowByStratChange = (items, data, newStrat) =>
  updateItemField(items, data, 'strat', newStrat)

export const updateMaxExposition = (items, data, maxExposition) => {
  if (isNaN(maxExposition) || maxExposition < 0) {
    console.warn('Invalid maxExposition value:', maxExposition)
    return
  }
  updateItemField(items, data, 'maxExposition', maxExposition)
}

const ERROR_ALLOWED = 0.05
const MAX_EXPO = 10000

/**
 * Retrieve the platform fee percentage based on the platform name.
 * @param {string} platform - The name of the trading platform.
 * @returns {number} - The fee percentage for the given platform.
 */
function getPlatformFee(platform) {
  // Define the platform fees
  const fees = {
    binance: 0.1, // 0.1% fee
    kucoin: 0.1, // 0.1% fee
    htx: 0.1, // 0.1% fee
    okx: 0.1, // 0.1% fee
    gateio: 0.2, // 0.2% fee
    default: 0.2 // Default fee (if platform not found)
  }

  // Return the fee for the given platform, or the default fee if the platform is not found
  return fees[platform.toLowerCase()] || fees.default
}

/**
 * Calculate the amounts and prices for each take profit level, considering platform fees.
 * @param {Object} data - The data object containing necessary trading information.
 * @param {number} platformFee - The platform fee percentage (e.g., 0.1 for 0.1%).
 * @returns {Object} - Calculated amounts and prices.
 */
/*export function calculateAmountsAndPricesForShad(data) {
  const { recupTp1, balance, totalShad, recupTpX, averageEntryPrice, maxExposition, platform } =
    data
  const FACTOR_SELL_SHAD = 0.5

  const parsedRecupTp1 = parseFloat(recupTp1)
  const parsedBalance = parseFloat(balance)
  const parsedRecupTpX = parseFloat(recupTpX)
  const parsedAverageEntryPrice = parseFloat(averageEntryPrice)

  const platformFee = getPlatformFee(platform)

  // Adjust the amount for TP1 considering the platform fee
  const amountTp1 =
    totalShad > -1
      ? FACTOR_SELL_SHAD * (parsedRecupTp1 / parsedRecupTpX) * parsedBalance
      : parsedBalance - maxExposition / parsedAverageEntryPrice

  // Adjust the price for TP1 to account for platform fee
  const priceTp1 =
    totalShad > -1
      ? (parsedRecupTp1 / amountTp1) * (1 + platformFee / 100)
      : parsedAverageEntryPrice * (1 + platformFee / 100)

  const amountsAndPrices = { amountTp1, priceTp1 }

  // Loop for TP2 to TP5
  for (let i = 2; i <= 5; i++) {
    // Filtrer et additionner uniquement les montants (amounts)
    const usedAmounts = Object.entries(amountsAndPrices)
      .filter(([key]) => key.startsWith('amountTp')) // Ne garder que les clés qui commencent par 'amountTp'
      .reduce((acc, [_, val]) => acc + val, 0) // Additionner les valeurs de ces clés

    // Calculer le solde restant en soustrayant le montant déjà utilisé
    const remainingBalance = parsedBalance - usedAmounts

    // Calculer le montant et le prix pour ce niveau de prise de profit
    const { amount, price } = calculateAmountAndPriceForShad(
      parsedRecupTpX,
      remainingBalance,
      FACTOR_SELL_SHAD
    )

    // Ajuster le prix pour chaque niveau de prise de profit pour tenir compte des frais de la plateforme
    amountsAndPrices[`amountTp${i}`] = amount
    amountsAndPrices[`priceTp${i}`] = price * (1 + platformFee / 100)
  }

  return amountsAndPrices
}*/

/*function calculateAmountAndPriceForShad(parsedRecup, parsedBalance, factor) {
  const amount = factor * parsedBalance
  const price = parsedRecup / amount
  return { amount, price }
}*/

function calculateValues(
  totalBuy,
  totalSell,
  balance,
  maxExposition,
  ratioShad,
  averageEntryPrice
) {
  // Calculs intermédiaires
  const recupTpX = getRecupTpX(maxExposition, ratioShad) // Ligne 2
  let recupTp1, price1, amount1

  // Cas 1
  if (maxExposition < totalBuy && totalBuy > totalSell + maxExposition) {
    recupTp1 = totalBuy - totalSell - maxExposition // Ligne 3
    console.log(`🚀 ~ file: shadUtils.js:211 ~ recupTp1:`, recupTp1)
    price1 = averageEntryPrice 
    if (recupTp1 < 5.05) {
      console.log(`🚀 ~ file: shadUtils.js:214 ~ recupTp1:`, recupTp1)
      recupTp1 = recupTp1 + recupTpX
      console.log(`🚀 ~ file: shadUtils.js:215 ~ recupTp1:`, recupTp1)
      //todo handle this case
      price1 = price1 * 2 * ratioShad
    }
    amount1 = recupTp1 / price1
  } else {
    // Cas 2
    recupTp1 = recupTpX - (totalSell % recupTpX) // Ligne 6
    console.log(`🚀 ~ file: shadUtils.js:222 ~ recupTp1:`, recupTp1)
    price1 = (2 * recupTpX * ratioShad) / balance // Ligne 7
    amount1 = recupTp1 / price1 // Ligne 8
  }

  // Vérification si amount1 est supérieur au balance
  if (amount1 > balance) {
    amount1 = balance // Assignation de balance à amount1
    price1 = recupTp1 / balance // Recalcul de price1
  }

  // Calcul des montants et prix suivants
  const amount2 = (balance - amount1) / 2 // Ligne 9
  const amount3 = (balance - amount1 - amount2) / 2 // Ligne 10
  const amount4 = (balance - amount1 - amount2 - amount3) / 2 // Ligne 11
  const amount5 = (balance - amount1 - amount2 - amount3 - amount4) / 2 // Ligne 12

  const price2 = amount2 > 0 ? recupTpX / amount2 : 0 // Ligne 13
  const price3 = amount3 > 0 ? recupTpX / amount3 : 0 // Ligne 14
  const price4 = amount4 > 0 ? recupTpX / amount4 : 0 // Ligne 15
  const price5 = amount5 > 0 ? recupTpX / amount5 : 0 // Ligne 16

  // Retour des valeurs calculées
  return {
    averageEntryPrice,
    recupTpX,
    recupTp1,
    price1,
    amount1,
    amount2,
    amount3,
    amount4,
    amount5,
    price2,
    price3,
    price4,
    price5
  }
}

/**
 * Calculate recovery values based on trading strategy and market conditions.
 * @param {Object} data - The data object containing necessary trading information.
 * @returns {Object} - Calculated recovery values.
 */
export function calculateRecups(data) {
  console.time('calculateRecups Execution Time');

  const stratExpo = data.maxExposition ?? 0; // Ensure default value
  console.log(`🚀 ~ StratExpo:`, stratExpo);

  const maxExposition = Math.max(0, stratExpo); // Ensure non-negative exposition
  const ratioShad = getRatioShad(data.strat);
  const recupShad = getRecupShad(data.totalBuy, data.totalSell, maxExposition);

  // Calculate values required for the final result
  const calculatedValues = calculateValues(
    data.totalBuy,
    data.totalSell,
    data.balance,
    maxExposition,
    ratioShad,
    data.averageEntryPrice
  );

  const totalShad = getDoneShad(data.totalBuy, data.totalSell, maxExposition, recupShad, calculatedValues.recupTpX);

  console.timeEnd('calculateRecups Execution Time');
  
  return {
    maxExposition,
    ratioShad,
    recupShad,
    totalShad,
    ...calculatedValues // Spread calculated values for the final output
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
  console.log(`🚀 ~ file: shadUtils.js:381 ~ getRecupTpX ~ ratioShad:`, ratioShad)
  console.log(`🚀 ~ file: shadUtils.js:381 ~ getRecupTpX ~ maxExposition:`, maxExposition)
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
