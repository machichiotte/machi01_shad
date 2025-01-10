// src/services/serviceCache.ts
import { config } from '@config/index'
import { CacheExpirationTimes } from '@config/types'
import { DEFAULT_CACHE_EXPIRATION_TIMES } from '@config/default'
import { CacheItem } from '@typ/cache'
import { MappedData } from '@typ/database'
import { API_CONFIG, BALANCE, CMC, MACHI, MARKET, ORDER, STRAT, TICKER, TRADE, USER, SERVER_CONFIG, HIGHEST_PRICE, SWAP, TIMESTAMP } from '@src/constants/collection'

type CacheKey = keyof typeof DEFAULT_CACHE_EXPIRATION_TIMES

export class ServiceCache {
  private static cache: { [key: string]: CacheItem } = {}

  /**
   * Adds data to cache with a timestamp.
   */
  static async addToCache(key: string, data: MappedData[]): Promise<void> {
    return Promise.resolve().then(() => {
      ServiceCache.cache[key] = {
        data,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Retrieves cached data if it has not expired.
   */
  static async getFromCache(key: CacheKey): Promise<MappedData[] | null> {
    return Promise.resolve().then(() => {
      const cacheItem = ServiceCache.cache[key]
      const expirationTime =
        (config.serverConfig?.cacheExpirationTimes as CacheExpirationTimes)[key] ||
        DEFAULT_CACHE_EXPIRATION_TIMES[key] ||
        0

      if (cacheItem && Date.now() - cacheItem.timestamp < expirationTime) {
        return cacheItem.data
      }

      return null
    })
  }

  /**
   * Clears cache for a specific key. 
   */
  static async clearCache(key: CacheKey): Promise<void> {
    return Promise.resolve().then(() => {
      delete ServiceCache.cache[key]
    })
  }

  /**
   * Clears all cache.
   */
  static async clearAllCache(): Promise<void> {
    return Promise.resolve().then(() => {
      ServiceCache.cache = {};
    });
  }

  static getCacheKeyForCollection(
    collectionName: string
  ): keyof typeof DEFAULT_CACHE_EXPIRATION_TIMES {
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
