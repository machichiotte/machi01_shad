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
export const getPriceThreshold = (currentPrice, threshold) => currentPrice * threshold

/**
 * Count consecutive occurrences of the value '1' in the status array.
 * @param {Array<number>} status - The array of status values.
 * @returns {number} - The count of consecutive pairs.
 */
export const countOccurrences = (status) => status.filter((value) => value === 1).length

/**
 * Determine the status of an asset based on its current data and trading conditions.
 * @param {Object} data - The data object containing asset and trading information.
 * @returns {Object} - An object containing severity and label for the status.
 */
export function evaluateAssetStatus(data) {
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
  const priceThreshold = getPriceThreshold(currentPrice, platformThreshold)

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
function updateAssetField(items, data, field, newValue) {
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
  const calculatedItem = getTakeProfitsTargets(item)
  Object.assign(item, calculatedItem)
  items[rowIndex] = item
}

export const applyStrategyToRow = (items, data, newStrat) =>
  updateAssetField(items, data, 'strat', newStrat)

export const setMaxExposure = (items, data, maxExposition) => {
  if (isNaN(maxExposition) || maxExposition < 0) {
    console.warn('Invalid maxExposition value:', maxExposition)
    return
  }
  updateAssetField(items, data, 'maxExposition', maxExposition)
}

const ERROR_ALLOWED = 0.05

/**
 * Retrieve the platform fee percentage based on the platform name.
 * @param {string} platform - The name of the trading platform.
 * @returns {number} - The fee percentage for the given platform.
 */
function retrievePlatformFee(platform) {
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

function getTakeProfitValues(data, maxExposition, ratioShad, averageEntryPrice) {
  const { totalBuy, totalSell, balance } = data
  // Calculs intermédiaires
  const recupTpX = getRecupTpX(maxExposition, ratioShad)
  let recupTp1, priceTp1, amountTp1
  // Cas 1
  if (maxExposition < totalBuy && totalBuy > totalSell + maxExposition) {
    recupTp1 = totalBuy - totalSell - maxExposition
    priceTp1 = averageEntryPrice
  } else {
    recupTp1 = recupTpX - (totalSell % recupTpX)
    priceTp1 = (2 * recupTpX * ratioShad) / balance
  }

  if (recupTp1 < 5.05) {
    recupTp1 = recupTp1 + recupTpX
    priceTp1 = priceTp1 * 2 * ratioShad
  }
  amountTp1 = recupTp1 / priceTp1

  // Vérification si amount1 est supérieur au balance
  if (amountTp1 > balance) {
    amountTp1 = balance // Assignation de balance à amount1
    priceTp1 = recupTp1 / balance // Recalcul de price1
  }

  // Calcul des montants et prix suivants
  const amountTp2 = (balance - amountTp1) / 2
  const amountTp3 = (balance - amountTp1 - amountTp2) / 2
  const amountTp4 = (balance - amountTp1 - amountTp2 - amountTp3) / 2
  const amountTp5 = (balance - amountTp1 - amountTp2 - amountTp3 - amountTp4) / 2

  const priceTp2 = amountTp2 > 0 ? recupTpX / amountTp2 : 0
  const priceTp3 = amountTp3 > 0 ? recupTpX / amountTp3 : 0
  const priceTp4 = amountTp4 > 0 ? recupTpX / amountTp4 : 0
  const priceTp5 = amountTp5 > 0 ? recupTpX / amountTp5 : 0

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
export function getTakeProfitsTargets(data) {
  const stratExpo = data.maxExposition ?? 0 // Ensure default value
  const maxExposition = Math.max(0, stratExpo) // Ensure non-negative exposition
  const ratioShad = determineStrategyFactor(data.strat)
  const recupShad = calculateRecoveryGap(data.totalBuy, data.totalSell, maxExposition)
  const averageEntryPrice = data.totalBuy / data.totalAmount

  const calculatedValues = getTakeProfitValues(data, maxExposition, ratioShad, averageEntryPrice)
  const totalShad = getDoneShad(data, maxExposition, recupShad, calculatedValues.recupTpX)

  return {
    maxExposition,
    ratioShad,
    recupShad,
    totalShad,
    ...calculatedValues // Spread calculated values for the final output
  }
}

function determineStrategyFactor(strat) {
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

function calculateRecoveryGap(totalBuy, totalSell, maxExposition) {
  //todo depends on the strategy
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

function getDoneShad(data, maxExposition, recupShad, recupTpX) {
  const { totalBuy, totalSell } = data
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
