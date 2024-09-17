import {
  createPlatformInstance,
  getSymbolForPlatform
} from '@utils/platformUtil'
import { getData } from '@utils/dataUtil'
import { DatabaseService } from './databaseService'
import { mapOrders } from './mapping'
import { Order, Exchange } from 'ccxt'
import { MappedOrder } from 'src/models/dbTypes'

const COLLECTION_NAME = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS as string
const COLLECTION_TYPE = process.env.TYPE_ACTIVE_ORDERS as string

export class OrdersService {

  /**
   * Fetches orders from the database.
   * @returns {Promise<MappedOrder[]>} A promise that resolves to an array of orders.
   */
  static async fetchDatabaseOrders(): Promise<MappedOrder[]> {
    return await getData(COLLECTION_NAME) as MappedOrder[]
  }

  /**
   * Fetches and maps orders for a given platform.
   * @param {string} platform - The platform to fetch orders for.
   * @returns {Promise<MappedOrder[]>} A promise that resolves to an array of mapped orders.
   * @throws {Error} If fetching or mapping fails.
   */
  static async fetchAndMapOrders(platform: string): Promise<MappedOrder[]> {
    try {
      const data = await this.fetchOpenOrdersByPlatform(platform)
      const mappedData = mapOrders(platform, data)
      console.log(`Fetched and mapped orders for ${platform}:`, {
        count: mappedData.length
      })
      return mappedData
    } catch (error) {
      console.error(`Failed to fetch and map orders for ${platform}:`, error)
      throw new Error(`Erreur lors de la récupération et du mapping des ordres pour ${platform}: ${(error as Error).message}`)
    }
  }

  /**
   * Sauvegarde les données d'ordres fournies dans la base de données.
   * @param {MappedOrder[]} mappedData - Les données de marché à sauvegarder.
   * @param {string} platform - Identifiant de la plateforme.
   */
  static async saveMappedOrders(
    platform: string,
    mappedData: MappedOrder[]
  ): Promise<void> {
    if (COLLECTION_NAME && COLLECTION_TYPE) {
      await DatabaseService.saveDataToDatabase(mappedData, COLLECTION_NAME, platform, COLLECTION_TYPE)
    } else {
      throw new Error(
        'Missing environment variables for collection or update type'
      )
    }
  }

  /**
   * Updates orders from the server for a given platform.
   * @param {string} platform - The platform to update orders for.
   * @returns {Promise<Order[]>} A promise that resolves to an array of updated orders.
   * @throws {Error} If updating fails.
   */
  static async updateOrdersFromServer(
    platform: string
  ): Promise<MappedOrder[]> {
    try {
      const mappedData = await this.fetchAndMapOrders(platform)
      await this.saveMappedOrders(platform, mappedData)
      console.log(`Updated orders from server for ${platform}.`, {
        count: mappedData.length
      })
      return mappedData
    } catch (error) {
      console.error(`Failed to update orders from server for ${platform}.`, error)
      throw error
    }
  }

  /**
   * Deletes an order for a given platform.
   * @param {string} platform - The platform to delete the order from.
   * @param {string} oId - The order ID to delete.
   * @param {string} symbol - The symbol of the order.
   * @returns {Promise<any>} A promise that resolves to the result of the deletion.
   * @throws {Error} If deletion fails.
   */
  static async deleteOrder(
    platform: string,
    oId: string,
    symbol: string
  ): Promise<void> {
    try {
      const platformInstance = createPlatformInstance(platform)
      await platformInstance.cancelOrder(oId, symbol.replace('/', ''))
      console.log(`Deleted order ${oId} for ${platform}.`, { symbol })
    } catch (error) {
      console.error(`Failed to delete order for ${platform}:`, error)
      throw error
    }
  }

  /**
   * Creates a market order for a given platform.
   * @param {string} platform - The platform to create the order on.
   * @param {string} asset - The asset to trade.
   * @param {number} amount - The amount to trade.
   * @param {string} orderType - The type of order ('buy' or 'sell').
   * @returns {Promise<any>} A promise that resolves to the created order.
   * @throws {Error} If order creation fails.
   */
  static async createMarketOrder(
    platform: string,
    asset: string,
    amount: number,
    orderType: 'buy' | 'sell'
  ): Promise<void> {
    this.createOrder(platform, asset, amount, orderType, 'market')
  }

  /**
   * Creates a limit order for a given platform.
   * @param {string} platform - The platform to create the order on.
   * @param {string} asset - The asset to trade.
   * @param {number} amount - The amount to trade.
   * @param {number} price - The price for the limit order.
   * @param {string} orderType - The type of order ('buy' or 'sell').
   * @returns {Promise<any>} A promise that resolves to the created order.
   * @throws {Error} If order creation fails.
   */
  static async createLimitOrder(
    platform: string,
    asset: string,
    amount: number,
    orderType: 'buy' | 'sell',
    price: number
  ): Promise<void> {
    this.createOrder(platform, asset, amount, orderType, 'limit', price)
  }

