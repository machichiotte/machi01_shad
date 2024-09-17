// src/services/tickersService.ts
import { getData } from '@utils/dataUtil'
import { createPlatformInstance, getPlatforms } from '@utils/platformUtil'
import { loadErrorPolicies, shouldRetry } from '@utils/errorUtil'
import { LastUpdateService } from './lastUpdateService'
import { deleteAndReplaceAll } from './mongodbService'
import { DatabaseService } from './databaseService'
import { mapTickers } from './mapping'
import { MappedTicker } from 'src/models/dbTypes'

export class TickersService {

  /**
   * Fetches tickers data from the database.
   * @returns {Promise<TickerData>} The tickers data.
   */
  static async fetchDatabaseTickers(): Promise<MappedTicker[]> {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS as string
    return await getData(collectionName) as MappedTicker[]
  }

  /**
   * Gets filtered tickers for a specific platform.
   * @param {string} platform - The platform to get tickers for.
   * @param {(ticker: MappedTicker) => boolean} [additionalFilter] - Optional additional filter.
   * @returns {Promise<MappedTicker[]>} An array of tickers for the platform.
   * @throws {Error} If the platform is not found or if no data is available.
   */
  static async getFilteredTickers(
    platform: string,
    additionalFilter?: (ticker: MappedTicker) => boolean
  ): Promise<MappedTicker[]> {
    const data = await this.fetchDatabaseTickers()

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data found')
    }

    let filteredData = data.filter(
      (ticker: MappedTicker) => ticker.platform === platform
    )

    if (filteredData.length === 0) {
      throw new Error('Platform not found')
    }

    if (additionalFilter) {
      filteredData = filteredData.filter(additionalFilter)
      if (filteredData.length === 0) {
        throw new Error('No tickers found after additional filtering')
      }
    }

    return filteredData
  }

  /**
   * Gets all tickers for a specific platform.
   * @param {string} platform - The platform to get tickers for.
   * @returns {Promise<MappedTicker[]>} An array of tickers for the platform.
   * @throws {Error} If the platform is not found.
   */
  static async getAllTickersByPlatform(
    platform: string
  ): Promise<MappedTicker[]> {
    return this.getFilteredTickers(platform)
  }

  /**
   * Gets all tickers for a specific symbol from a platform.
   * @param {string} platform - The platform to get tickers from.
   * @param {string} symbol - The symbol to get tickers for.
   * @returns {Promise<MappedTicker[]>} An array of tickers for the symbol and platform.
   * @throws {Error} If the platform or symbol is not found.
   */
  static async getAllTickersBySymbolFromPlatform(
    platform: string,
    symbol: string
  ): Promise<MappedTicker[]> {
    return this.getFilteredTickers(
      platform,
      (ticker: MappedTicker) => ticker.symbol === symbol
    )
  }

  /**
   * Updates all tickers for all platforms.
   * @returns {Promise<TickerData>} The updated tickers data.
   */
  static async updateAllTickers(): Promise<MappedTicker[]> {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS as string
    const collectionType = process.env.TYPE_TICKERS as string
    const tickersData: MappedTicker[] = []
    const platforms = getPlatforms()
    for (const platform of platforms) {
      const platformInstance = createPlatformInstance(platform)
      const data = await platformInstance.fetchTickers()
      tickersData.push(...mapTickers(platform, data))
    }

    await deleteAndReplaceAll(collectionName, tickersData)
    await LastUpdateService.saveLastUpdateToDatabase(collectionType, 'combined')
    return tickersData
  }

  /**
   * Fetches current tickers for a specific platform.
   * @param {string} platform - The platform to fetch tickers for.
   * @param {number} [retries=3] - The number of retry attempts.
   * @returns {Promise<any[]>} The mapped tickers data.
   * @throws {Error} If fetching fails after all retries.
   */
  static async fetchCurrentTickers(
    platform: string,
    retries: number = 3
  ): Promise<MappedTicker[]> {
    const errorPolicies = await loadErrorPolicies()

    try {
      const platformInstance = createPlatformInstance(platform)
      const data = await platformInstance.fetchTickers()
      return mapTickers(platform, data)
    } catch (error) {
      console.log(`Error while fetching tickers for ${platform}:`, error as Error)

      if (retries > 0 && shouldRetry(platform, error as Error, errorPolicies)) {
        const delay = Math.pow(2, 3 - retries) * 1000
        console.log(`Retrying fetchCurrentTickers... (${3 - retries + 1}/3)`, {
          delay
        })
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.fetchCurrentTickers(platform, retries - 1)
      }

      throw error
    }
  }

  /**
   * Saves the provided tickers data to the database.
   * @param {any[]} mappedData - The tickers data to be saved.
   * @param {string} platform - Identifier of the platform.
   */
  static async saveDatabaseTickers(
    mappedData: MappedTicker[],
    platform: string
  ): Promise<void> {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS
    const updateType = process.env.TYPE_TICKERS

    await DatabaseService.saveDataToDatabase(
      mappedData,
      collectionName as string,
      platform,
      updateType as string
    )
  }

}
