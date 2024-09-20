// src/services/tickerService.ts
import { createPlatformInstance, getPlatforms } from '@utils/platformUtil'
import { loadErrorPolicies, shouldRetry } from '@utils/errorUtil'
import { LastUpdateService } from '@services/lastUpdateService'
import { MongodbService } from '@services/mongodbService'
import { DatabaseService } from '@services/databaseService'
import { MappingService } from '@services/mappingService'
import { MappedTicker } from '@models/dbTypes'
import { handleServiceError } from '@utils/errorUtil'

const COLLECTION_NAME = process.env.MONGODB_COLLECTION_TICKERS as string
const COLLECTION_TYPE = process.env.TYPE_TICKERS as string

export class TickerService {

  /**
   * Fetches tickers data from the database.
   */
  static async fetchDatabaseTickers(): Promise<MappedTicker[]> {
    return await MongodbService.getData(COLLECTION_NAME) as MappedTicker[]
  }

  /**
   * Gets filtered tickers for a specific platform.
   */
  static async getFilteredTickers(platform: string, additionalFilter?: (ticker: MappedTicker) => boolean): Promise<MappedTicker[]> {
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
   */
  static async getAllTickersByPlatform(platform: string): Promise<MappedTicker[]> {
    return this.getFilteredTickers(platform)
  }

  /**
   * Gets all tickers for a specific symbol from a platform.
   */
  static async getAllTickersBySymbolFromPlatform(platform: string, symbol: string): Promise<MappedTicker[]> {
    return this.getFilteredTickers(
      platform,
      (ticker: MappedTicker) => ticker.symbol === symbol
    )
  }

  /**
   * Updates all tickers for all platforms.
   */
  static async updateAllTickers(): Promise<MappedTicker[]> {
    const tickersData: MappedTicker[] = []
    const platforms = getPlatforms()
    for (const platform of platforms) {
      const platformInstance = createPlatformInstance(platform)
      const data = await platformInstance.fetchTickers()
      tickersData.push(...MappingService.mapTickers(platform, data))
    }

    await MongodbService.deleteAndReplaceAll(COLLECTION_NAME, tickersData)
    await LastUpdateService.saveLastUpdateToDatabase(COLLECTION_TYPE, 'combined')
    return tickersData
  }

  /**
   * Fetches current tickers for a specific platform.
   */
  static async fetchCurrentTickers(platform: string, retries: number = 3): Promise<MappedTicker[]> {
    const errorPolicies = await loadErrorPolicies()

    try {
      const platformInstance = createPlatformInstance(platform)
      const data = await platformInstance.fetchTickers()
      return MappingService.mapTickers(platform, data)
    } catch (error) {
      handleServiceError(error, 'fetchCurrentTickers', `Error fetching tickers for ${platform}`)
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
   */
  static async saveDatabaseTickers(mappedData: MappedTicker[], platform: string): Promise<void> {
    await DatabaseService.saveDataToDatabase(
      mappedData,
      COLLECTION_NAME,
      platform,
      COLLECTION_TYPE
    )
  }

  /**
 * Updates the tickers for a specified platform.
 */
  static async updateTickersForPlatform(platform: string): Promise<void> {
    try {
      const currentTickers = await TickerService.fetchCurrentTickers(platform, 3)
      await TickerService.saveDatabaseTickers(currentTickers, platform)
    } catch (error) {
      handleServiceError(error, 'updateTickersForPlatform', `Erreur lors de la mise à jour des tickers pour ${platform}`)
    }
  }
}