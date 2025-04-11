// src/services/serviceCache.ts
import { config } from '@config/index'
import { CacheExpirationTimes } from '@config/types'
import { DEFAULT_CACHE_EXPIRATION_TIMES } from '@config/default'
import { CacheItem } from '@typ/cache'
import { MappedData } from '@typ/database'
import { API_CONFIG, BALANCE, CMC, MACHI, MARKET, ORDER, STRAT, TICKER, TRADE, USER, SERVER_CONFIG, HIGHEST_PRICE, SWAP, TIMESTAMP } from '@constants/collection'
import path from 'path'; import { logger } from '@src/utils/loggerUtil'
type CacheKey = keyof typeof DEFAULT_CACHE_EXPIRATION_TIMES

export class ServiceCache {
  private static cache: { [key: string]: CacheItem } = {}

  // Ajoute des données au cache avec horodatage
  static async addToCache(key: string, data: MappedData[]): Promise<void> {
    const operation = 'addToCache'
    logger.debug(`Début addToCache pour la clé: ${key}`, { module: path.parse(__filename).name, operation })
    ServiceCache.cache[key] = { data, timestamp: Date.now() }
    logger.debug(`Fin addToCache pour la clé: ${key}`, { module: path.parse(__filename).name, operation })
  }

  // Récupère les données du cache si elles ne sont pas expirées
  static async getFromCache(key: CacheKey): Promise<MappedData[] | null> {
    const operation = 'getFromCache'

    logger.debug(`Début getFromCache pour la clé: ${key}`, { module: path.parse(__filename).name, operation })
    const cacheItem = ServiceCache.cache[key]
    const expirationTime =
      (config.serverConfig?.cacheExpirationTimes as CacheExpirationTimes)[key] ||
      DEFAULT_CACHE_EXPIRATION_TIMES[key] ||
      0

    if (cacheItem && Date.now() - cacheItem.timestamp < expirationTime) {
      logger.debug(`Cache valide pour la clé: ${key}`, { module: path.parse(__filename).name, operation })
      return cacheItem.data
    }

    logger.debug(`Cache expiré ou inexistant pour la clé: ${key}`, { module: path.parse(__filename).name, operation })
    return null
  }

  // Efface le cache pour une clé spécifique
  static async clearCache(key: CacheKey): Promise<void> {
    const operation = 'clearCache'

    logger.debug(`Début clearCache pour la clé: ${key}`, { module: path.parse(__filename).name, operation })
    delete ServiceCache.cache[key]
    logger.debug(`Fin clearCache pour la clé: ${key}`, { module: path.parse(__filename).name, operation })
  }

  // Efface l'ensemble du cache
  static async clearAllCache(): Promise<void> {
    const operation = 'clearAllCache'

    logger.debug('Début clearAllCache', { module: path.parse(__filename).name, operation })
    ServiceCache.cache = {}
    logger.debug('Fin clearAllCache', { module: path.parse(__filename).name, operation })
  }

  // Renvoie la clé de cache correspondant à une collection
  static getCacheKeyForCollection(collectionName: string): keyof typeof DEFAULT_CACHE_EXPIRATION_TIMES {
    const operation = 'getCacheKeyForCollection'

    logger.debug(`Mapping de la collection: ${collectionName}`, { module: path.parse(__filename).name, operation })
    switch (collectionName) {
      case config.databaseConfig.collection.balance:
        return BALANCE
      case config.databaseConfig.collection.cmc:
        return CMC
      case config.databaseConfig.collection.highestPrice:
        return HIGHEST_PRICE
      case config.databaseConfig.collection.timestamp:
        return TIMESTAMP
      case config.databaseConfig.collection.market:
        return MARKET
      case config.databaseConfig.collection.order:
        return ORDER
      case config.databaseConfig.collection.machi:
        return MACHI
      case config.databaseConfig.collection.strat:
        return STRAT
      case config.databaseConfig.collection.swap:
        return SWAP
      case config.databaseConfig.collection.ticker:
        return TICKER
      case config.databaseConfig.collection.trade:
        return TRADE
      case config.databaseConfig.collection.user:
        return USER
      case config.databaseConfig.collection.serverConfig:
        return SERVER_CONFIG
      case config.databaseConfig.collection.apiConfig:
        return API_CONFIG
      default:
        throw new Error(`Collection non reconnue: ${collectionName}`)
    }
  }
}
