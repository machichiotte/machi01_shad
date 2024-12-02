// src/utils/mappingUtil.ts
import { STABLECOINS, MAJOR_CRYPTO_PAIRS } from '@src/constants'

/**
 * Checks if a given symbol is a stablecoin.
 */
function isStableCoin(symbol: string): boolean {
  return STABLECOINS.includes(symbol.toUpperCase())
}

/**
 * Checks if a given symbol is a major cryptocurrency pair.
 */
function isMajorCryptoPair(symbol: string): boolean {
  return MAJOR_CRYPTO_PAIRS.includes(symbol.toUpperCase())
}

/**
 * Calculates the total value in USDT for a given symbol and cost.
 */
function getEqUSD(symbol: string, cost: number, conversionRates: Record<string, number> = {}): number | null {
  const [baseAsset, quoteAsset] = symbol.split('/')
  if (!quoteAsset || !baseAsset) {
    console.error(`Invalid symbol format: ${symbol}`)
    return null
  }

  if (isStableCoin(quoteAsset)) {
    return parseFloat(cost.toString())
  }

  if (quoteAsset in conversionRates) {
    return parseFloat(cost.toString()) * conversionRates[quoteAsset]
  }

  return null
}

export { isStableCoin, isMajorCryptoPair, getEqUSD }