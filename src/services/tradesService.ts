// src/services/tradeService.ts
import { createPlatformInstance } from '@utils/platformUtil'
import { getData } from '@utils/dataUtil'
import { updateDataMDB, deleteAndSaveData, saveData } from './mongodbService'
import { saveLastUpdateToDatabase } from './lastUpdateService'
import { mapTrades, MappedTrade } from './mapping'

import { Trade } from 'ccxt'

/**
 * Fetches trades from the database.
 * @returns {Promise<Trade[]>} A promise that resolves to an array of trades.
 */
async function fetchDatabaseTrades(): Promise<MappedTrade[]> {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES as string
  return await getData(collectionName) as MappedTrade[]
}

/**
 * Updates a trade by its ID.
 * @param {string} tradeId - The ID of the trade to update.
 * @param {Partial<MappedTrade>} updatedTrade - The updated trade data.
 * @returns {Promise<object>} A promise that resolves to the update result.
 */
async function updateTradeById(
  tradeId: string | undefined,
  updatedTrade: Partial<MappedTrade>
): Promise<object> {
  if (!tradeId) {
    throw new Error('Trade ID is required')
  }

  try {
    return await updateDataMDB(
      'collection_trades',
      { _id: tradeId },
      { $set: updatedTrade }
    )
  } catch (error) {
    console.error('Error updating trade:', error)
    throw error
  }
}

/**
 * Adds trades manually to the database.
 * @param {MappedTrade | MappedTrade[]} MappedTrade - The trade(s) data to add.
 * @returns {Promise<{message: any, data: any, status: number}>} A promise that resolves to the result of the operation.
 */
async function addTradesManually(
  tradesData: MappedTrade | MappedTrade[]
): Promise<object> {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES as string
  try {
    const savedTrade = await saveData(collectionName, tradesData)
    if (savedTrade.acknowledged) {
      return { message: savedTrade, data: savedTrade, status: 200 }
    } else {
      return { message: savedTrade, data: savedTrade, status: 400 }
    }
  } catch (error) {
    console.error('Error adding trades manually:', error)
    throw error
  }
}

/**
 * Updates trades for a specific platform.
 * @param {string} platform - The platform to update trades for.
 * @returns {Promise<{status: number, data: Trade[]}>} A promise that resolves to the result of the update operation.
 */
async function updateTrades(
  platform: string
): Promise<{ status: number; data: MappedTrade[] }> {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES
  const platformInstance = createPlatformInstance(platform)

  try {
    const mappedData: MappedTrade[] = []
    switch (platform) {
      case 'kucoin': {
        const weeksBack = 4 * 52
        for (let i = weeksBack; i > 1; i--) {
          const trades = await platformInstance.fetchMyTrades(
            undefined,
            Date.now() - i * 7 * 86400 * 1000,
            500
          )
          if (trades.length > 0) {
            mappedData.push(...mapTrades(platform, trades))
          }
        }
        break
      }

      case 'htx': {
        const currentTime = Date.now()
        const windowSize = 48 * 60 * 60 * 1000
        const totalDuration = 1 * 365 * 24 * 60 * 60 * 1000
        const iterations = Math.ceil(totalDuration / windowSize)

        for (let i = 0; i < iterations; i++) {
          const startTime = currentTime - (i + 1) * windowSize
          const endTime = currentTime - i * windowSize
          const param = {
            'start-time': startTime,
            'end-time': endTime
          }
          const trades = await platformInstance.fetchMyTrades(
            undefined,
            undefined,
            1000,
            param
          )
          if (trades.length > 0) {
            mappedData.push(...mapTrades(platform, trades))
          }
        }
        break
      }
    }

    await deleteAndSaveData(mappedData, collectionName as string, platform)
    await saveLastUpdateToDatabase(process.env.TYPE_TRADES as string, platform)

    return { status: 200, data: mappedData }
  } catch (error) {
    console.error('Error updating trades:', error)
    throw error
  }
}

/**
 * Fetches the last trades for a specific platform and symbol.
 * @param {string} platform - The platform to fetch trades from.
 * @param {string} symbol - The trading symbol.
 * @returns {Promise<Trade[]>} A promise that resolves to an array of the last trades.
 */
async function fetchLastTrades(
  platform: string,
  symbol: string
): Promise<Trade[]> {
  try {
    const platformInstance = createPlatformInstance(platform)
    return await platformInstance.fetchMyTrades(symbol)
  } catch (error) {
    console.error('Error fetching last trades:', error)
    throw error
  }
}

/**
 * Saves new trades to the database.
 * @param {Trade[]} newTrades - The new trades to save.
 * @returns {Promise<void>}
 */
async function saveTradesToDatabase(newTrades: Trade[]): Promise<void> {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES
  await saveTrades(newTrades, collectionName as string, true)
}

/**
 * Saves all trades to the database without filtering.
 * @param {Trade[]} newTrades - The trades to save.
 * @returns {Promise<void>}
 */
async function saveAllTradesToDatabase(newTrades: Trade[]): Promise<void> {
  const collectionName = process.env.MONGODB_COLLECTION_TRADES2
  await saveTrades(newTrades, collectionName as string, false)
}

/**
 * Helper function to save trades to a specified collection.
 * @param {Trade[]} newTrades - The trades to save.
 * @param {string} collection - The collection name to save trades to.
 * @param {boolean} isFiltered - Whether to filter out existing trades.
 * @returns {Promise<void>}
 */
async function saveTrades(
  newTrades: Trade[],
  collection: string,
  isFiltered: boolean
): Promise<void> {
  try {
    let filteredTrades = newTrades
    if (isFiltered) {
      const existingTrades = await fetchDatabaseTrades()
      filteredTrades = newTrades.filter((newTrade) => {
        return !existingTrades.some(
          (existingTrade) => existingTrade.timestamp === newTrade.timestamp
        )
      })
    }

    const tradesToInsert = filteredTrades.map((trade) => {
      return typeof trade === 'object' ? trade : { trade }
    })

    if (tradesToInsert.length > 0) {
      const result = await saveData(collection, tradesToInsert)
      console.log('Trades inserted:', result.insertedCount)
    }
  } catch (error) {
    console.error('Error saving trades:', error)
    throw error
  }
}

export {
  updateTradeById,
  fetchDatabaseTrades,
  addTradesManually,
  updateTrades,
  fetchLastTrades,
  saveTradesToDatabase,
  saveAllTradesToDatabase
}
