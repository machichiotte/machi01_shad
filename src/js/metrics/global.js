// src/js/metrics/global.js
import {
  calculateRecups,
  calculateAmountsAndPrices
} from './strategies.js'
import { getCmcValues } from './cmc.js'
import { getCurrentPossession, getPercentageDifference, getStatus } from './utils.js'
import { getTotalAmountAndBuy, getTotalSell, getTradesHistory, getBalance, getProfit } from './trades.js'
import store from '@/store/store.js'
import {
  GET_BUY_ORDERS,
  GET_SELL_ORDERS,
  GET_CMC,
  GET_STRATS,
  GET_TRADES
} from '@/store/storeconstants'

let cmc = store.getters['calcul/' + GET_CMC]
let trades = store.getters['calcul/' + GET_TRADES]
let strats = store.getters['calcul/' + GET_STRATS]
let buyOrders = store.getters['calcul/' + GET_BUY_ORDERS]
let sellOrders = store.getters['calcul/' + GET_SELL_ORDERS]

function getAllCalculs(item) {
  cmc = store.getters['calcul/' + GET_CMC]
  trades = store.getters['calcul/' + GET_TRADES]
  strats = store.getters['calcul/' + GET_STRATS]
  buyOrders = store.getters['calcul/' + GET_BUY_ORDERS]
  sellOrders = store.getters['calcul/' + GET_SELL_ORDERS]

  const { symbol, platform, balance, assetStrat, assetExpo } = item
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

  console.log('rank', rank)

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
  } = calculateAmountsAndPrices(
    recupTp1,
    balance,
    totalBuy,
    totalShad,
    recupTpX,
    averageEntryPrice,
    maxExposition
  )

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
  getAllCalculs,
  getTradesHistory,
  getCmcValues
}