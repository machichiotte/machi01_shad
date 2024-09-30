// src/services/orderBalanceService.ts
import { PlatformService } from '@services/platformService'
import { MongodbService } from '@services/mongodbService'
import { MappingService } from '@services/mappingService'
import { MappedOrder } from '@typ/order'
import { handleServiceError } from '@utils/errorUtil'
import { config } from '@config/index';
import { PLATFORM } from '@src/types/platform';

const COLLECTION_NAME = config.collection.order;
const COLLECTION_CATEGORY = config.collectionCategory.order;

export class OrderBalanceService {

  /**
   * Fetches orders from the database.
   */
  static async fetchDatabaseOrders(): Promise<MappedOrder[]> {
    return await MongodbService.getData(COLLECTION_NAME) as MappedOrder[]
  }

  /**
   * Get all orders for a specific symbol
   */
  static async getOrdersBySymbol(symbol: string): Promise<MappedOrder[]> {
    const orders = await this.fetchDatabaseOrders();
    return orders.filter(order => order.symbol === symbol);
  }

  /**
 * Get all orders for a specific platform
 */
  static async getOrdersByPlatform(platform: string): Promise<MappedOrder[]> {
    const orders = await this.fetchDatabaseOrders();
    return orders.filter(order => order.platform === platform);
  }

  /**
   * Get all orders by side (buy or sell)
   */
  static async getOrdersBySide(side: string): Promise<MappedOrder[]> {
    const orders = await this.fetchDatabaseOrders();
    return orders.filter(order => order.side?.toLowerCase() === side.toLowerCase());
  }

  /**
   * Get all orders by type (limit, market, etc.)
   */
  static async getOrdersByType(type: string): Promise<MappedOrder[]> {
    const orders = await this.fetchDatabaseOrders();
    return orders.filter(order => order.type?.toLowerCase() === type.toLowerCase());
  }

  /**
   * Example: Get all orders for a specific platform and symbol
   */
  static async getOrdersByPlatformAndSymbol(platform: string, symbol: string): Promise<MappedOrder[]> {
    const orders = await this.fetchDatabaseOrders();
    return orders.filter(order => order.platform === platform && order.symbol === symbol);
  }

  /**
   * Fetches and maps orders for a given platform.
   */
  static async fetchAndMapOrders(platform: PLATFORM): Promise<Omit<MappedOrder, '_id'>[]> {
    try {
      const data = await PlatformService.fetchOpenOrdersByPlatform(platform)
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
  static async updateOrdersFromServer(platform: PLATFORM): Promise<void> {
    try {
      const mappedData = await this.fetchAndMapOrders(platform)

      await MongodbService.saveDataToDatabase(mappedData, COLLECTION_NAME, COLLECTION_CATEGORY, platform)
      console.log(`Updated orders from server for ${platform}.`, {
        count: mappedData.length
      })
    } catch (error) {
      handleServiceError(error, 'updateOrdersFromServer', `Error updating orders from server for ${platform}`)
      throw error
    }
  }
}