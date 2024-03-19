import {
  GET_BUY_ORDERS,
  GET_SELL_ORDERS,
  GET_CMC,
  GET_STRATS,
  GET_TRADES
} from '@/store/storeconstants'
import store from '@/store/store.js'

const MAX_EXPO = 10000
const ERROR_ALLOWED = 0.05

let cmc = store.getters['calcul/' + GET_CMC]
let trades = store.getters['calcul/' + GET_TRADES]
let strats = store.getters['calcul/' + GET_STRATS]
let buyOrders = store.getters['calcul/' + GET_BUY_ORDERS]
let sellOrders = store.getters['calcul/' + GET_SELL_ORDERS]

function getProfit(totalBuy, totalSell, currentPrice, balance) {
  const buyTotal = parseFloat(totalBuy)
  const sellTotal = parseFloat(totalSell)
  const price = parseFloat(currentPrice)
  const bal = parseFloat(balance)

  if (isNaN(buyTotal) || isNaN(sellTotal) || isNaN(price) || isNaN(bal)) {
    return 'N/A'
  }

  const totalInvestment = buyTotal - sellTotal
  const currentValue = price * bal
  const profit = currentValue - totalInvestment

  return profit.toFixed(2)
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
  if (maxExposition < totalBuy) {
    if (totalSell < totalBuy - maxExposition) {
      const difference = totalBuy - maxExposition - totalSell
      return difference > 4.5 ? difference : recupTpX + difference
    } else {
      const result = (totalSell - (totalBuy - maxExposition)) / maxExposition
      const decimalPart = result - Math.floor(result)
      const result2 = decimalPart * maxExposition

      return result2 > 4.5 ? result2 : recupTpX + result2
    }
  } else if ((totalShad + 1) * totalBuy - totalSell > 0) {
    return (totalShad + 1) * totalBuy - totalSell
  }

  return recupTpX
}

