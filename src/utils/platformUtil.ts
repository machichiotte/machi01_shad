// src/utils/platformUtil.ts
import { config } from '@config/index';
import { PLATFORM } from '@typ/platform'
import { PLATFORMS } from '@constants/platform'
import path from 'path'; import { logger } from './loggerUtil';

// Fonction utilitaire pour valider la plateforme
function isValidPlatform(platform: string): platform is PLATFORM {
  return PLATFORMS.includes(platform as PLATFORM);
}

/**
     * Vérifie la présence des clés API nécessaires pour une plateforme donnée.
     * @param platform La plateforme à vérifier
     * @returns true si toutes les clés nécessaires sont présentes, false sinon
     */
function checkApiKeys(platform: PLATFORM): boolean {
  const operation = 'checkApiKeys'
  const platformConfig = config.apiConfig.platform[platform];
  if (!platformConfig) {
    logger.debug(`Configuration manquante pour la plateforme : ${platform}`, { module: path.parse(__filename).name, operation });
    return false;
  }

  const { apiKey, secretKey } = platformConfig;
  if (!apiKey || !secretKey) {
    logger.debug(`Clés API manquantes pour la plateforme : ${platform}`, { module: path.parse(__filename).name, operation });
    return false;
  }

  // Vérification spécifique pour les plateformes nécessitant un passphrase
  if (['kucoin', 'okx'].includes(platform)) {
    if (!('passphrase' in platformConfig) || !platformConfig.passphrase) {
      logger.debug(`Passphrase manquant pour la plateforme : ${platform}`, { module: path.parse(__filename).name, operation });
      return false;
    }
  }

  return true;
}

/**
 * Get the symbol format for a specific platform
 */
function getMarketSymbolForPlatform(platform: PLATFORM, base: string, quote: string = 'USDC'
): string {
  let symbol: string

  switch (platform) {
    case 'kucoin':
      symbol = `${base.toUpperCase()}-${quote.toUpperCase()}`
      break
    case 'binance':
      symbol = `${base.toUpperCase()}${quote.toUpperCase()}`
      break
    case 'htx':
      symbol = `${base.toLowerCase()}${quote.toLowerCase()}`
      break
    case 'gateio':
      symbol = `${base.toUpperCase()}_${quote.toUpperCase()}`
      break
    case 'okx':
      symbol = `${base.toUpperCase()}-${quote.toUpperCase()}`
      break
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
  return symbol
}

export { isValidPlatform, getMarketSymbolForPlatform, checkApiKeys }