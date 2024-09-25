// src/utils/platformUtil.ts
import * as ccxt from 'ccxt'
import { handleServiceError } from './errorUtil'
import { config } from '@config/index';
import { PLATFORM, PLATFORMS } from '@typ/platform'

// Fonction utilitaire pour valider la plateforme
function isValidPlatform(platform: string): platform is PLATFORM {
  return PLATFORMS.includes(platform as PLATFORM);
}

/**
 * Utility function to create an exchange instance
 */
function createPlatformInstance(platform: PLATFORM): ccxt.Exchange {
  //par eemple si platform cest binance
  if (!platform) {
    throw new Error(`Plateforme incorrecte`);
  }


  // Récupérer la configuration de la plateforme
  //comment je fais ici
  /*
  Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ binance: { apiKey: string; secretKey: string; }; kucoin: { apiKey: string; secretKey: string; passphrase: string; }; htx: { apiKey: string; secretKey: string; }; okx: { apiKey: string; secretKey: string; passphrase: string; }; gateio: { ...; }; }'.
    No index signature with a parameter of type 'string' was found on type '{ binance: { apiKey: string; secretKey: string; }; kucoin: { apiKey: string; secretKey: string; passphrase: string; }; htx: { apiKey: string; secretKey: string; }; okx: { apiKey: string; secretKey: string; passphrase: string; }; gateio: { ...; }; }'.ts(7053)
    */
  const platformConfig = config.apiKeys.platform[platform];

  if (!platformConfig) {
    throw new Error(`Configuration manquante pour la plateforme : ${platform}`);
  }

  const { apiKey, secretKey } = platformConfig
  const passphrase = 'passphrase' in platformConfig ? platformConfig.passphrase : undefined;

  if (!apiKey || !secretKey) {
    throw new Error(`Clés API manquantes pour la plateforme : ${platform}`)
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

export { isValidPlatform, createPlatformInstance, getSymbolForPlatform }