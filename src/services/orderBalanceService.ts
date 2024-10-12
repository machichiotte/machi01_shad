// src/services/orderBalanceService.ts
import { CcxtService } from '@services/ccxtService';
import { MappingService } from '@services/mappingService';
import { MappedOrder } from '@typ/order';
import { handleServiceError } from '@utils/errorUtil';
import { PLATFORM } from '@src/types/platform';
import { OrderBalanceRepository } from '@repositories/orderBalanceRepository';

export class OrderBalanceService {

  static async fetchDatabase(): Promise<MappedOrder[]> {
    return await OrderBalanceRepository.fetchAll()
  }

  /**
   * Get all orders for a specific symbol.
   */
  static async getOrdersBySymbol(symbol: string): Promise<MappedOrder[]> {
    const orders = await OrderBalanceRepository.fetchAll();
    return orders.filter(order => order.symbol === symbol);
  }

  /**
   * Get all orders for a specific platform.
   */
  static async getOrdersByPlatform(platform: string): Promise<MappedOrder[]> {
    const orders = await OrderBalanceRepository.fetchAll();
    return orders.filter(order => order.platform === platform);
  }

  /**
   * Get all orders by side (buy or sell).
   */
  static async getOrdersBySide(side: string): Promise<MappedOrder[]> {
    const orders = await OrderBalanceRepository.fetchAll();
    return orders.filter(order => order.side?.toLowerCase() === side.toLowerCase());
  }

  /**
   * Get all orders by type (limit, market, etc.).
   */
  static async getOrdersByType(type: string): Promise<MappedOrder[]> {
    const orders = await OrderBalanceRepository.fetchAll();
    return orders.filter(order => order.type?.toLowerCase() === type.toLowerCase());
  }

  /**
   * Get all orders for a specific platform and symbol.
   */
  static async getOrdersByPlatformAndSymbol(platform: string, symbol: string): Promise<MappedOrder[]> {
    const orders = await OrderBalanceRepository.fetchAll();
    return orders.filter(order => order.platform === platform && order.symbol === symbol);
  }

  /**
   * Fetch and map orders for a given platform.
   */
  static async fetchAndMapOrders(platform: PLATFORM): Promise<Omit<MappedOrder, '_id'>[]> {
    try {
      const data = await CcxtService.fetchOpenOrdersByPlatform(platform);
      const mappedData = MappingService.mapOrders(platform, data);
      console.log(`Fetched and mapped orders for ${platform}:`, { count: mappedData.length });
      return mappedData;
    } catch (error) {
      handleServiceError(error, 'fetchAndMapOrders', `Error fetching and mapping orders for ${platform}`);
      throw error;
    }
  }

  /**
   * Update orders from the server for a given platform.
   */
  static async updateOrdersFromServer(platform: PLATFORM): Promise<void> {
    try {
      const mappedData = await this.fetchAndMapOrders(platform);
      await OrderBalanceRepository.save(mappedData, platform);
      console.log(`Updated orders from server for ${platform}.`, { count: mappedData.length });
    } catch (error) {
      handleServiceError(error, 'updateOrdersFromServer', `Error updating orders from server for ${platform}`);
      throw error;
    }
  }
}
