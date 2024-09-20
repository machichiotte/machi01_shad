// src/services/tradeService.ts
import { createPlatformInstance } from '@utils/platformUtil'
import { handleServiceError } from '@utils/errorUtil'
import { getData } from '@utils/dataUtil'
import { updateDataMDB, deleteAndSaveData, saveData } from '@services/mongodbService'
import { LastUpdateService } from '@services/lastUpdateService'
import { mapTrades } from '@services/mapping'
import { MappedTrade } from '@models/dbTypes'

import { InsertOneResult, InsertManyResult } from 'mongodb'
import { Trade } from 'ccxt'
import Exchange from 'ccxt/js/src/abstract/kucoin'

const TRADES_COLLECTION = process.env.MONGODB_COLLECTION_TRADES as string
const TRADES_COLLECTION_2 = process.env.MONGODB_COLLECTION_TRADES2 as string
const TRADES_TYPE = process.env.TYPE_TRADES as string

export class TradeService {
  // Méthodes de récupération
  static async fetchDatabaseTrades(): Promise<MappedTrade[]> {
    return await getData(TRADES_COLLECTION) as MappedTrade[]
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

  // Méthodes de mise à jour
  static async updateTradeById(tradeId: string, updatedTrade: Partial<MappedTrade>): Promise<boolean> {
    if (!tradeId) {
      throw new Error('L\'ID du trade est requis')
    }

    try {
      return await updateDataMDB(TRADES_COLLECTION, { _id: tradeId }, { $set: updatedTrade })
    } catch (error) {
      handleServiceError(error, 'updateTradeById', `Error updating trade with id ${tradeId}`)
      throw error
    }
  }

  static async updateTrades(platform: string): Promise<{ data: MappedTrade[] }> {
    try {
      const mappedData = await this.fetchPlatformTrades(platform)
      await deleteAndSaveData(TRADES_COLLECTION, mappedData, platform)
      await LastUpdateService.saveLastUpdateToDatabase(TRADES_TYPE, platform)
      return { data: mappedData }
    } catch (error) {
      handleServiceError(error, 'updateTrades', `Error updating trades for ${platform}`)
      throw error
    }
  }

  // Méthodes d'ajout
  static async addTradesManually(tradesData: MappedTrade | MappedTrade[]): Promise<{ data: InsertOneResult<Document> | InsertManyResult<Document> }> {
    try {
      const savedTrade = await saveData(TRADES_COLLECTION, tradesData)
      return { data: savedTrade }
    } catch (error) {
      handleServiceError(error, 'addTradesManually', 'Error adding trades manually')
      throw error
    }
  }

  static async saveTradesToDatabase(newTrades: MappedTrade[]): Promise<void> {
    await this.saveTrades(newTrades, TRADES_COLLECTION, true)
  }

  static async saveAllTradesToDatabase(newTrades: MappedTrade[]): Promise<void> {
    await this.saveTrades(newTrades, TRADES_COLLECTION_2, false)
  }

  // Méthodes privées
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

    return mapTrades(platform, trades)
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

  private static async saveTrades(newTrades: MappedTrade[], collection: string, isFiltered: boolean): Promise<void> {
    try {
      let tradesToInsert = newTrades

      if (isFiltered) {
        const existingTrades = await this.fetchDatabaseTrades()
        tradesToInsert = newTrades.filter(newTrade =>
          !existingTrades.some(existingTrade => existingTrade.timestamp === newTrade.timestamp)
        )
      }

      if (tradesToInsert.length > 0) {
        await saveData(collection, tradesToInsert)
      }
    } catch (error) {
      handleServiceError(error, 'saveTrades', `Error saving trades to ${collection}`)
      throw error
    }
  }
}