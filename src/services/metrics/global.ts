// src/services/metrics/global.ts
import { calculateRecups, calculateAmountsAndPricesForShad } from './strategies'
import { getCmcValues } from './cmc'
import { getBalanceBySymbol, getProfit, getCurrentPossession, getStatus } from './utils'
import { getTotalAmountAndBuy, getTotalSell } from './trades'
import { Asset } from '@typ/metrics'
import { MappedTrade } from '@typ/trade'
import { MappedTicker } from '@typ/ticker'
import { MappedBalance } from '@typ/balance'
import { MappedOrder } from '@typ/order'
import { MappedCmc } from '@typ/cmc'
import { MappedStrat } from '@typ/strat'
import { STABLECOINS } from '@src/constants'
import { PLATFORM } from '@typ/platform'
//import { calculatePercentageChange, calculateProgressPercentage } from '@src/utils/metricsUtil'

/**
 * Default metrics object with initial values set to "N/A".
 * This serves as a template for base metrics.
 */
const DEFAULT_METRICS: Asset = {
  base: 'N/A',
  iconUrl: 'N/A',
  ticker: 'N/A',
  name: 'N/A',
  platform: 'N/A',
  profit: 0,
  type: [],
  cmc: {
    currentCmcPrice: NaN,
    rank: NaN,
    cryptoPercentChange24h: NaN,
    cryptoPercentChange7d: NaN,
    cryptoPercentChange30d: NaN,
    cryptoPercentChange60d: NaN,
    cryptoPercentChange90d: NaN,
  },
  strat: {
    strategy: 'N/A',
    maxExposition: NaN,
    takeProfits: {
      tp1: { price: NaN, amount: NaN, percentToNextTp: NaN },
      tp2: { price: NaN, amount: NaN, percentToNextTp: NaN },
      tp3: { price: NaN, amount: NaN, percentToNextTp: NaN },
      tp4: { price: NaN, amount: NaN, percentToNextTp: NaN },
      tp5: { price: NaN, amount: NaN, percentToNextTp: NaN },
      status: [0, 0, 0, 0, 0],
    },
  },
  orders: {
    open: {
      nbOpenBuyOrders: NaN,
      nbOpenSellOrders: NaN,
      currentOrders: [],
    },
    trade: {
      totalBuy: NaN,
      totalSell: NaN,
      totalAmountBuySell: NaN,
      averageEntryPrice: NaN,
      trades: [],
    },
  },
  liveData: {
    balance: NaN,
    currentPrice: NaN,
    currentPossession: NaN,
  },
};

/**
 * Retrieves the current price of a base from the last tickers.
 */
