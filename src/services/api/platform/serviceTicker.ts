// src/services/serviceTicker.ts
import { RepoTicker } from '@repo/repoTicker'
import { ServiceCcxt } from '@services/api/platform/serviceCcxt'
import { MappingPlatform } from '@services/api/platform/mappingPlatform'
import { handleServiceError } from '@utils/errorUtil'
import { executeCronTask } from '@utils/cronUtil'
import { retry } from '@utils/retryUtil'
import { MappedTicker } from '@typ/ticker'
import { PLATFORM } from '@typ/platform'
import { PLATFORMS } from '@src/constants/platform'
 
export class ServiceTicker {
  static async fetchDatabaseTickers(): Promise<MappedTicker[]> {
    return await RepoTicker.fetchAll()
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
      const data = await ServiceCcxt.fetchRawTicker(platform)
      tickersData.push(...MappingPlatform.mapTickers(platform, data))
      await RepoTicker.saveTickers(platform, tickersData)
    }
    return tickersData
  }

  static async updateTickersForPlatform(platform: PLATFORM): Promise<void> {
    try {
      const currentTickers = await ServiceTicker.fetchCurrentTickers(platform)
      await RepoTicker.saveTickers(platform, currentTickers)
    } catch (error) {
      handleServiceError(error, 'updateTickersForPlatform', `Erreur lors de la mise à jour des tickers pour ${platform}`)
    }
  }

  static async fetchCurrentTickers(platform: PLATFORM): Promise<Omit<MappedTicker, '_id'>[]> {

    try {
      return await retry(async () => {
        const data = await ServiceCcxt.fetchRawTicker(platform);
        return MappingPlatform.mapTickers(platform, data);
      }, [], 'fetchCurrentTickers');
    } catch (error) {
      handleServiceError(error, 'fetchCurrentTickers', `Error fetching tickers for ${platform}`);
      throw error;
    }
  }

  static async cronTicker(platform: PLATFORM): Promise<void> {
    await executeCronTask(() => ServiceTicker.updateTickersForPlatform(platform), true)

  }
}