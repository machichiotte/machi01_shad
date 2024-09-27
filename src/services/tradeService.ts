// src/services/tradeService.ts
import { handleServiceError } from '@utils/errorUtil'
import { TimestampService } from '@services/timestampService'
import { MappingService } from '@services/mappingService'
import { TradeRepository } from '@repositories/tradeRepository'
import { MappedTrade, TradeServiceResult, ManualTradeAdditionResult } from '@typ/trade'
import { config } from '@config/index';
import { PLATFORM, PlatformTrade } from '@typ/platform'
import { PlatformService } from './platformService'

const TRADES_TYPE = config.collectionType.trade

export class TradeService {
  static async fetchDatabaseTrades(): Promise<MappedTrade[]> {
    return await TradeRepository.fetchAllTrades()
  }

  static async fetchLastTrades(platform: PLATFORM, symbol: string): Promise<PlatformTrade[]> {
    try {
      return await PlatformService.fetchRawTrade(platform, symbol)
    } catch (error) {
      handleServiceError(error, 'fetchLastTrades', `Error fetching last trades for ${platform}`)
      throw error
    }
  }

  static async updateTradeById(tradeId: string, updatedTrade: MappedTrade): Promise<boolean> {
    if (!tradeId) {
      throw new Error(`L'ID du trade est requis`)
    }

    try {
      return await TradeRepository.updateTradeById(tradeId, updatedTrade)
    } catch (error) {
      handleServiceError(error, 'updateTradeById', `Error updating trade with id ${tradeId}`)
      throw error
    }
  }

  static async updateTrades(platform: PLATFORM): Promise<TradeServiceResult> {
    try {
      const mappedData = await this.fetchPlatformTrades(platform)
      await TradeRepository.deleteAndProcessTrades(mappedData, platform)
      await TimestampService.saveTimestampToDatabase(TRADES_TYPE, platform)
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
    const trades = await PlatformService.fetchPlatformTrades(platform)
    return MappingService.mapTrades(platform, trades)
  }
}