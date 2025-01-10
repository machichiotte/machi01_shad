// src/services/cryptoAnalytics/invest/index.ts
import { STRAT_MAX_EXPO } from '@src/constants/metrics'
import { MappedStrat } from '@typ/strat'
import { PLATFORM } from '@typ/platform'

import {
  calculateAmountsAndPricesForShad,
  calculateRecupsShad,
  RecupsShad 
} from './shad'
import { AmountsAndPrices } from '@typ/cryptoAnalytics'
import { PLATFORM_FEES } from '@src/constants/platform'

export interface Recup {
  base: string
  platform: PLATFORM
  totalBuy: number
  totalSell: number
  strat: string
  stratExpo: number
  maxExposition: number
  stratTps: StratTps
}

type StratTps = RecupsShad

/**
 * Calculates various recovery amounts and strategy parameters
 */
export function calculateRecups(
  base: string,
  platform: PLATFORM,
  totalBuy: number,
  totalSell: number,
  myStrat: Omit<MappedStrat, '_id'>
): Recup {
  const strat = myStrat.strategies[platform] || 'No strategy'
  const stratExpo = myStrat.maxExposure[platform] || STRAT_MAX_EXPO
  const maxExposition = Math.max(
    5 + 0.05,
    Math.min(totalBuy, stratExpo || STRAT_MAX_EXPO)
  )

  let stratTps: StratTps
  switch (strat) {
    case 'shad':
      stratTps = calculateRecupsShad(strat, maxExposition, totalBuy, totalSell)
      break
    default:
      stratTps = calculateRecupsShad(strat, maxExposition, totalBuy, totalSell)
      break
  }

  const result = {
    base,
    platform,
    totalBuy,
    totalSell,
    strat,
    stratExpo,
    maxExposition,
    stratTps
  }

  return result
}

/**
 * Retrieve the platform fee percentage based on the platform name
 */
export function getPlatformFee(platform: PLATFORM): number {
  const fees: Record<string, number> = {
    binance: PLATFORM_FEES.binance,
    kucoin: PLATFORM_FEES.kucoin,
    htx: PLATFORM_FEES.htx,
    okx: PLATFORM_FEES.okx,
    gateio: PLATFORM_FEES.gateio,
    default: PLATFORM_FEES.default
  }

  return fees[platform.toLowerCase()] || fees.default
}

/**
 * Calculates amounts and prices
 */
export function calculateAmountsAndPrices(
  balance: number,
  averageEntryPrice: number,
  recup: Recup
): AmountsAndPrices {
  if (recup.strat === 'shad') {
    return calculateAmountsAndPricesForShad(balance, averageEntryPrice, recup)
  }
  return calculateAmountsAndPricesForShad(balance, averageEntryPrice, recup)

  //throw new Error('Strategy not implemented')
}
