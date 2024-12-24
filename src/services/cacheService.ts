// src/services/cacheService.ts
import { config } from '@config/index'
import { DEFAULT_CACHE_EXPIRATION_TIMES } from '@config/default'
import { CacheItem } from '@src/types/cache'
import { MappedData } from '@src/types/database'

type CacheKey = keyof typeof DEFAULT_CACHE_EXPIRATION_TIMES

export class CacheService {
  private static cache: { [key: string]: CacheItem } = {}

  /**
   * Adds data to cache with a timestamp.
   */
  static async addToCache(key: string, data: MappedData[]): Promise<void> {
    return Promise.resolve().then(() => {
      CacheService.cache[key] = {
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
      const cacheItem = CacheService.cache[key]
      const expirationTime =
        config.serverConfig?.cacheExpirationTimes?.[key] ||
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
      delete CacheService.cache[key]
    })
  }

  /**
   * Clears all cache.
   */
  static async clearAllCache(): Promise<void> {
    return Promise.resolve().then(() => {
      CacheService.cache = {};
    });
  }

  static getCacheKeyForCollection(
    collectionName: string
  ): keyof typeof DEFAULT_CACHE_EXPIRATION_TIMES {
    switch (collectionName) {
      case config.databaseConfig.collection.balance:
        return 'balance'
      case config.databaseConfig.collection.cmc:
        return 'cmc'
      case config.databaseConfig.collection.highestPrice:
        return 'highestPrice'
      case config.databaseConfig.collection.timestamp:
        return 'timestamp'
      case config.databaseConfig.collection.market:
        return 'market'
      case config.databaseConfig.collection.order:
        return 'order'
      case config.databaseConfig.collection.machi:
        return 'machi'
      case config.databaseConfig.collection.strat:
        return 'strat'
      case config.databaseConfig.collection.swap:
        return 'swap'
      case config.databaseConfig.collection.ticker:
        return 'ticker'
      case config.databaseConfig.collection.trade:
        return 'trade'
      case config.databaseConfig.collection.user:
        return 'user'
      case config.databaseConfig.collection.serverConfig:
        return 'serverConfig'
      default:
        throw new Error(`Collection non reconnue: ${collectionName}`)
    }
  }
}
