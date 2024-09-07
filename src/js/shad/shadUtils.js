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
  const calculatedItem = calculateRecups(item)
  Object.assign(item, calculatedItem)
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
  let recupTp1, priceTp1, amountTp1

  // Cas 1
  if (maxExposition < totalBuy && totalBuy > totalSell + maxExposition) {
    recupTp1 = totalBuy - totalSell - maxExposition // Ligne 3
    console.log(`🚀 ~ file: shadUtils.js:211 ~ recupTp1:`, recupTp1)
    priceTp1 = averageEntryPrice
    if (recupTp1 < 5.05) {
      console.log(`🚀 ~ file: shadUtils.js:214 ~ recupTp1:`, recupTp1)
      recupTp1 = recupTp1 + recupTpX
      console.log(`🚀 ~ file: shadUtils.js:215 ~ recupTp1:`, recupTp1)
      //todo handle this case
      priceTp1 = priceTp1 * 2 * ratioShad
    }
    amountTp1 = recupTp1 / priceTp1
  } else {
    // Cas 2
    recupTp1 = recupTpX - (totalSell % recupTpX) // Ligne 6
    console.log(`🚀 ~ file: shadUtils.js:222 ~ recupTp1:`, recupTp1)
    priceTp1 = (2 * recupTpX * ratioShad) / balance // Ligne 7
    amountTp1 = recupTp1 / priceTp1 // Ligne 8
  }

  // Vérification si amount1 est supérieur au balance
  if (amountTp1 > balance) {
    amountTp1 = balance // Assignation de balance à amount1
    priceTp1 = recupTp1 / balance // Recalcul de price1
  }

  // Calcul des montants et prix suivants
  const amountTp2 = (balance - amountTp1) / 2 // Ligne 9
  const amountTp3 = (balance - amountTp1 - amountTp2) / 2 // Ligne 10
  const amountTp4 = (balance - amountTp1 - amountTp2 - amountTp3) / 2 // Ligne 11
  const amountTp5 = (balance - amountTp1 - amountTp2 - amountTp3 - amountTp4) / 2 // Ligne 12

  const priceTp2 = amountTp2 > 0 ? recupTpX / amountTp2 : 0 // Ligne 13
  const priceTp3 = amountTp3 > 0 ? recupTpX / amountTp3 : 0 // Ligne 14
  const priceTp4 = amountTp4 > 0 ? recupTpX / amountTp4 : 0 // Ligne 15
  const priceTp5 = amountTp5 > 0 ? recupTpX / amountTp5 : 0 // Ligne 16

  // Retour des valeurs calculées
  return {
    averageEntryPrice,
    recupTpX,
    recupTp1,
    priceTp1,
    amountTp1,
    amountTp2,
    amountTp3,
    amountTp4,
    amountTp5,
    priceTp2,
    priceTp3,
    priceTp4,
    priceTp5
  }
}

/**
 * Calculate recovery values based on trading strategy and market conditions.
 * @param {Object} data - The data object containing necessary trading information.
 * @returns {Object} - Calculated recovery values.
 */
export function calculateRecups(data) {
  console.time('calculateRecups Execution Time')

  const stratExpo = data.maxExposition ?? 0 // Ensure default value
  const maxExposition = Math.max(0, stratExpo) // Ensure non-negative exposition
  const ratioShad = getRatioShad(data.strat)
  const recupShad = getRecupShad(data.totalBuy, data.totalSell, maxExposition)

  // Calculate values required for the final result
  const calculatedValues = calculateValues(
    data.totalBuy,
    data.totalSell,
    data.balance,
    maxExposition,
    ratioShad,
    data.averageEntryPrice
  )

  const totalShad = getDoneShad(
    data.totalBuy,
    data.totalSell,
    maxExposition,
    recupShad,
    calculatedValues.recupTpX
  )

  console.timeEnd('calculateRecups Execution Time')

  return {
    maxExposition,
    ratioShad,
    recupShad,
    totalShad,
    ...calculatedValues // Spread calculated values for the final output
  }
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
