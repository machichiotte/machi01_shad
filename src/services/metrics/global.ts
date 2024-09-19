// src/services/metrics/global.ts
import { calculateRecups, calculateAmountsAndPricesForShad } from './strategies'
import { getCmcValues } from './cmc'
import { getBalanceBySymbol, getProfit, getCurrentPossession, getPercentageDifference, getStatus, getPercentageToNextTp } from './utils'
import { getTotalAmountAndBuy, getTotalSell } from './trades'
import { MappedBalance, MappedOrder, MappedTrade, MappedTicker, MappedCmc, MappedStrategy } from '@models/dbTypes'
import { AssetMetrics } from '@models/dbTypes'
// Define stable coins
//todo changer pour objet
const stableCoins: string[] = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD']

/**
 * Default metrics object with initial values set to "N/A".
 * This serves as a template for asset metrics.
 */
const DEFAULT_METRICS: AssetMetrics = {
  iconUrl: 'N/A',
  asset: 'N/A',
  status: 'N/A',
  strat: 'N/A',
  ratioShad: 'N/A',
  totalShad: 'N/A',
  rank: 'N/A',
  averageEntryPrice: 'N/A',
  totalBuy: 'N/A',
  maxExposition: 'N/A',
  percentageDifference: 'N/A',
  currentPrice: 'N/A',
  currentPossession: 'N/A',
  profit: 'N/A',
  totalSell: 'N/A',
  recupShad: 'N/A',
  nbOpenBuyOrders: 'N/A',
  nbOpenSellOrders: 'N/A',
  totalAmount: 'N/A',
  balance: 'N/A',
  recupTp1: 'N/A',
  recupTpX: 'N/A',
  tp1: 'N/A',
  tp2: 'N/A',
  tp3: 'N/A',
  tp4: 'N/A',
  tp5: 'N/A',
  percentToNextTp: 'N/A',
  platform: 'N/A'
}

/**
 * Retrieves the current price of an asset from the last tickers.
 */
function getCurrentPrice(lastTickers: MappedTicker[], base: string, platform: string): number | undefined {
  if (!Array.isArray(lastTickers) || !base || !platform) {
    console.warn('Paramètres invalides pour getCurrentPrice')
    return -1
  }

  const ticker = lastTickers.find(
    (ticker) =>
      ticker?.symbol === `${base}/USDT` && ticker.platform === platform
  )

  return ticker?.last ?? -1
}

/**
 * Calculates various metrics for a given asset.
- */
function calculateAssetMetrics(asset: string, platform: string, assetBalance: MappedBalance, lastCmc: MappedCmc[], lastTrades: MappedTrade[], lastOpenOrders: MappedOrder[], strategy: MappedStrategy, lastTickers: MappedTicker[]): AssetMetrics {
  const balance = getBalanceBySymbol(asset, assetBalance)
  const currentPrice = getCurrentPrice(lastTickers, asset, platform)
  const cmcValues = getCmcValues(lastCmc, currentPrice)
  const totalSell = getTotalSell(asset, lastTrades)

  const { buyOrders, sellOrders } = filterOpenOrdersBySide(
    lastOpenOrders,
    platform,
    asset
  )

  const { totalAmount, totalBuy, averageEntryPrice } = getTotalAmountAndBuy(
    asset,
    lastTrades
  )

  const baseMetrics: AssetMetrics = {
    ...DEFAULT_METRICS,
    asset,
    currentPrice,
    currentPossession: getCurrentPossession(currentPrice, balance),
    totalAmount,
    balance,
    ...cmcValues,
    platform
  }

  if (stableCoins.includes(asset)) {
    return { ...baseMetrics, status: 'stable coin' }
  }

  const strategyForPlatform = strategy?.strategies?.[platform];
  if (balance === 0 || strategyForPlatform === undefined) {
    return {
      ...baseMetrics,
      averageEntryPrice,
      totalBuy,
      percentageDifference: getPercentageDifference(
        currentPrice,
        averageEntryPrice
      ),
      profit: getProfit(totalBuy, totalSell, currentPrice, balance),
      totalSell,
      nbOpenBuyOrders: buyOrders.length,
      nbOpenSellOrders: sellOrders.length
    }
  }

  const recups = calculateRecups(asset, platform, totalBuy, totalSell, strategy)
  const amountsAndPrices = calculateAmountsAndPricesForShad(
    recups.recupTp1,
    balance,
    recups.totalShad,
    recups.recupTpX,
    averageEntryPrice,
    recups.maxExposition,
    platform
  )
  const finalMetrics = {
    ...baseMetrics,
    ...recups,
    ...amountsAndPrices,
    status: getStatus(sellOrders, ...Object.values(amountsAndPrices)),
    averageEntryPrice,
    totalBuy,
    percentageDifference: getPercentageDifference(
      currentPrice,
      averageEntryPrice
    ),
    profit: getProfit(totalBuy, totalSell, currentPrice, balance),
    totalSell,
    nbOpenBuyOrders: buyOrders.length,
    nbOpenSellOrders: sellOrders.length,
    percentToNextTp: getPercentageToNextTp(
      currentPrice,
      amountsAndPrices.priceTp1
    )
  }

  //console.log(`Métriques finales calculées pour ${asset}:`, finalMetrics);
  return finalMetrics;
}

/**
 * Filters open orders by type (buy/sell) and platform.
 */
function filterOpenOrdersBySide(orders: MappedOrder[], platform: string, base: string): { buyOrders: MappedOrder[], sellOrders: MappedOrder[] } {
  return orders.reduce(
    (acc: { buyOrders: MappedOrder[], sellOrders: MappedOrder[] }, order: MappedOrder) => {
      if (order.platform === platform && order.symbol.split('/')[0] === base) {
        acc[order.side === 'buy' ? 'buyOrders' : 'sellOrders'].push(order)
      }
      return acc
    },
    { buyOrders: [], sellOrders: [] }
  )
}

export { calculateAssetMetrics }