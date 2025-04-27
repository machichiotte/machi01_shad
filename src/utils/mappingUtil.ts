// src/utils/mappingUtil.ts
import { STABLECOINS, MAJOR_CRYPTO_PAIRS } from '@src/constants/assets'
import path from 'path'; import { logger } from './loggerUtil'; // Importer le logger Winston

const myUtil = 'MappingUtil'; // Nom du module pour les logs
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
 * Calculates the total value in USDC for a given symbol and cost.
 */
function getEqUSD(symbol: string, cost: number, conversionRates: Record<string, number> = {}): number | null {
  const operation = 'getEqUSD';
  const [baseAsset, quoteAsset] = symbol.split('/')
  if (!quoteAsset || !baseAsset) {
    logger.error('Invalid symbol format, cannot calculate EqUSD.', { module: myUtil, operation, symbol });

    return null
  }

  const costValue = parseFloat(cost.toString());
  if (isNaN(costValue)) {
    logger.error('Invalid cost value provided.', { module: myUtil, operation, symbol, cost });
    return null;
  }


  if (isStableCoin(quoteAsset)) {
    return parseFloat(cost.toString())
  }

  if (quoteAsset in conversionRates) {
    const rate = conversionRates[quoteAsset];
    if (typeof rate !== 'number' || isNaN(rate)) {
      logger.warn(`Invalid conversion rate found for quote asset: ${quoteAsset}`, { module: myUtil, operation, symbol, quoteAsset, rate });
      return null; // Cannot convert if rate is invalid
    }
    const calculatedValue = costValue * rate;
    logger.debug(`Calculated EqUSD using conversion rate.`, { module: myUtil, operation, symbol, cost, quoteAsset, rate, calculatedValue });
    return calculatedValue;
  }

  // Log si aucune conversion n'est possible
  logger.debug(`Cannot calculate EqUSD: Quote asset '${quoteAsset}' is not stablecoin and no conversion rate provided.`, { module: myUtil, operation, symbol, cost, quoteAsset });
  return null;
}

export { isStableCoin, isMajorCryptoPair, getEqUSD }