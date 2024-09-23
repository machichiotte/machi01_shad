// src/services/tradeService.ts
import { createPlatformInstance } from '@utils/platformUtil'
import { handleServiceError } from '@utils/errorUtil'
import { LastUpdateService } from '@services/lastUpdateService'
import { MappingService } from '@services/mappingService'
import { TradeRepository } from '@repositories/tradeRepository'
import { MappedTrade, TradeServiceResult, ManualTradeAdditionResult } from '@typ/trade'
import { Trade } from 'ccxt'
import Exchange from 'ccxt/js/src/abstract/kucoin'
import config from '@config/index'

const TRADES_TYPE = config.collectionType.trades

export class TradeService {
  static async fetchDatabaseTrades(): Promise<MappedTrade[]> {
    return await TradeRepository.fetchAllTrades()
  }

  static async fetchLastTrades(platform: string, symbol: string): Promise<Trade[]> {
    try {
      const platformInstance = createPlatformInstance(platform)
      return await platformInstance.fetchMyTrades(symbol)
    } catch (error) {
      handleServiceError(error, 'fetchLastTrades', `Error fetching last trades for ${platform}`)
      throw error
    }
  }

  static async updateTradeById(tradeId: string, updatedTrade: Partial<MappedTrade>): Promise<boolean> {
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

  static async updateTrades(platform: string): Promise<TradeServiceResult> {
    try {
      const mappedData = await this.fetchPlatformTrades(platform)
      await TradeRepository.deleteAndProcessTrades(mappedData, platform)
      await LastUpdateService.saveLastUpdateToDatabase(TRADES_TYPE, platform)
      return { data: mappedData }
    } catch (error) {
      handleServiceError(error, 'updateTrades', `Error updating trades for ${platform}`)
      throw error
    }
  }

  static async addTradesManually(tradesData: MappedTrade | MappedTrade[]): Promise<ManualTradeAdditionResult> {
    try {
      const savedTrade = await TradeRepository.insertTrades(tradesData)
      return { data: savedTrade }
    } catch (error) {
      handleServiceError(error, 'addTradesManually', 'Error adding trades manually')
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

  private static async fetchPlatformTrades(platform: string): Promise<MappedTrade[]> {
    const platformInstance = createPlatformInstance(platform) as Exchange

    let trades: Trade[] = []

    switch (platform) {
      case 'kucoin':
        trades = await this.fetchKucoinTrades(platformInstance)
        break
      case 'htx':
        trades = await this.fetchHtxTrades(platformInstance)
        break
      default:
        throw new Error(`Plateforme non supportée: ${platform}`)
    }

    return MappingService.mapTrades(platform, trades)
  }


  private static async fetchKucoinTrades(platformInstance: Exchange): Promise<Trade[]> {
    const weeksBack = 4 * 52
    let allTrades: Trade[] = []
    for (let i = weeksBack; i > 1; i--) {
      const trades = await platformInstance.fetchMyTrades(
        undefined,
        Date.now() - i * 7 * 86400 * 1000,
        500
      )
      allTrades = allTrades.concat(trades)
    }
    return allTrades
  }

  private static async fetchHtxTrades(platformInstance: Exchange): Promise<Trade[]> {
    const currentTime = Date.now()
    const windowSize = 48 * 60 * 60 * 1000
    const totalDuration = 1 * 365 * 24 * 60 * 60 * 1000
    const iterations = Math.ceil(totalDuration / windowSize)
    let allTrades: Trade[] = []

    for (let i = 0; i < iterations; i++) {
      const startTime = currentTime - (i + 1) * windowSize
      const endTime = currentTime - i * windowSize
      const param = { 'start-time': startTime, 'end-time': endTime }
      const trades = await platformInstance.fetchMyTrades(undefined, undefined, 1000, param)
      allTrades = allTrades.concat(trades)
    }
    return allTrades
  }
}