function getCurrentPrice(lastTickers: MappedTicker[], base: string, platform: string): number {
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
 * Calculates various metrics for a given base.
- */
function calculateAssetMetrics(base: string, platform: PLATFORM, mappedBalance: MappedBalance, closestCmc: MappedCmc | null, lastTrades: MappedTrade[], lastOpenOrders: MappedOrder[], strategy: Omit<MappedStrat, '_id'>, lastTickers: MappedTicker[]): Asset {
  const balance = getBalanceBySymbol(base, mappedBalance)
  const currentPrice = getCurrentPrice(lastTickers, base, platform)
  const cmcValues = closestCmc ?
    getCmcValues(closestCmc, currentPrice) :
    {
      rank: 0,
      name: '',
      currentCmcPrice: 0,
      iconUrl: '',
      cryptoPercentChange24h: 0,
      cryptoPercentChange7d: 0,
      cryptoPercentChange30d: 0,
      cryptoPercentChange60d: 0,
      cryptoPercentChange90d: 0
    }

  const totalSell = getTotalSell(base, lastTrades)

  const { buyOrders, sellOrders } = filterOpenOrdersBySide(
    lastOpenOrders,
    platform,
    base
  )

  const { totalAmount, totalBuy, averageEntryPrice } = getTotalAmountAndBuy(
    base,
    lastTrades
  )

  const type = addTypes(base)

  const baseMetrics: Asset = {
    ...DEFAULT_METRICS,
    base: base,

    platform,
    iconUrl: cmcValues.iconUrl,
    type: type,

    name: cmcValues.name,

    liveData: {
      balance: balance, // Correctement défini dans liveData
      currentPrice: currentPrice, // Vous pouvez aussi ajouter d'autres propriétés ici
      currentPossession: getCurrentPossession(currentPrice, balance), // Calcul de la possession actuelle
    },
    strat: {
      strategy: strategy.strategies[platform],
      maxExposition: strategy.maxExposure[platform],
      takeProfits: {
        tp1: { price: NaN, amount: NaN, percentToNextTp: NaN },
        tp2: { price: NaN, amount: NaN, percentToNextTp: NaN },
        tp3: { price: NaN, amount: NaN, percentToNextTp: NaN },
        tp4: { price: NaN, amount: NaN, percentToNextTp: NaN },
        tp5: { price: NaN, amount: NaN, percentToNextTp: NaN },
        status: [0, 0, 0, 0, 0],
      },
    },
    cmc: {
      currentCmcPrice: cmcValues.currentCmcPrice,
      rank: cmcValues.rank,
      cryptoPercentChange24h: cmcValues.cryptoPercentChange24h,
      cryptoPercentChange7d: cmcValues.cryptoPercentChange7d,
      cryptoPercentChange30d: cmcValues.cryptoPercentChange30d,
      cryptoPercentChange60d: cmcValues.cryptoPercentChange60d,
      cryptoPercentChange90d: cmcValues.cryptoPercentChange90d
    },
    orders: {
      open: {
        nbOpenBuyOrders: buyOrders.length,
        nbOpenSellOrders: sellOrders.length,
        currentOrders: lastOpenOrders
      },
      trade: {
        totalBuy: totalBuy,
        totalSell: totalSell,
        totalAmountBuySell: totalAmount,
        averageEntryPrice: averageEntryPrice,
        trades: lastTrades
      }
    },

  }

  if (baseMetrics.type.includes('stablecoin')) {
    return { ...baseMetrics }
  }

  const strategyForPlatform = strategy?.strategies?.[platform];

  if (balance === 0 || strategyForPlatform === undefined) {
    return {
      ...baseMetrics,
      profit: getProfit(totalBuy, totalSell, currentPrice, balance),

      /*
      percentageDifference: calculatePercentageChange(
        currentPrice,
        averageEntryPrice
      ),
      */

      //????? rajouter le averageprice a ce moment la pas avant ou pas ???
    }
  }

  const recups = calculateRecups(base, platform, totalBuy, totalSell, strategy)

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
    profit: getProfit(totalBuy, totalSell, currentPrice, balance),
    strat: {
      strategy: strategy.strategies[platform],
      maxExposition: strategy.maxExposure[platform],
      takeProfits: {
        tp1: { price: amountsAndPrices.priceTp1, amount: amountsAndPrices.amountTp1, percentToNextTp: NaN },
        tp2: { price: amountsAndPrices.priceTp2, amount: amountsAndPrices.amountTp2, percentToNextTp: NaN },
        tp3: { price: amountsAndPrices.priceTp3, amount: amountsAndPrices.amountTp3, percentToNextTp: NaN },
        tp4: { price: amountsAndPrices.priceTp4, amount: amountsAndPrices.amountTp4, percentToNextTp: NaN },
        tp5: { price: amountsAndPrices.priceTp5, amount: amountsAndPrices.amountTp5, percentToNextTp: NaN },
        status: getStatus(sellOrders, ...Object.values(amountsAndPrices)),
      },
    },
  }

  //console.log(`Métriques finales calculées pour ${base}:`, finalMetrics);
  return finalMetrics;
}

function addTypes(base: string): string[] {
  // Initialisation des types
  const types: string[] = []

  // Ajout du type "stablecoin"
  if (STABLECOINS.includes(base)) {
    types.push('stablecoin')
  }

  // Ajout du type "defi"
  /* if (DEFI_TOKENS.includes(base)) {
    types.push('defi')
  }
  
  // Ajout du type "nft"
  if (NFT_TOKENS.includes(base)) {
    types.push('nft')
  }*/

  return types;;
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