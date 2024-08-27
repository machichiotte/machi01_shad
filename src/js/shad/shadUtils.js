import {
  BINANCE_PLATFORM_ID,
  HTX_PLATFORM_ID,
  BINANCE_THRESHOLD,
  HTX_THRESHOLD,
  performanceOptions
} from '../shad/constants.js'

export function selectPerformance(data) {
  // Handle performance selection logic
  const newPerformance = prompt('Select Performance: 24, 7, 30, 60, 90 (days)')
  if (performanceOptions.value.includes(parseInt(newPerformance))) {
    data.selectedPerformance = parseInt(newPerformance)
  }
}

export function calculatePriceThreshold(currentPrice, threshold) {
  return currentPrice * threshold
}

export function countConsecutivePairs(status) {
  let consecutivePairs = 0
  for (let i = 0; i < status.length; i++) {
    if (status[i] === 1) {
      consecutivePairs++
    } else {
      break
    }
  }
  return consecutivePairs
}

export function getStatus(data) {
  const currentPrice = data.currentPrice
  const platform = data.platform

  if (data.status === 'stable coin') {
    return { severity: 'secondary', label: 'stable coin' }
  }

  if (Array.isArray(data.status)) {
    const nb5 = data.status.reduce((acc, val) => acc + val, 0)

    if (data.nbOpenSellOrders === 0) {
      return { severity: 'danger', label: "Pas d'ordres ouverts" }
    } else if (currentPrice > data.priceTp1) {
      if (data.priceTp1 < data.priceTp2)
        return { severity: 'info', label: 'Tu peux vendre depuis un moment' }
      else return { severity: 'danger', label: 'tp2 < tp1' }
    } else {
      if (nb5 === 5) {
        return { severity: 'success', label: '5 ordres placés' }
      } else {
        const platformThreshold =
          platform === BINANCE_PLATFORM_ID ? BINANCE_THRESHOLD : HTX_THRESHOLD
        const priceThreshold = calculatePriceThreshold(currentPrice, platformThreshold)

        for (let i = 0; i < 5; i++) {
          if (data.status[i] === 0) {
            if (priceThreshold < data[`priceTp${i + 1}`]) {
              return { severity: 'success', label: 'Max ordres placés' }
            } else {
              return { severity: 'warning', label: `L'ordre ${i + 1} peut être placé ` }
            }
          }
        }
      }
    }
  } else {
    console.warn('data.status is not an array:', data.status)
    return { severity: 'warning', label: `STATUS ERROR` }
  }
}

export function updateMaxWanted(items, data, newValue) {
  if (isNaN(newValue) || newValue < 0) {
    console.warn('Invalid maxExposition value:', newValue)
    return
  }

  const rowIndex = items.value.findIndex((item) => item.asset === data.asset)
  const row = items.value[rowIndex]

  if (rowIndex !== -1) {
    const updatedItem = { ...row, maxExposition: newValue }
    items.value.splice(rowIndex, 1, updatedItem)
  }
}

export function updateRowByStratChange(items, data, assetStrat) {
  const rowIndex = items.value.findIndex((item) => item.asset === data.asset)
  const row = items.value[rowIndex]

  if (rowIndex !== -1) {
    const updatedItem = { ...row, assetStrat }
    items.value.splice(rowIndex, 1, updatedItem)
  }
}
