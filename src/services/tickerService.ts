// src/services/tickerService.ts
import { MappingService } from '@services/mappingService'
import { handleServiceError } from '@utils/errorUtil'
import { retry } from '@src/utils/retryUtil'
import { TickerRepository } from '@repositories/tickerRepository'
import { MappedTicker } from '@typ/ticker'
import { PLATFORM, PLATFORMS } from '@src/types/platform'
import { executeForPlatforms } from '@src/utils/cronUtil'
import { CcxtService } from '@services/ccxtService'

export class TickerService {
  static async fetchDatabaseTickers(): Promise<MappedTicker[]> {
    return await TickerRepository.fetchAll()
  }

  static async getFilteredTickers(platform: PLATFORM, additionalFilter?: (ticker: MappedTicker) => boolean): Promise<MappedTicker[]> {
    const data = await this.fetchDatabaseTickers()

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data found')
    }

    let filteredData = data.filter(
      ticker => ticker.platform === platform
    )

    if (filteredData.length === 0) {
      throw new Error(`Tickers not found for platform ${platform}`)
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

  static async updateAllTickers(): Promise<Omit<MappedTicker, '_id'>[]> {
    const tickersData: Omit<MappedTicker, '_id'>[] = []
    for (const platform of PLATFORMS) {
      const data = await CcxtService.fetchRawTicker(platform)
      tickersData.push(...MappingService.mapTickers(platform, data))
      await TickerRepository.saveTickers(platform, tickersData)
    }
    return tickersData
  }

  static async updateTickersForPlatform(platform: PLATFORM): Promise<void> {
    try {
      const currentTickers = await TickerService.fetchCurrentTickers(platform)
      await TickerRepository.saveTickers(platform, currentTickers)
    } catch (error) {
      handleServiceError(error, 'updateTickersForPlatform', `Erreur lors de la mise à jour des tickers pour ${platform}`)
    }
  }

  static async fetchCurrentTickers(platform: PLATFORM): Promise<Omit<MappedTicker, '_id'>[]> {

    try {
      return await retry(async () => {
        const data = await CcxtService.fetchRawTicker(platform);
        return MappingService.mapTickers(platform, data);
      }, [], 'fetchCurrentTickers');
    } catch (error) {
      handleServiceError(error, 'fetchCurrentTickers', `Error fetching tickers for ${platform}`);
      throw error;
    }
  }

  static async cronTicker(): Promise<void> {
    await executeForPlatforms('updateTickers', TickerService.updateTickersForPlatform)
  }
}