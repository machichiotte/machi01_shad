// src/services/tradeService.ts
import { handleServiceError } from '@utils/errorUtil'
import { TimestampService } from '@services/timestampService'
import { MappingService } from '@services/mappingService'
import { TradeRepository } from '@repositories/tradeRepository'
import { MappedTrade, TradeServiceResult, ManualTradeAdditionResult } from '@typ/trade'
import { config } from '@config/index';
import { PLATFORM, PlatformTrade } from '@typ/platform'
import { CcxtService } from '@services/ccxtService'
import { MarketService } from './marketService'
import { QUOTE_CURRENCIES } from '@src/constants'
import { getMarketSymbolForPlatform } from '@utils/platformUtil'
import { retry } from '@src/utils/retryUtil'

const COLLECTION_CATEGORY = config.collectionCategory.trade

export class TradeService {
  static async fetchDatabaseTrades(): Promise<MappedTrade[]> {
    return await TradeRepository.fetchAllTrades()
  }

  static async fetchLastTrades(platform: PLATFORM, base: string): Promise<PlatformTrade[]> {
    const markets = await MarketService.getSavedMarkets();
    const validSymbols = QUOTE_CURRENCIES
      .filter(quote => markets.some(market =>
        market.base === base && market.quote === quote && market.platform === platform
      ))
      .map(quote => getMarketSymbolForPlatform(platform, base, quote));

    const trades: PlatformTrade[] = [];
    const batchSize = 3; // Ajustez selon les limites de l'API

    for (let i = 0; i < validSymbols.length; i += batchSize) {
      const symbolBatch = validSymbols.slice(i, i + batchSize);

      const batchPromises = symbolBatch.map(symbol =>
        retry(
          async () => CcxtService.fetchRawTrade(platform, symbol),
          [],
          `fetchRawTrade(${platform}, ${symbol})`
        )
      );

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(result => trades.push(...result));

      // Ajoutez un délai entre les lots pour respecter les limites de taux
      if (i + batchSize < validSymbols.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 secondes de délai
      }
    }

    return trades;
  }

  static async updateTradeById(updatedTrade: MappedTrade): Promise<boolean> {
    if (!updatedTrade._id) {
      throw new Error(`L'ID du trade est requis`)
    }

    try {
      return await TradeRepository.updateTradeById(updatedTrade)
    } catch (error) {
      handleServiceError(error, 'updateTradeById', `Error updating trade with id ${updatedTrade._id}`)
      throw error
    }
  }

  static async updateTrades(platform: PLATFORM): Promise<TradeServiceResult> {
    try {
      const mappedData = await this.fetchPlatformTrades(platform)
      await TradeRepository.insertTrades(mappedData)
      await TimestampService.saveTimestampToDatabase(COLLECTION_CATEGORY, platform)
      return { data: mappedData }
    } catch (error) {
      handleServiceError(error, 'updateTrades', `Error updating trades for ${platform}`)
      throw error
    }
  }

  static async insertNewTrades(tradesData: MappedTrade | MappedTrade[]): Promise<ManualTradeAdditionResult> {
    try {
      const savedTrade = await TradeRepository.insertTrades(tradesData)
      return { data: savedTrade }
    } catch (error) {
      handleServiceError(error, 'insertNewTrades', 'Error adding trades manually')
      throw error
    }
  }

  static async saveTradesToDatabase(newTrades: MappedTrade[]): Promise<void> {
    try {
      const existingTrades = await this.fetchDatabaseTrades()
      await TradeRepository.insertFilteredTrades(newTrades, existingTrades)
    } catch (error) {
      handleServiceError(error, 'saveTradesToDatabase', 'Error saving trades to database')
      throw error
    }
  }

  private static async fetchPlatformTrades(platform: PLATFORM): Promise<MappedTrade[]> {
    const trades = await CcxtService.fetchPlatformTrades(platform)
    return MappingService.mapTrades(platform, trades)
  }
}