  private static async executeOrder(platformInstance: Exchange, symbol: string, amount: number, orderType: 'buy' | 'sell', orderMode: 'market' | 'limit', price?: number): Promise<Order> {
    if (orderMode === 'market') {
      return orderType === 'buy'
        ? await platformInstance.createMarketBuyOrder(symbol, amount)
        : await platformInstance.createMarketSellOrder(symbol, amount)
    } else if (orderMode === 'limit') {
      if (price === undefined) {
        throw new Error('Le prix doit être spécifié pour les ordres limites.')
      }
      return orderType === 'buy'
        ? await platformInstance.createLimitBuyOrder(symbol, amount, price)
        : await platformInstance.createLimitSellOrder(symbol, amount, price)
    }
    throw new Error('Mode d\'ordre non valide')
  }

  static async createOrder(
    platform: string,
    asset: string,
    amount: number,
    orderType: 'buy' | 'sell',
    orderMode: 'market' | 'limit',
    price?: number
  ): Promise<void> {
    try {
      const platformInstance = createPlatformInstance(platform)
      const symbol = getSymbolForPlatform(platform, asset)

      const result = await this.executeOrder(platformInstance, symbol, amount, orderType, orderMode, price)

      console.log(`Ordre ${orderType} ${orderMode} créé pour ${platform}.`, {
        symbol,
        amount,
        price: result?.price
      })
    } catch (error) {
      console.error(
        `Échec de la création de l'ordre ${orderType} ${orderMode} pour ${platform}:`,
        error
      )
      throw error
    }
  }

  /**
   * Cancels all orders for a given platform and asset.
   * @param {string} platform - The platform to cancel orders on.
   * @param {string} asset - The asset to cancel orders for.
   * @returns {Promise<any>} A promise that resolves to the result of the cancellation.
   * @throws {Error} If cancellation fails.
   */
  static async cancelAllOrders(platform: string, asset: string): Promise<{ message: string }> {
    try {
      const platformInstance = createPlatformInstance(platform)
      const symbol = getSymbolForPlatform(platform, asset)
      if (platform === 'okx') {
        await this.cancelAllOrdersForOkx(platformInstance, symbol)
      } else {
        await platformInstance.cancelAllOrders(symbol)
      }

      console.log(`Cancelled all ${symbol} orders for ${platform}.`)
      return { message: `Cancelled all ${symbol} orders for ${platform}.` }
    } catch (error) {
      console.error(`Failed to cancel all orders for ${platform}:`, error)
      throw error
    }
  }

  /**
   * Cancels all sell orders for a given platform and asset.
   * @param {string} platform - The platform to cancel orders on.
   * @param {string} asset - The asset to cancel orders for.
   * @returns {Promise<any>} A promise that resolves to the result of the cancellation.
   * @throws {Error} If cancellation fails.
   */
  static async cancelAllSellOrders(platform: string, asset: string): Promise<{ message: string }> {
    try {
      const platformInstance = createPlatformInstance(platform)
      const symbol = getSymbolForPlatform(platform, asset)
      const openOrders = await platformInstance.fetchOpenOrders(symbol)
      const sellOrders = openOrders.filter((order) => order.side === 'sell')

      if (sellOrders.length === 0) {
        return { message: 'No open sell orders for this asset' }
      }

      for (const order of sellOrders) {
        await platformInstance.cancelOrder(order.id, order.symbol)
      }

      console.log(`Cancelled all sell orders for ${platform}.`, { symbol })
      return { message: 'All sell orders canceled successfully' }
    } catch (error) {
      console.error(`Failed to cancel all sell orders for ${platform}:`, error)
      throw error
    }
  }

  /**
   * Cancels all orders for OKX platform.
   * @param {PlatformInstance} platformInstance - The platform instance for OKX.
   * @param {string} symbol - The symbol to cancel orders for.
   * @returns {Promise<any>} A promise that resolves to the result of the cancellation.
   */
  static async cancelAllOrdersForOkx(platformInstance: Exchange, symbol: string): Promise<{ message: string }> {
    const orders = await platformInstance.fetchOpenOrders(symbol)
    const orderIds = orders.map((order) => order.id)

    if (orderIds.length === 0) {
      return { message: 'Aucun ordre ouvert pour ce symbole' }
    } else {
      await Promise.all(orderIds.map(id => platformInstance.cancelOrder(id, symbol)))
      return { message: `${orderIds.length} ordres annulés avec succès` }
    }
  }

  /**
   * Fetches open orders for a given platform.
   * @param {string} platform - The platform to fetch orders from.
   * @returns {Promise<Order[]>} A promise that resolves to an array of open orders.
   * @throws {Error} If fetching fails.
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
      console.error(`Failed to fetch open orders for ${platform}.`, error)
      throw error
    }
  }

  /**
   * Fetches open orders for Kucoin platform.
   * @param {PlatformInstance} platformInstance - The platform instance for Kucoin.
   * @returns {Promise<Order[]>} A promise that resolves to an array of open orders.
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
