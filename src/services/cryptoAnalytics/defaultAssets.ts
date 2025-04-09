// src/services/cryptoAnalytics/defaultAssets.ts
import { calculateRecups, calculateAmountsAndPrices } from './invest'
import { getCmcValues } from './cmc'
import {
  getBalanceBySymbol,
  getProfit,
  getCurrentPossession,
  getTakeProfitStatus
} from './tradingUtils'
import { getTotalAmountAndBuy, getTotalSell } from './tradeCalculations'
import { Asset } from '@typ/cryptoAnalytics'
import { MappedTrade } from '@typ/trade'
import { MappedTicker } from '@typ/ticker'
import { MappedBalance } from '@typ/balance'
import { MappedOrder } from '@typ/order'
import { MappedCmc } from '@typ/cmc'
import { MappedStrat } from '@typ/strat'
import {
  DEPIN,
  GAMING,
  MEMES,
  STABLECOINS,
  AI,
  RWA,
  MUSIC,
  LAYER1,
  LAYER2,
  SPORTS,
  IOT,
  NFT,
  DEFI,
  DAO,
  BITCOIN_ECO,
  ETHEREUM_ECO,
  POLKADOT_ECO,
  SOLANA_ECO,
  SMART_CONTRACTS,
  CENTRALIZED_EXCHANGE,
  DECENTRALIZED_EXCHANGE
} from '@constants/coins'
import { DEFAULT_ASSET_FOR_METRICS } from '@constants/metrics'
import { PLATFORM } from '@typ/platform'
import { logger } from '@src/utils/loggerUtil'

const myModule = 'defaultAssets'

