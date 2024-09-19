// src/utils/mappingUtil.ts

/**
 * List of supported stablecoins.
 * @type {string[]}
 */
const stableCoins: string[] = [
  'USDT',
  'USDC',
  'DAI',
  'FDUSD',
  'USDD',
  'TUSD',
  'FRAX',
  'PYUSD',
  'USDJ',
  'USDP',
  'GUSD',
  'LUSD'
]

/**
 * List of major cryptocurrency pairs.
 */
const cryptoMajorPairs: string[] = ['BTC', 'ETH']

/**
 * Checks if a given symbol is a stablecoin.
 */
function isStableCoin(symbol: string): boolean {
  return stableCoins.includes(symbol.toUpperCase())
}

/**
 * Returns the list of supported stablecoins.
 */
function getStableCoins(): string[] {
  return stableCoins
}

/**
 * Checks if a given symbol is a major cryptocurrency pair.
 */
function isMajorCryptoPair(symbol: string): boolean {
  return cryptoMajorPairs.includes(symbol.toUpperCase())
}

/**
 * Calculates the total value in USDT for a given symbol and cost.
 */
function getTotalUSDT(
  symbol: string,
  cost: number,
  conversionRates: Record<string, number> = {}
): number | null {
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

export { isStableCoin, getStableCoins, isMajorCryptoPair, getTotalUSDT }