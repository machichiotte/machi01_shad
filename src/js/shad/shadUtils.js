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

  for (let i = 0; i < 5; i++) {
    if (status[i] === 0) {
      return priceThreshold < data[`priceTp${i + 1}`]
        ? { severity: 'success', label: 'Max ordres placés' }
        : { severity: 'warning', label: `L'ordre ${i + 1} peut être placé` };
    }
  }

  return { severity: 'warning', label: `STATUS ERROR` };
}

/**
 * Update the maxExposition value of a specific item in a list.
 * @param {Ref<Array>} items - A ref to the list of items.
 * @param {Object} data - The data object to update.
 * @param {number} newValue - The new maxExposition value.
 */
export function updateMaxExposition(items, data, newValue) {
  if (isNaN(newValue) || newValue < 0) {
    console.warn('Invalid maxExposition value:', newValue)
    return
  }

  const rowIndex = items.value.findIndex((item) => item.asset === data.asset)
  if (rowIndex !== -1) {
    items.value[rowIndex] = { ...items.value[rowIndex], maxExposition: newValue }
  }
}

/**
 * Update the strategy of a specific item in a list.
 * @param {Ref<Array>} items - A ref to the list of items.
 * @param {Object} data - The data object to update.
 * @param {string} newStrat - The new strategy value.
 */
export function updateRowByStratChange(items, data, newStrat) {
  const rowIndex = items.value.findIndex((item) => item.asset === data.asset)
  const row = items.value[rowIndex]

  if (rowIndex !== -1) {
    const updatedItem = { ...row, newStrat }
    items.value.splice(rowIndex, 1, updatedItem)
  }
}
