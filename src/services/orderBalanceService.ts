// src/services/orderBalanceService.ts
import {
  createPlatformInstance,
} from '@utils/platformUtil'
import { MongodbService } from '@services/mongodbService'
import { MappingService } from '@services/mappingService'
import { Order, Exchange } from 'ccxt'
import { MappedOrder } from '@typ/database'
import { handleServiceError } from '@utils/errorUtil'
import config from '@config/index';

const COLLECTION_NAME = config.collection.order;
const COLLECTION_TYPE = config.collectionType.order;

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
      await MongodbService.saveDataToDatabase(mappedData, COLLECTION_NAME, platform, COLLECTION_TYPE)
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
        return await this.fetchOpenOrdersByPage(platformInstance)
      } else {
        return await platformInstance.fetchOpenOrders()
      }
    } catch (error) {
      handleServiceError(error, 'fetchOpenOrdersByPlatform', `Error fetching open orders for ${platform}`)
      throw error
    }
  }

  static async fetchOpenOrdersByPage(platformInstance: Exchange): Promise<Order[]> {
    const pageSize = 100
    let currentPage = 1
    let allOrders: Order[] = []

    while (true) {
      const limit = pageSize
      const params = { currentPage }
      const orders = await platformInstance.fetchOpenOrders(
        undefined,
        undefined,
        limit,
        params
      )
      allOrders = allOrders.concat(orders)

      if (orders.length < pageSize) {
        break
      }

      currentPage++
    }

    return allOrders
  }
}