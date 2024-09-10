// src/utils/platformUtil.ts
import * as ccxt from 'ccxt'
import { AuthenticationError } from 'ccxt'

const PLATFORMS: string[] = ['binance', 'kucoin']

/**
 * Utility function to create an exchange instance
 * @param {string} platform - The name of the trading platform
 * @returns {ccxt.Exchange} - An instance of the specified exchange
 * @throws {Error} If API key or secret is missing, or if the platform is unsupported
 * @throws {AuthenticationError} If there's an authentication error with the platform
 */
function createPlatformInstance(platform: string): ccxt.Exchange {
  const apiKey = process.env[`${platform.toUpperCase()}_API_KEY`]
  const secret = process.env[`${platform.toUpperCase()}_SECRET_KEY`]
  const passphrase = process.env[`${platform.toUpperCase()}_PASSPHRASE`] || ''

  if (!apiKey) {
    throw new Error(`API key missing for platform: ${platform}`)
  }

  if (!secret) {
    throw new Error(`API secret missing for platform: ${platform}`)
  }

  // Check if the platform is supported
  if (!PLATFORMS.includes(platform)) {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  try {
    // Check if the CCXT class exists
    if (!(platform in ccxt)) {
      throw new Error(`Unsupported platform: ${platform}`)
    }

    const platformParams: ccxt.Exchange['options'] = {
      apiKey,
      secret,
      ...(passphrase && { password: passphrase }),
      timeout: 20000, // Timeout for requests
      enableRateLimit: true // Enable rate limiting
    }

    return new (ccxt as any)[platform](platformParams)
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Handle authentication errors specifically
      throw new AuthenticationError(
        `Authentication error for ${platform}: ${error.message}`
      )
    } else {
      // Handle other errors
      throw new Error(
        `Error creating platform instance for ${platform}: ${(error as Error).message}`
      )
    }
  }
}

/**
 * Get the symbol format for a specific platform
 * @param {string} platform - The name of the trading platform
 * @param {string} base - The base currency
 * @param {string} [quote="USDT"] - The quote currency, defaults to USDT
 * @returns {string} - The formatted symbol for the specified platform
 * @throws {Error} If the platform is unsupported
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
 * @returns {string[]} - An array of supported platform names
 */
function getPlatforms(): string[] {
  return PLATFORMS
}

export { createPlatformInstance, getSymbolForPlatform, getPlatforms }
