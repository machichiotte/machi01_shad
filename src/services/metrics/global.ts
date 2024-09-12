// src/services/metrics/global.ts

/**
 * This module contains functions for calculating global metrics for assets.
 * It includes utility functions for retrieving balances, prices, and other
 * financial data, as well as the main function for calculating asset metrics.
 */

import { calculateRecups, calculateAmountsAndPricesForShad } from './strategies'
import { getCmcValues } from './cmc'
import {
  getBalanceBySymbol,
  getProfit,
  getCurrentPossession,
  getPercentageDifference,
  getStatus,
  getPercentageToNextTp
} from './utils'
import { getTotalAmountAndBuy, getTotalSell } from './trades'
import {
  MappedBalance,
  MappedOrder,
  MappedTrade,
  MappedTicker,
  MappedCmc,
  MappedStrategy
} from '@services/mapping'

// Define stable coins
const stableCoins: string[] = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD']

/**
 * Default metrics object with initial values set to "N/A".
 * This serves as a template for asset metrics.
 */
const DEFAULT_METRICS: Record<string, string | number> = {
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
 *
 * @param {Ticker[]} lastTickers - Array of recent ticker data.
 * @param {string} base - The base asset symbol.
 * @param {string} platform - The platform identifier.
 * @returns {string|number} - The current price or "N/A" if not found.
 */
function getCurrentPrice(
  lastTickers: MappedTicker[],
  base: string,
  platform: string
): number | undefined {
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

interface AssetMetrics extends Record<string, any> {
  iconUrl: string
  asset: string
  rank: number
  currentPrice: number | undefined
  currentPossession: number
  totalAmount: number
  balance: number
  platform: string
}

/**
 * Calculates various metrics for a given asset.
 *
 * @param {string} asset - The asset symbol.
 * @param {string} platform - The platform identifier.
 * @param {MappedBalance[]} lastBalances - Recent balance data.
 * @param {MappedCmc[]} lastCmc - Recent CoinMarketCap data.
 * @param {MappedTrade[]} lastTrades - Recent trade data.
 * @param {MappedOrder[]} lastOpenOrders - Recent open orders data.
 * @param {MappedStrategy} strategy - Recent strategy data.
 * @param {Ticker[]} lastTickers - Recent ticker data.
 * @returns {AssetMetrics} - An object containing calculated metrics for the asset.
 */
function calculateAssetMetrics(
  asset: string,
  platform: string,
  assetBalance: MappedBalance,
  lastCmc: MappedCmc[],
  lastTrades: MappedTrade[],
  lastOpenOrders: MappedOrder[],
  strategy: MappedStrategy,
  lastTickers: MappedTicker[]
): AssetMetrics {
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

  if (balance === 0 || !isValidStrategies(strategy)) {
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

  const recups = calculateRecups(
    asset,
    platform,
    totalBuy,
    totalSell,
    strategy
  )
  const amountsAndPrices = calculateAmountsAndPricesForShad(
    recups.recupTp1,
    balance,
    recups.totalShad,
    recups.recupTpX,
    averageEntryPrice,
    recups.maxExposition,
    platform
  )

  return {
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
}

/**
 * Filters open orders by type (buy/sell) and platform.
 *
 * @param {Order[]} orders - List of open orders.
 * @param {string} platform - The platform identifier.
 * @param {string} base - The asset symbol.
 * @returns {OrdersBySide} - Objects containing lists of buy and sell orders.
 */
function filterOpenOrdersBySide(
  orders: MappedOrder[],
  platform: string,
  base: string
): any {
  return orders.reduce(
    (acc: any, order: MappedOrder) => {
      if (order.platform === platform && order.symbol.split('/')[0] === base) {
        acc[order.side === 'buy' ? 'buyOrders' : 'sellOrders'].push(order)
      }
      return acc
    },
    { buyOrders: [], sellOrders: [] }
  )
}

/**
 * Checks if the strategies are valid.
 *
 * @param {Record<string, any>} strategies - The strategies to check.
 * @returns {boolean} - Returns true if it's a non-empty object.
 */
function isValidStrategies(strategies: Record<string, any>): boolean {
  const isObject = typeof strategies === 'object' && strategies !== null
  const isNotEmpty = isObject && Object.keys(strategies).length > 0
  return isObject && isNotEmpty
}

export { calculateAssetMetrics }
