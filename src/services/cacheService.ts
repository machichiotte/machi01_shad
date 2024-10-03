// src/services/cacheService.ts
import { config } from '@config/index'
import { CacheItem } from '@src/types/cache';
import { MappedData } from '@src/types/database';

type CacheKey = keyof typeof config.cacheExpirationTimes;

export class CacheService {
  private static cache: { [key: string]: CacheItem } = {};

  /**
   * Adds data to cache with a timestamp.
   */
  static async addToCache(key: string, data: MappedData[]): Promise<void> {
    return Promise.resolve().then(() => {
      CacheService.cache[key] = {
        data,
        timestamp: Date.now(),
      };
    });
  }

  /**
   * Retrieves cached data if it has not expired.
   */
  static async getFromCache(key: CacheKey): Promise<MappedData[] | null> {
    return Promise.resolve().then(() => {
      const cacheItem = CacheService.cache[key];
      const expirationTime = config.cacheExpirationTimes[key] || 0;

      if (cacheItem && (Date.now() - cacheItem.timestamp < expirationTime)) {
        return cacheItem.data;
      }

      return null;
    });
  }

  /**
   * Clears cache for a specific key.
   */
  static async clearCache(key: CacheKey): Promise<void> {
    return Promise.resolve().then(() => {
      delete CacheService.cache[key];
    });
  }

  static getCacheKeyForCollection(collectionName: string): keyof typeof config.cacheExpirationTimes {
    switch (collectionName) {
      case config.collection.balance:
        return 'balance';
      case config.collection.cmc:
        return 'cmc';
      case config.collection.highestPrice:
        return 'highestPrice';
      case config.collection.timestamp:
        return 'timestamp';
      case config.collection.market:
        return 'market';
      case config.collection.order:
        return 'order';
      case config.collection.shad:
        return 'shad';
      case config.collection.strat:
        return 'strat';
      case config.collection.swap:
        return 'swaps';
      case config.collection.ticker:
        return 'ticker';
      case config.collection.trade:
        return 'trade';
      case config.collection.user:
        return 'user';
      default:
        throw new Error(`Collection non reconnue: ${collectionName}`);
    }
  }
}
