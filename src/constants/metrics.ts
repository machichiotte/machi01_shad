// src/constants/metrics.ts
import { Asset } from "@src/types/cryptoAnalytics";

//strat
/**
 * Constants for error margin and maximum exposure
 */
export const STRAT_ERROR_ALLOWED = 0.05
export const STRAT_MAX_EXPO = 10000

//take profits
export const TP_THRESHOLD = 0.01 // 1% threshold

//assets
export const DEFAULT_ASSET_FOR_METRICS: Asset = {
  base: 'N/A',
  iconUrl: 'N/A',
  ticker: NaN,
  name: 'N/A',
  platform: 'N/A',
  profit: 0,
  tags: [],
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
      totalAmountBuy: NaN,
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