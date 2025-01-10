// src/services/api/platform/serviceOrderBalance.ts
import { RepoOrderBalance } from '@repo/repoOrderBalance';
import { ServiceCcxt } from '@services/api/platform/serviceCcxt';
import { MappingPlatform } from '@services/api/platform/mappingPlatform';
import { handleServiceError } from '@utils/errorUtil';
import { PLATFORM } from '@typ/platform';
import { MappedOrder } from '@typ/order';

export class ServiceOrderBalance {

  static async fetchDatabase(): Promise<MappedOrder[]> {
    return await RepoOrderBalance.fetchAll()
  }

  /**
   * Get all orders for a specific symbol.
   */
  static async getOrdersBySymbol(symbol: string): Promise<MappedOrder[]> { 
    const orders = await RepoOrderBalance.fetchAll();
    return orders.filter(order => order.symbol === symbol);
  }

  /**
   * Get all orders for a specific platform.
   */
  static async getOrdersByPlatform(platform: string): Promise<MappedOrder[]> {
    const orders = await RepoOrderBalance.fetchAll();
    return orders.filter(order => order.platform === platform);
  }

  /**
   * Get all orders by side (buy or sell).
   */
  static async getOrdersBySide(side: string): Promise<MappedOrder[]> {
    const orders = await RepoOrderBalance.fetchAll();
    return orders.filter(order => order.side?.toLowerCase() === side.toLowerCase());
  }

  /**
   * Get all orders by type (limit, market, etc.).
   */
  static async getOrdersByType(type: string): Promise<MappedOrder[]> {
    const orders = await RepoOrderBalance.fetchAll();
    return orders.filter(order => order.type?.toLowerCase() === type.toLowerCase());
  }

  /**
   * Get all orders for a specific platform and symbol.
   */
  static async getOrdersByPlatformAndSymbol(platform: string, symbol: string): Promise<MappedOrder[]> {
    const orders = await RepoOrderBalance.fetchAll();
    return orders.filter(order => order.platform === platform && order.symbol === symbol);
  }

  /**
   * Fetch and map orders for a given platform.
   */
  static async fetchAndMapOrders(platform: PLATFORM): Promise<Omit<MappedOrder, '_id'>[]> {
    try {
      const data = await ServiceCcxt.fetchOpenOrdersByPlatform(platform);
      const mappedData = MappingPlatform.mapOrders(platform, data);
      console.info(`Fetched and mapped orders for ${platform}:`, { count: mappedData.length });
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
      await RepoOrderBalance.save(mappedData, platform);
      console.info(`Updated orders from server for ${platform}.`, { count: mappedData.length });
    } catch (error) {
      handleServiceError(error, 'updateOrdersFromServer', `Error updating orders from server for ${platform}`);
      throw error;
    }
  }
}