function getRecupTpX(strat, maxExposition, ratioShad) {
  //on aura besoin de la strat pour mieux definir a lavenir
  return maxExposition * ratioShad * 0.5
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

function getTotalAmountAndBuy(asset) {
  const filteredTrades = trades.filter((trade) => trade.altA === asset && trade.type === 'buy')
  const totalBuy = filteredTrades.reduce((total, trade) => total + parseFloat(trade.totalUSDT), 0)
  const totalAmount = filteredTrades.reduce((total, trade) => total + parseFloat(trade.amount), 0)

  const averageEntryPrice = (parseFloat(totalBuy) / parseFloat(totalAmount)).toFixed(8)

  return {
    totalAmount,
    totalBuy: totalBuy.toFixed(2),
    averageEntryPrice
  }
}

function getRatioShad(strat) {
  // Assurez-vous que strats est défini et a la structure attendue
  if (strat !== undefined) {
    // Mettez à jour les valeurs de retour en fonction de la stratégie
    switch (strat) {
      //TODO CHANGE THIS
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

function calculateRecups(item, totalBuy, totalSell) {
  const { symbol, platform, balance } = item

  const { strat, stratExpo } = getStrat(platform, symbol)
  if (stratExpo === undefined) {
    stratExpo = MAX_EXPO
  }
  const maxExposition = Math.max(5 + 0.05, Math.min(totalBuy, stratExpo))

  const ratioShad = getRatioShad(strat)
  const recupShad = getRecupShad(totalBuy, totalSell, maxExposition)
  const recupTpX = getRecupTpX(strat, maxExposition, ratioShad)
  const totalShad = getDoneShad(totalBuy, totalSell, maxExposition, recupShad, recupTpX)
  const recupTp1 = getRecupTp1(totalBuy, totalSell, maxExposition, recupTpX, totalShad)

  return {
    strat,
    stratExpo,
    maxExposition,
    ratioShad,
    recupTpX,
    recupShad,
    recupTp1,
    totalShad
  }
}

function getTotalSell(asset) {
  const filteredTrades = trades.filter((trade) => trade.altA === asset && trade.type === 'sell')
  const sellTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.totalUSDT), 0)

  return Math.round(sellTotal, 2)
}

function getBalance(asset, sortedBalances) {
  const balance = sortedBalances.find((item) => item.symbol === asset)
  return balance ? balance.balance : 'N/A'
}

function getIconUrl(id) {
  const baseIconUrl = 'https://s2.coinmarketcap.com/static/img/coins/32x32/'
  return `${baseIconUrl}${parseInt(id)}.png`
}

function getCmcValues(asset) {
  console.log('getCmcValues cmc', cmc.length)
  const crypto = cmc.find((item) => item.symbol === asset) || {}

  return {
    rank: parseInt(crypto.cmc_rank) || 0,
    currentPrice: crypto.quote?.USD?.price.toFixed(7) || 'N/A',
    iconUrl: crypto.id ? getIconUrl(crypto.id) : '',
    cryptoPercentChange24h: crypto.quote?.USD?.percent_change_24h / 100 || 'N/A',
    cryptoPercentChange7d: crypto.quote?.USD?.percent_change_7d / 100 || 'N/A',
    cryptoPercentChange30d: crypto.quote?.USD?.percent_change_30d / 100 || 'N/A',
    cryptoPercentChange60d: crypto.quote?.USD?.percent_change_60d / 100 || 'N/A',
    cryptoPercentChange90d: crypto.quote?.USD?.percent_change_90d / 100 || 'N/A'
  }
}

function getPercentageDifference(currentPrice, averageEntryPrice) {
  const price = parseFloat(currentPrice)
  const avgEntryPrice = parseFloat(averageEntryPrice)
  if (isNaN(price) || isNaN(avgEntryPrice)) {
    return 'N/A'
  }
  const percentageDifference = (price - avgEntryPrice) / avgEntryPrice
  return percentageDifference.toFixed(2)
}

function getCurrentPossession(currentPrice, balance) {
  if (isNaN(currentPrice) || isNaN(balance)) {
    return 0
  }
  const currentPossession = (currentPrice * balance).toFixed(2)
  return currentPossession
}

function calculateAmountAndPrice(parsedRecup, parsedBalance, factor) {
  const amount = factor * parsedBalance
  const price = parsedRecup / amount

  return { amount, price }
}

function calculateAmountsAndPrices(
  recupTp1,
  balance,
  totalBuy,
  totalShad,
  recupTpX,
  averageEntryPrice
) {
  const parsedRecupTp1 = parseFloat(recupTp1)
  const parsedBalance = parseFloat(balance)
  const parsedTotalBuy = parseFloat(totalBuy)
  const parsedRecupTpX = parseFloat(recupTpX)
  const parsedAverageEntryPrice = parseFloat(averageEntryPrice)

  let amountTp1
  let priceTp1

  if (totalShad > -1) {
    amountTp1 = 0.5 * parsedBalance
    priceTp1 = parsedRecupTp1 / parseFloat(amountTp1)
  } else {
    if (parsedRecupTp1 / parsedAverageEntryPrice <= parsedBalance) {
      priceTp1 = parsedAverageEntryPrice
      amountTp1 = parsedRecupTp1 / parsedAverageEntryPrice
    } else {
      amountTp1 = 0.5 * parsedBalance
      priceTp1 = parsedRecupTp1 / parseFloat(amountTp1)
    }
  }

  const { amount: amountTp2, price: priceTp2 } = calculateAmountAndPrice(
    parsedRecupTpX,
    parsedBalance - amountTp1,
    0.5
  )
  const { amount: amountTp3, price: priceTp3 } = calculateAmountAndPrice(
    parsedRecupTpX,
    parsedBalance - amountTp1 - amountTp2,
    0.5
  )
  const { amount: amountTp4, price: priceTp4 } = calculateAmountAndPrice(
    parsedRecupTpX,
    parsedBalance - amountTp1 - amountTp2 - amountTp3,
    0.5
  )
  const { amount: amountTp5, price: priceTp5 } = calculateAmountAndPrice(
    parsedRecupTpX,
    parsedBalance - amountTp1 - amountTp2 - amountTp3 - amountTp4,
    0.5
  )

  if (priceTp1 > priceTp2 || priceTp1 > priceTp3 || priceTp1 > priceTp4 || priceTp1 > priceTp5) {
    return {
      amountTp1: 0,
      amountTp2: 0,
      amountTp3: 0,
      amountTp4: 0,
      amountTp5: 0,
      priceTp1: 0,
      priceTp2: 0,
      priceTp3: 0,
      priceTp4: 0,
      priceTp5: 0
    }
  } else {
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
}

function getAssetId(asset) {
  const crypto = cmc.find((item) => item.symbol === asset)
  if (crypto) return crypto.id
}

function getDataBTC() {
  return cmc.find((item) => item.symbol === 'BTC')
}

function getDataETH() {
  return cmc.find((item) => item.symbol === 'ETH')
}

function getTradesHistory(cryptoSymbol) {
  return trades.filter((trade) => trade.altA === cryptoSymbol)
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
  const THRESHOLD = 0.01 // 1% threshold

  // Fonction pour vérifier si deux valeurs sont proches l'une de l'autre avec une marge d'erreur
  const isClose = (value1, value2) => {
    return Math.abs((value1 - value2) / value1) <= THRESHOLD
  }
  // Initialiser un tableau de résultats avec des valeurs par défaut à 0
  const results = [0, 0, 0, 0, 0]

  // Vérifier chaque paire d'openSellOrders par rapport à chaque paire d'amount et price
  openSellOrders.forEach((order) => {
    if (isClose(order.amount, amountTp1) && isClose(order.price, priceTp1)) {
      results[0] = 1
    }
    if (isClose(order.amount, amountTp2) && isClose(order.price, priceTp2)) {
      results[1] = 1
    }
    if (isClose(order.amount, amountTp3) && isClose(order.price, priceTp3)) {
      results[2] = 1
    }
    if (isClose(order.amount, amountTp4) && isClose(order.price, priceTp4)) {
      results[3] = 1
    }
    if (isClose(order.amount, amountTp5) && isClose(order.price, priceTp5)) {
      results[4] = 1
    }
  })

  return results
}

function getStrat(exchangeId, asset) {
  // Rechercher la stratégie correspondante à l'actif donné
  const filteredStrat = strats.find((strat) => strat.asset === asset) || {}

  console.log('filtered', exchangeId + ' ' + asset + ' ' + filteredStrat)
  // Déterminer la stratégie et l'exposition maximale
  const strat = filteredStrat.strategies?.[exchangeId] || 'No strategy'
  const stratExpo = filteredStrat.maxExposure?.[exchangeId] || MAX_EXPO

  return { strat, stratExpo }
}

function getAllCalculs(item) {
  console.log('getAllCalculs', item)

  cmc = store.getters['calcul/' + GET_CMC]
  trades = store.getters['calcul/' + GET_TRADES]
  strats = store.getters['calcul/' + GET_STRATS]
  buyOrders = store.getters['calcul/' + GET_BUY_ORDERS]
  sellOrders = store.getters['calcul/' + GET_SELL_ORDERS]

  const { symbol, platform, balance } = item
  const exchangeId = platform

  const {
    rank,
    currentPrice,
    iconUrl,
    cryptoPercentChange24h,
    cryptoPercentChange7d,
    cryptoPercentChange30d,
    cryptoPercentChange60d,
    cryptoPercentChange90d
  } = getCmcValues(symbol)

  const totalSell = getTotalSell(symbol)

  const openBuyOrders = buyOrders.filter((order) => {
    const [asset] = order.symbol.split('/')
    return asset === symbol
  })
  const openSellOrders = sellOrders.filter((order) => {
    const [asset] = order.symbol.split('/')
    return asset === symbol
  })
  const { totalAmount, totalBuy, averageEntryPrice } = getTotalAmountAndBuy(symbol)

  const currentPossession = getCurrentPossession(currentPrice, balance)
  const profit = getProfit(totalBuy, totalSell, currentPrice, balance)

  const { strat, stratExpo, maxExposition, ratioShad, recupTpX, recupShad, recupTp1, totalShad } =
    calculateRecups(item, totalBuy, totalSell)

  const {
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
  } = calculateAmountsAndPrices(recupTp1, balance, totalBuy, totalShad, recupTpX, averageEntryPrice)

  const percentageDifference = getPercentageDifference(currentPrice, averageEntryPrice)

  const status = getStatus(
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
  )

  const percentToNextTp = (priceTp1 - currentPrice) / currentPrice

  return {
    iconUrl,
    asset: symbol,
    status,
    strat,
    ratioShad,
    totalShad,
    rank,
    averageEntryPrice,
    totalBuy,
    maxExposition,
    percentageDifference,
    currentPrice,
    currentPossession,
    profit,
    totalSell,
    recupShad,
    nbOpenBuyOrders: openBuyOrders.length,
    nbOpenSellOrders: openSellOrders.length,
    totalAmount,
    balance,
    recupTp1,
    recupTpX,
    amountTp1,
    priceTp1,
    amountTp2,
    priceTp2,
    amountTp3,
    priceTp3,
    amountTp4,
    priceTp4,
    amountTp5,
    priceTp5,
    cryptoPercentChange24h,
    cryptoPercentChange7d,
    cryptoPercentChange30d,
    cryptoPercentChange60d,
    cryptoPercentChange90d,
    exchangeId,
    percentToNextTp
  }
}

export {
  getDataBTC,
  getDataETH,
  getAllCalculs,
  getBalance,
  getAssetId,
  getTradesHistory,
  getCmcValues
}
