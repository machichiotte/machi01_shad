import {
  BINANCE_PLATFORM_ID,
  HTX_PLATFORM_ID,
  BINANCE_THRESHOLD,
  HTX_THRESHOLD,
  performanceOptions
} from '../shad/constants.js'

/**
 * Prompt the user to select a performance option and update the data.
 * @param {Object} data - The data object to update.
 */
export function selectPerformance(data) {
  const newPerformance = parseInt(prompt('Select Performance: 24, 7, 30, 60, 90 (days)'))
  if (performanceOptions.value.includes(newPerformance)) {
    data.selectedPerformance = newPerformance
  }
}

/**
 * Calculate the price threshold based on the current price and a given threshold.
 * @param {number} currentPrice - The current price.
 * @param {number} threshold - The threshold to apply.
 * @returns {number} - The calculated price threshold.
 */
export function calculatePriceThreshold(currentPrice, threshold) {
  return currentPrice * threshold
}

/**
 * Count consecutive occurrences of the value '1' in the status array.
 * @param {Array<number>} status - The array of status values.
 * @returns {number} - The count of consecutive pairs.
 */
export function countConsecutivePairs(status) {
  return status.reduce((count, value) => (value === 1 ? count + 1 : count), 0)
}

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

  for (let i = 0; i < 5; i++) {
    if (status[i] === 0) {
      return priceThreshold < data[`priceTp${i + 1}`]
        ? { severity: 'success', label: 'Max ordres placés' }
        : { severity: 'warning', label: `L'ordre ${i + 1} peut être placé` }
    }
  }

  return { severity: 'warning', label: `STATUS ERROR` }
}

/**
 * Update the strategy of a specific item in a list.
 * @param {Ref<Array>} items - A ref to the list of items.
 * @param {Object} data - The data object to update.
 * @param {string} newStrat - The new strategy value.
 */
export function updateRowByStratChange(items, data, strat) {
  // Validate that 'items' is an array
  if (!Array.isArray(items)) {
    console.warn('Invalid items reference or items is not an array:', items)
    return
  }

  const rowIndex = items.findIndex((item) => item.asset === data.asset)

  if (rowIndex !== -1) {
    const item = { ...items[rowIndex], strat }

    // Recalculate values based on the new maxExposition
    const recupData = calculateRecups(item)
    Object.assign(item, recupData)

    const pricesData = calculateAmountsAndPricesForShad(item)
    Object.assign(item, pricesData)

    // Update the item in the array
    items[rowIndex] = item
  } else {
    console.warn('Item not found in the list:', data.asset)
  }
}

/**
 * Update the maxExposition value of a specific item in a list.
 * @param {Array} items - A reactive list of items.
 * @param {Object} data - The data object to update.
 * @param {number} newValue - The new maxExposition value.
 */
export function updateMaxExposition(items, data, newValue) {
  // Validate that 'items' is an array
  if (!Array.isArray(items)) {
    console.warn('Invalid items reference or items is not an array:', items)
    return
  }

  // Validate that 'newValue' is a valid number
  if (isNaN(newValue) || newValue < 0) {
    console.warn('Invalid maxExposition value:', newValue)
    return
  }

  // Find the index of the row to update
  const rowIndex = items.findIndex((item) => item.asset === data.asset)
  if (rowIndex !== -1) {
    const item = { ...items[rowIndex], maxExposition: newValue }

    // Recalculate values based on the new maxExposition
    const recupData = calculateRecups(item)
    Object.assign(item, recupData)

    const pricesData = calculateAmountsAndPricesForShad(item)
    Object.assign(item, pricesData)

    // Update the item in the array
    items[rowIndex] = item
  } else {
    console.warn('Item not found in the list:', data.asset)
  }
}

const ERROR_ALLOWED = 0.05
const MAX_EXPO = 10000

export function calculateAmountsAndPricesForShad(data) {
  const { recupTp1, balance, totalShad, recupTpX, averageEntryPrice, maxExposition } = data
  const FACTOR_SELL_SHAD = 0.5

  const parsedRecupTp1 = parseFloat(recupTp1)
  const parsedBalance = parseFloat(balance)
  const parsedRecupTpX = parseFloat(recupTpX)
  const parsedAverageEntryPrice = parseFloat(averageEntryPrice)

  let amountTp1
  let priceTp1

  if (totalShad > -1) {
    amountTp1 = FACTOR_SELL_SHAD * (parsedRecupTp1 / parsedRecupTpX) * parsedBalance
    priceTp1 = parsedRecupTp1 / parseFloat(amountTp1)
  } else {
    amountTp1 = parsedBalance - maxExposition / parsedAverageEntryPrice
    priceTp1 = parsedAverageEntryPrice
  }

  const { amount: amountTp2, price: priceTp2 } = calculateAmountAndPriceForShad(
    parsedRecupTpX,
    parsedBalance - amountTp1,
    FACTOR_SELL_SHAD
  )
  const { amount: amountTp3, price: priceTp3 } = calculateAmountAndPriceForShad(
    parsedRecupTpX,
    parsedBalance - amountTp1 - amountTp2,
    FACTOR_SELL_SHAD
  )
  const { amount: amountTp4, price: priceTp4 } = calculateAmountAndPriceForShad(
    parsedRecupTpX,
    parsedBalance - amountTp1 - amountTp2 - amountTp3,
    FACTOR_SELL_SHAD
  )
  const { amount: amountTp5, price: priceTp5 } = calculateAmountAndPriceForShad(
    parsedRecupTpX,
    parsedBalance - amountTp1 - amountTp2 - amountTp3 - amountTp4,
    FACTOR_SELL_SHAD
  )

  return {
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
  }
}

function calculateAmountAndPriceForShad(parsedRecup, parsedBalance, factor) {
  const amount = factor * parsedBalance
  const price = parsedRecup / amount

  return { amount, price }
}

export function calculateRecups(data) {
  let stratExpo = data.maxExposition
  //on devrait verifier que cest bien un nombre positif, si besoin on bloque le champ pour obliger les nombre avec maximum 2 chiffres apres la virgule
  if (stratExpo === undefined) {
    stratExpo = MAX_EXPO
  }

  const maxExposition = Math.max(5 + 0.05, Math.min(data.totalBuy, stratExpo))
  const ratioShad = getRatioShad(data.strat)
  const recupShad = getRecupShad(data.totalBuy, data.totalSell, data.maxExposition)
  const recupTpX = getRecupTpX(maxExposition, ratioShad)
  const totalShad = getDoneShad(data.totalBuy, data.totalSell, maxExposition, recupShad, recupTpX)
  const recupTp1 = getRecupTp1(data.totalBuy, data.totalSell, maxExposition, recupTpX, totalShad)

  return {
    maxExposition,
    ratioShad,
    recupTpX,
    recupShad,
    recupTp1,
    totalShad
  }
}

// Other functions...
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
