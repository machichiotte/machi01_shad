const MAX_EXPO = 10000

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
    if (maxExposition < totalBuy) {
      if (totalSell < totalBuy - maxExposition) {
        return Math.round(totalBuy - totalSell - maxExposition, 2)
      } else {
        return totalSell - (totalBuy - maxExposition)
      }
    } else {
      return Math.round(totalSell, 2)
    }
  }
  return 0
}

function getRecupTp1(totalBuy, totalSell, maxExposition, recupTpX, totalShad) {
  if (maxExposition < totalBuy) {
    if (totalSell < totalBuy - maxExposition) {
      const difference = totalBuy - maxExposition - totalSell
      return difference > 4.5 ? totalBuy - difference : recupTpX + difference
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
  return maxExposition * ratioShad * 0.5
}

function getDoneShad(totalBuy, totalSell, maxExposition, recupShad, recupTpX) {
  if (maxExposition - totalBuy < 0 && totalSell < 0.95 * Math.abs(totalBuy - maxExposition)) {
    return -1
  } else if (recupShad >= 0.95 * recupTpX) {
    return -1 + Math.round(1.1 + recupShad / recupTpX, 2)
  } else {
    return 0
  }
}

function getTotalAmountAndBuy(asset, trades) {
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

function calculateRecups(item, strats, totalBuy, totalSell) {
  const { symbol, platform, balance } = item

  const { strat, stratExpo } = getStrat(platform, symbol, strats)
  if (stratExpo === undefined) {
    stratExpo = MAX_EXPO
  }
  const maxExposition = Math.min(totalBuy, stratExpo)

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

function getTotalSell(asset, trades) {
  const filteredTrades = trades.filter((trade) => trade.altA === asset && trade.type === 'sell')
  const sellTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.total), 0)

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

function getCmcValues(asset, cmc) {
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

function calculateAmountsAndPrices(recupTp1, balance, totalBuy, totalShad, recupTpX) {
  const parsedRecupTp1 = parseFloat(recupTp1)
  const parsedBalance = parseFloat(balance)
  const parsedTotalBuy = parseFloat(totalBuy)
  const parsedRecupTpX = parseFloat(recupTpX)

  let amountTp1
  let priceTp1

  if (totalShad > -1) {
    amountTp1 = 0.5 * parsedBalance
    priceTp1 = parsedRecupTp1 / parseFloat(amountTp1)
  } else {
    amountTp1 = (parsedRecupTp1 / parsedTotalBuy) * parsedBalance
    priceTp1 = parsedRecupTp1 / amountTp1
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

function getAssetId(asset, cmc) {
  const crypto = cmc.find((item) => item.symbol === asset)
  if (crypto) return crypto.id
}

function getDataBTC(cmc) {
  return cmc.find((item) => item.symbol === 'BTC')
}

function getDataETH(cmc) {
  return cmc.find((item) => item.symbol === 'ETH')
}

function getTradesHistory(cryptoSymbol, trades) {
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

function getStrat(exchangeId, asset, strats) {
  // Rechercher la stratégie correspondante à l'actif donné
  const filteredStrat = strats.find((strat) => strat.asset === asset) || {}

  // Déterminer la stratégie et l'exposition maximale
  const strat = filteredStrat.strategies?.[exchangeId] || 'No strategy'
  const stratExpo = filteredStrat.maxExposure?.[exchangeId] || MAX_EXPO

  return { strat, stratExpo }
}

function getAllCalculs(item, cmc, trades, strats, buyOrders, sellOrders) {
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
  } = getCmcValues(symbol, cmc)

  const totalSell = getTotalSell(symbol, trades)

  const openBuyOrders = buyOrders.filter((order) => order.symbol.includes(symbol))
  const openSellOrders = sellOrders.filter((order) => order.symbol.includes(symbol))

  const { totalAmount, totalBuy, averageEntryPrice } = getTotalAmountAndBuy(symbol, trades)

  const currentPossession = getCurrentPossession(currentPrice, balance)
  const profit = getProfit(totalBuy, totalSell, currentPrice, balance)

  const { strat, stratExpo, maxExposition, ratioShad, recupTpX, recupShad, recupTp1, totalShad } =
    calculateRecups(item, strats, totalBuy, totalSell)

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
  } = calculateAmountsAndPrices(recupTp1, balance, totalBuy, totalShad, recupTpX)

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
    exchangeId
  }
}

export { getDataBTC, getDataETH, getAllCalculs, getBalance, getAssetId, getTradesHistory }
