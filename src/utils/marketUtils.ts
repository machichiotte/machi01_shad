// src/utils/marketUtils.ts
import {
  QUOTE_CURRENCIES_FIAT, // Assurez-vous que le chemin est correct
  MAJOR_CRYPTO_PAIRS,
  STABLECOINS_EUR,
  STABLECOINS_USD
} from '../constants/assets' // Ajustez le chemin si nécessaire

/**
 * Extrait la devise de cotation d'un symbole de marché (ex: 'USDT' de 'BTCUSDT').
 * @param marketSymbol - Le symbole du marché (ex: 'BTCUSDT').
 * @returns Le code de la devise de cotation (ex: 'USDT') ou null si non trouvé.
 */
export function getQuoteCurrency(marketSymbol: string | null | undefined): string | null {
  if (!marketSymbol) return null // Trouve la devise de cotation dans la liste QUOTE_CURRENCIES_FIAT qui termine le symbole.
  return QUOTE_CURRENCIES_FIAT.find((q) => marketSymbol!.endsWith(q)) || null
}

/**
 * Détermine le symbole d'affichage pour un code de devise donné.
 * @param quote - Le code de la devise (ex: 'USD', 'EUR', 'BTC', 'USDT').
 * @returns Le symbole d'affichage (ex: '$', '€', 'BTC', '$*') ou le code lui-même en fallback.
 */
export function getCurrencySymbol(quote: string | null | undefined): string {
  if (!quote) return '' // 1. Paires Crypto Majeures

  if (MAJOR_CRYPTO_PAIRS.includes(quote)) {
    return quote // BTC, ETH, BNB
  } // 2. Stablecoins EUR
  if (STABLECOINS_EUR.includes(quote)) {
    return '€*' // EURC, EURR
  } // 3. Stablecoins USD
  if (STABLECOINS_USD.includes(quote)) {
    return '$*' // USDC, USDT, BUSD, etc.
  } // 4. Devises Fiat
  switch (quote) {
    case 'EUR':
      return '€'
    case 'USD':
      return '$'
    case 'GBP':
      return '£'
    case 'JPY':
      return '¥'
    case 'CAD':
      return 'C$'
    case 'AUD':
      return 'A$'
    case 'CNY':
      return '¥' // Ou 'CN¥'
    case 'CHF':
      return 'Fr' // Ou 'CHF'
    case 'KRW':
      return '₩'
    case 'INR':
      return '₹'
    case 'RUB':
      return '₽'
    case 'BRL':
      return 'R$'
    case 'TRY':
      return '₺'
    default:
      return quote // Fallback pour les autres fiats (PLN, ZAR...)
  }
}

/**
 * Formate un symbole de marché pour l'affichage (ex: 'BTCUSDT' -> 'BTC/USDT').
 * @param symbol - Le symbole du marché (ex: 'BTCUSDT').
 * @returns Le symbole formaté (ex: 'BTC/USDT') ou le symbole original si le formatage échoue.
 */
export function formatMarketSymbolForDisplay(symbol: string): string {
  const quote = getQuoteCurrency(symbol) // Réutilise la fonction utilitaire
  if (quote) {
    const base = symbol.slice(0, symbol.length - quote.length)
    return `<span class="math-inline">${base}/</span>{quote}`
  }
  return symbol // Fallback
}

/**
 * Détermine le nombre approprié de décimales pour afficher un prix
 * en fonction de sa devise de cotation.
 * @param quoteCurrency - Le code de la devise de cotation (ex: 'USDT', 'BTC').
 * @returns Le nombre de décimales (ex: 2 pour fiat/stable, 8 pour crypto majeure).
 */
export function getPriceDisplayPrecision(quoteCurrency: string | null | undefined): number {
  if (quoteCurrency && MAJOR_CRYPTO_PAIRS.includes(quoteCurrency)) {
    return 8 // Plus de précision pour les cotations BTC, ETH, BNB
  }
  return 2 // Précision par défaut pour fiat, stables, etc.
}

/**
 * Retourne un nom de classe CSS basé sur le signe d'une valeur numérique.
 * @param value - Le nombre à vérifier (ex: pourcentage de changement).
 * @returns 'positive', 'negative', ou 'neutral'.
 */
export function getChangeStatusClass(
  value: number | undefined | null
): 'positive' | 'negative' | 'neutral' {
  if (value === undefined || value === null || isNaN(value)) {
    return 'neutral'
  }
  if (value > 0) {
    return 'positive'
  }
  if (value < 0) {
    return 'negative'
  }
  return 'neutral'
}
