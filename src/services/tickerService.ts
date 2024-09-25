// src/services/tickerService.ts
import { createPlatformInstance } from '@utils/platformUtil'
import { TimestampService } from '@services/timestampService'
import { MappingService } from '@services/mappingService'
import { handleServiceError } from '@utils/errorUtil'
import { retry } from '@src/utils/retryUtil'
import { TickerRepository } from '@repositories/tickerRepository'
import { MappedTicker } from '@typ/ticker'
import { config } from '@config/index';
import { PLATFORM, PLATFORMS } from '@src/types/platform'

const COLLECTION_TYPE = config.collectionType.ticker

export class TickerService {
  static async fetchDatabaseTickers(): Promise<MappedTicker[]> {
    return TickerRepository.fetchAll()
  }

  static async getFilteredTickers(platform: PLATFORM, additionalFilter?: (ticker: MappedTicker) => boolean): Promise<MappedTicker[]> {
    const data = await TickerRepository.fetchAll()

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

  static async getAllTickersByPlatform(platform: PLATFORM): Promise<MappedTicker[]> {
    return this.getFilteredTickers(platform)
  }

  static async getAllTickersBySymbolFromPlatform(platform: PLATFORM, symbol: string): Promise<MappedTicker[]> {
    return this.getFilteredTickers(
      platform,
      (ticker: MappedTicker) => ticker.symbol === symbol
    )
  }

  static async updateAllTickers(): Promise<MappedTicker[]> {
    const tickersData: MappedTicker[] = []
    for (const platform of PLATFORMS) {
      const platformInstance = createPlatformInstance(platform)
      const data = await platformInstance.fetchTickers()
      tickersData.push(...MappingService.mapTickers(platform, data))
    }

    await TickerRepository.deleteAndSaveAll(tickersData)
    await TimestampService.saveTimestampToDatabase(COLLECTION_TYPE, 'combined')
    return tickersData
  }

  static async updateTickersForPlatform(platform: PLATFORM): Promise<void> {
    try {
      const currentTickers = await this.fetchCurrentTickers(platform)
      await TickerRepository.saveForPlatform(currentTickers, platform)
    } catch (error) {
      handleServiceError(error, 'updateTickersForPlatform', `Erreur lors de la mise à jour des tickers pour ${platform}`)
    }
  }

  static async fetchCurrentTickers(platform: PLATFORM): Promise<MappedTicker[]> {
    const fetchAndMapTickers = async () => {
      const platformInstance = createPlatformInstance(platform);
      const data = await platformInstance.fetchTickers();
      return MappingService.mapTickers(platform, data);
    };

    try {
      return await retry(fetchAndMapTickers, [], 3, 1000);
    } catch (error) {
      handleServiceError(error, 'fetchCurrentTickers', `Error fetching tickers for ${platform}`);
      throw error;
    }
  }
}