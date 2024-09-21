// src/utils/platformUtil.ts
import * as ccxt from 'ccxt'
import { handleServiceError } from './errorUtil'
import config from '@config/index'

const PLATFORMS: string[] = ['binance', 'kucoin']

/**
 * Utility function to create an exchange instance
 */
function createPlatformInstance(platform: string): ccxt.Exchange {
  const platformConfig = config?.apiKeys?.[platform];

  if (!platformConfig) {
    throw new Error(`Configuration manquante pour la plateforme : ${platform}`);
  }

  const { apiKey, secretKey, passphrase } = platformConfig

  if (!apiKey || !secretKey) {
    throw new Error(`Clés API manquantes pour la plateforme : ${platform}`)
  }

  // Check if the platform is supported
  if (!PLATFORMS.includes(platform)) {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  try {
    // Check if the CCXT class exists
    const exchangeClass = ccxt[platform as keyof typeof ccxt] as typeof ccxt.Exchange
    if (typeof exchangeClass !== 'function') {
      throw new Error(`Plateforme non supportée : ${platform}`)
    }

    const platformParams: ccxt.Exchange['options'] = {
      apiKey,
      secretKey,
      ...(passphrase && { password: passphrase }),
      timeout: 20000, // Timeout for requests
      enableRateLimit: true // Enable rate limiting
    }

    return new exchangeClass(platformParams)
  } catch (error) {
    handleServiceError(error, 'createPlatformInstance', `Error creating platform instance for ${platform}`)
    throw error
  }
}

/**
 * Get the symbol format for a specific platform
 */
function getSymbolForPlatform(
  platform: string,
  base: string,
  quote: string = 'USDT'
): string {
  let symbol: string

  switch (platform) {
    case 'kucoin':
      symbol = `${base}-${quote.toUpperCase()}`
      break
    case 'binance':
      symbol = `${base}${quote.toUpperCase()}`
      break
    case 'htx':
      symbol = `${base.toLowerCase()}${quote.toLowerCase()}`
      break
    case 'gateio':
      symbol = `${base.toUpperCase()}_${quote.toUpperCase()}`
      break
    case 'okx':
      symbol = `${base}-${quote.toUpperCase()}`
      break
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }

  return symbol
}

/**
 * Get the list of supported platforms
 */
function getPlatforms(): string[] {
  return PLATFORMS
}

export { createPlatformInstance, getSymbolForPlatform, getPlatforms }