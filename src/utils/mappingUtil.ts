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
 * @type {string[]}
 */
const cryptoMajorPairs: string[] = ['BTC', 'ETH']

/**
 * Checks if a given symbol is a stablecoin.
 * @param {string} symbol - The symbol to check.
 * @returns {boolean} True if the symbol is a stablecoin, false otherwise.
 */
function isStableCoin(symbol: string): boolean {
  return stableCoins.includes(symbol.toUpperCase())
}

/**
 * Returns the list of supported stablecoins.
 * @returns {string[]} An array of stablecoin symbols.
 */
function getStableCoins(): string[] {
  return stableCoins
}

/**
 * Checks if a given symbol is a major cryptocurrency pair.
 * @param {string} symbol - The symbol to check.
 * @returns {boolean} True if the symbol is a major pair, false otherwise.
 */
function isMajorCryptoPair(symbol: string): boolean {
  return cryptoMajorPairs.includes(symbol.toUpperCase())
}

/**
 * Calculates the total value in USDT for a given symbol and cost.
 * @param {string} symbol - The trading pair symbol.
 * @param {number} cost - The transaction cost.
 * @param {Record<string, number>} conversionRates - Conversion rates (optional).
 * @returns {number|null} The total value in USDT or null if unable to calculate.
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

  //console.warn(`Conversion rate for ${quoteAsset} not found.`);
  return null
}

export { isStableCoin, getStableCoins, isMajorCryptoPair, getTotalUSDT }