export function calculateAssetMetrics(
  base: string,
  platform: PLATFORM,
  mappedBalance: MappedBalance,
  closestCmc: MappedCmc | null,
  lastTrades: MappedTrade[],
  lastOpenOrders: MappedOrder[],
  strategy: Omit<MappedStrat, '_id'>,
  lastTickers: MappedTicker[]
): Asset {
  const balance = getBalanceBySymbol(base, mappedBalance)
  const cmcValues = closestCmc
    ? getCmcValues(closestCmc)
    : {
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

  const { totalAmountBuy, totalBuy, averageEntryPrice } = getTotalAmountAndBuy(
    base,
    lastTrades
  )

  const tags = addTags(base, closestCmc)

  const ticker = getTicker(lastTickers, base, platform)
  const currentPrice = getCurrentPrice(ticker, cmcValues.currentCmcPrice, tags)

  const baseMetrics: Asset = {
    ...DEFAULT_ASSET_FOR_METRICS,
    base: base,

    platform,
    iconUrl: cmcValues.iconUrl,
    ticker: ticker,
    tags: tags,

    name: cmcValues.name,

    liveData: {
      balance: balance,
      currentPrice: currentPrice,
      currentPossession: getCurrentPossession(currentPrice, balance) || 0
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
        status: [0, 0, 0, 0, 0]
      }
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
        totalBuy,
        totalSell,
        totalAmountBuy,
        averageEntryPrice,
        trades: lastTrades
      }
    }
  }

  if (baseMetrics.tags.includes('stablecoin')) {
    return { ...baseMetrics }
  }

  const strategyForPlatform = strategy?.strategies?.[platform]

  if (balance === 0 || strategyForPlatform === undefined) {
    return {
      ...baseMetrics,
      profit: getProfit(totalBuy, totalSell, currentPrice, balance)

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

  const amountsAndPrices = calculateAmountsAndPrices(
    balance,
    averageEntryPrice,
    recups
  )

  const finalMetrics = {
    ...baseMetrics,
    profit: getProfit(totalBuy, totalSell, currentPrice, balance),
    strat: {
      strategy: strategy.strategies[platform],
      maxExposition: strategy.maxExposure[platform],
      takeProfits: {
        tp1: {
          price: amountsAndPrices.priceTp1,
          amount: amountsAndPrices.amountTp1,
          percentToNextTp: NaN
        },
        tp2: {
          price: amountsAndPrices.priceTp2,
          amount: amountsAndPrices.amountTp2,
          percentToNextTp: NaN
        },
        tp3: {
          price: amountsAndPrices.priceTp3,
          amount: amountsAndPrices.amountTp3,
          percentToNextTp: NaN
        },
        tp4: {
          price: amountsAndPrices.priceTp4,
          amount: amountsAndPrices.amountTp4,
          percentToNextTp: NaN
        },
        tp5: {
          price: amountsAndPrices.priceTp5,
          amount: amountsAndPrices.amountTp5,
          percentToNextTp: NaN
        },
        status: getTakeProfitStatus(
          sellOrders,
          ...Object.values(amountsAndPrices)
        )
      }
    }
  }

  return finalMetrics
}

function getCurrentPrice(
  ticker: number,
  cmcPrice: number | undefined,
  tags: string[]
): number {
  const operation = 'getCurrentPrice'
  if (ticker === 0) {
    logger.warn(`Paramètres invalides pour getCurrentPrice`, { module: myModule, operation, ticker, cmcPrice, tags })
    if (cmcPrice && tags.includes('stablecoin')) return cmcPrice
  }

  return ticker
}

function getTicker(
  tickers: MappedTicker[],
  base: string,
  platform: string
): number {
  // Filtrer les tickers qui commencent par 'base/' et retourner le dernier prix
  const ticker = tickers.find(
    (ticker) =>
      ticker?.symbol === `${base}/USDC` && ticker.platform === platform
  )
  return ticker?.last ?? 0 // Retourne le dernier prix ou undefined si aucun ticker n'est trouvé
}

function addTagsFromBase(base: string): string[] {
  const types: string[] = []

  // Define tag categories and their corresponding checks
  const tagChecks: { [key: string]: () => boolean } = {
    stablecoin: () => STABLECOINS.includes(base),
    depin: () => DEPIN.includes(base),
    gaming: () => GAMING.includes(base),
    memes: () => MEMES.includes(base),
    ai: () => AI.includes(base),
    rwa: () => RWA.includes(base),
    music: () => MUSIC.includes(base),
    layer1: () => LAYER1.includes(base),
    layer2: () => LAYER2.includes(base),
    sports: () => SPORTS.includes(base),
    iot: () => IOT.includes(base),
    nft: () => NFT.includes(base),
    defi: () => DEFI.includes(base),
    dao: () => DAO.includes(base),
    bitcoinEcosystem: () => BITCOIN_ECO.includes(base),
    ethereumEcosystem: () => ETHEREUM_ECO.includes(base),
    polkadotEcosystem: () => POLKADOT_ECO.includes(base),
    solanaEcosystem: () => SOLANA_ECO.includes(base),
    smartContracts: () => SMART_CONTRACTS.includes(base),
    centralizedExchange: () => CENTRALIZED_EXCHANGE.includes(base),
    decentralizedExchange: () => DECENTRALIZED_EXCHANGE.includes(base)
  }

  // Check each tag and add to types if the condition is met
  for (const [tag, check] of Object.entries(tagChecks)) {
    if (check()) {
      types.push(tag)
    }
  }

  return types
}

function addTagsFromCmc(cmc: MappedCmc): string[] {
  const types: string[] = []

  // Define tag categories and their corresponding checks
  const tagChecks: { [key: string]: () => boolean } = {
    stablecoin: () => cmc?.tags.includes('stablecoin'),
    depin: () => cmc?.tags.includes('depin'),
    gaming: () => cmc?.tags.includes('gaming'),
    memes: () => cmc?.tags.includes('memes'),
    ai: () => cmc?.tags.includes('ai-big-data'),
    rwa: () => cmc?.tags.includes('real-world-assets'),
    music: () => cmc?.tags.includes('music'),
    layer1: () => cmc?.tags.includes('layer-1'),
    layer2: () => cmc?.tags.includes('layer-2'),
    sports: () => cmc?.tags.includes('sports'),
    iot: () => cmc?.tags.includes('iot'),
    nft: () => cmc?.tags.includes('nft'),
    defi: () => cmc?.tags.includes('defi'),
    dao: () => cmc?.tags.includes('dao'),
    bitcoinEcosystem: () => cmc?.tags.includes('bitcoin-ecosystem'),
    ethereumEcosystem: () => cmc?.tags.includes('ethereum-ecosystem'),
    polkadotEcosystem: () => cmc?.tags.includes('polkadot-ecosystem'),
    solanaEcosystem: () => cmc?.tags.includes('solana-ecosystem'),
    smartContracts: () => cmc?.tags.includes('smart-contracts'),
    centralizedExchange: () => cmc?.tags.includes('centralized-exchange'),
    decentralizedExchange: () =>
      cmc?.tags.includes('decentralized-exchange-dex-token')
  }

  // Check each tag and add to types if the condition is met
  for (const [tag, check] of Object.entries(tagChecks)) {
    if (check()) {
      types.push(tag)
    }
  }

  return types
}

function addTags(base: string, cmc: MappedCmc | null): string[] {
  if (cmc) return addTagsFromCmc(cmc)
  return addTagsFromBase(base)
}

function filterOpenOrdersBySide(
  orders: MappedOrder[],
  platform: string,
  base: string
): { buyOrders: MappedOrder[]; sellOrders: MappedOrder[] } {
  return orders.reduce(
    (
      acc: { buyOrders: MappedOrder[]; sellOrders: MappedOrder[] },
      order: MappedOrder
    ) => {
      if (order.platform === platform && order.symbol.split('/')[0] === base) {
        acc[order.side === 'buy' ? 'buyOrders' : 'sellOrders'].push(order)
      }
      return acc
    },
    { buyOrders: [], sellOrders: [] }
  )
}
