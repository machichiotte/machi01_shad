// src/services/orderBalanceService.ts
import {
  createPlatformInstance,
} from '@utils/platformUtil'
import { MongodbService } from '@services/mongodbService'
import { DatabaseService } from '@services/databaseService'
import { MappingService } from '@services/mapping'
import { Order, Exchange } from 'ccxt'
import { MappedOrder } from '@models/dbTypes'
import { handleServiceError } from '@utils/errorUtil'

const COLLECTION_NAME = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS as string
const COLLECTION_TYPE = process.env.TYPE_ACTIVE_ORDERS as string

export class OrderBalanceService {

  /**
   * Fetches orders from the database.
   */
  static async fetchDatabaseOrders(): Promise<MappedOrder[]> {
    return await MongodbService.getData(COLLECTION_NAME) as MappedOrder[]
  }

  /**
   * Fetches and maps orders for a given platform.
   */
  static async fetchAndMapOrders(platform: string): Promise<MappedOrder[]> {
    try {
      const data = await this.fetchOpenOrdersByPlatform(platform)
      const mappedData = MappingService.mapOrders(platform, data)
      console.log(`Fetched and mapped orders for ${platform}:`, {
        count: mappedData.length
      })
      return mappedData
    } catch (error) {
      handleServiceError(error, 'fetchAndMapOrders', `Error fetching and mapping orders for ${platform}`)
      throw error
    }
  }

  /**
   * Updates orders from the server for a given platform.
   */
  static async updateOrdersFromServer(platform: string): Promise<MappedOrder[]> {
    try {
      const mappedData = await this.fetchAndMapOrders(platform)
      await DatabaseService.saveDataToDatabase(mappedData, COLLECTION_NAME, platform, COLLECTION_TYPE)
      console.log(`Updated orders from server for ${platform}.`, {
        count: mappedData.length
      })
      return mappedData
    } catch (error) {
      handleServiceError(error, 'updateOrdersFromServer', `Error updating orders from server for ${platform}`)
      throw error
    }
  }

  /**
   * Fetches open orders for a given platform.
   */
  static async fetchOpenOrdersByPlatform(platform: string): Promise<Order[]> {
    const platformInstance = createPlatformInstance(platform)
    try {
      if (platform === 'binance' && platformInstance.options) {
        platformInstance.options.warnOnFetchOpenOrdersWithoutSymbol = false
      }

      if (platform === 'kucoin') {
        return await this.fetchOpenOrdersForKucoin(platformInstance)
      } else {
        return await platformInstance.fetchOpenOrders()
      }
    } catch (error) {
      handleServiceError(error, 'fetchOpenOrdersByPlatform', `Error fetching open orders for ${platform}`)
      throw error
    }
  }

  /**
   * Fetches open orders for Kucoin platform.
   */
  static async fetchOpenOrdersForKucoin(platformInstance: Exchange): Promise<Order[]> {
    const pageSize = 50
    let currentPage = 1
    let data: Order[] = []

    while (true) {
      const limit = pageSize
      const params = { currentPage }
      const orders = await platformInstance.fetchOpenOrders(
        undefined,
        undefined,
        limit,
        params
      )
      data = data.concat(orders)

      if (orders.length < pageSize) {
        break
      }

      currentPage++
    }

    return data
  }
}