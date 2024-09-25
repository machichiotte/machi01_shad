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
  static addToCache(key: string, data: MappedData[]): void {
    CacheService.cache[key] = {
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * Retrieves cached data if it has not expired.
   */
  static getFromCache(key: CacheKey): MappedData[] | null {
    const cacheItem = CacheService.cache[key];
    const expirationTime = config.cacheExpirationTimes[key] || 0;

    if (cacheItem && (Date.now() - cacheItem.timestamp < expirationTime)) {
      return cacheItem.data;
    }

    return null;
  }

  /**
   * Clears cache for a specific key.
   */
  static clearCache(key: CacheKey): void {
    delete CacheService.cache[key];
  }
}
