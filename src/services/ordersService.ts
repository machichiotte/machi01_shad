import {
  createPlatformInstance,
  getSymbolForPlatform
} from '@utils/platformUtil'
import { getData } from '@utils/dataUtil'
import { DatabaseService } from './databaseService'
import { mapOrders } from './mapping'
import { Order, Exchange } from 'ccxt'
import { MappedOrder } from 'src/models/dbTypes'
import { handleServiceError } from '@utils/errorUtil'

const COLLECTION_NAME = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS as string
const COLLECTION_TYPE = process.env.TYPE_ACTIVE_ORDERS as string

export class OrdersService {

  static async createOrUpdateStopLossOrder(platform: string, stopPrice: number, base: string, balance: number): Promise<void> {
    return await this.createStopLossOrder(platform, base, balance, 'sell', 'limit', stopPrice)
  }

  /**
   * Fetches orders from the database.
   */
  static async fetchDatabaseOrders(): Promise<MappedOrder[]> {
    return await getData(COLLECTION_NAME) as MappedOrder[]
  }

  /**
   * Fetches and maps orders for a given platform.
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
      handleServiceError(error, 'fetchAndMapOrders', `Error fetching and mapping orders for ${platform}`)
      throw error
    }
  }

  /**
   * Sauvegarde les données d'ordres fournies dans la base de données.
   */
  static async saveMappedOrders(platform: string, mappedData: MappedOrder[]): Promise<void> {
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
   */
  static async updateOrdersFromServer(platform: string): Promise<MappedOrder[]> {
    try {
      const mappedData = await this.fetchAndMapOrders(platform)
      await this.saveMappedOrders(platform, mappedData)
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
   * Deletes an order for a given platform.
   */
  static async deleteOrder(platform: string, oId: string, symbol: string): Promise<void> {
    try {
      const platformInstance = createPlatformInstance(platform)
      await platformInstance.cancelOrder(oId, symbol.replace('/', ''))
      console.log(`Deleted order ${oId} for ${platform}.`, { symbol })
    } catch (error) {
      handleServiceError(error, 'deleteOrder', `Error deleting ${symbol}order with id ${oId} for ${platform}`)
      throw error
    }
  }

  /**
   * Creates a market order for a given platform.
   */
  static async createMarketOrder(platform: string, asset: string, amount: number, orderType: 'buy' | 'sell'): Promise<void> {
    this.createOrder(platform, asset, amount, orderType, 'market')
  }

  /**
   * Creates a limit order for a given platform.
   */
  static async createLimitOrder(platform: string, asset: string, amount: number, orderType: 'buy' | 'sell', price: number): Promise<void> {
    this.createOrder(platform, asset, amount, orderType, 'limit', price)
  }

  private static async executeOrder(platformInstance: Exchange, symbol: string, amount: number, orderSide: 'buy' | 'sell', orderMode: 'market' | 'limit', price?: number, stopLossPrice?: number): Promise<Order> {
    if (orderMode === 'market') {
      return orderSide === 'buy'
        ? await platformInstance.createMarketBuyOrder(symbol, amount)
        : await platformInstance.createMarketSellOrder(symbol, amount)
    } else if (orderMode === 'limit') {
      if (price === undefined) {
        throw new Error('Le prix doit être spécifié pour les ordres limites.')
      }
      if (stopLossPrice) {
        return await platformInstance.createStopOrder(symbol, 'limit', orderSide, amount / 2, price, stopLossPrice)
      }
      return orderSide === 'buy'
        ? await platformInstance.createLimitBuyOrder(symbol, amount, price)
        : await platformInstance.createLimitSellOrder(symbol, amount, price)
    }
    throw new Error('Mode d\'ordre non valide')
  }

  static async createStopLossOrder(platform: string, asset: string, amount: number, orderType: 'buy' | 'sell', orderMode: 'market' | 'limit', stopPrice?: number): Promise<void> {
    try {
      const platformInstance = createPlatformInstance(platform)
      const symbol = getSymbolForPlatform(platform, asset)

      if (stopPrice === undefined) {
        throw new Error('Le prix doit être spécifié pour les ordres stop loss.')
      }

      const stopLossPrice = stopPrice - stopPrice * 0.001
      await this.executeOrder(platformInstance, symbol, amount, orderType, orderMode, stopLossPrice, stopPrice)
    } catch (error) {
      handleServiceError(error, 'createStopLossOrder', `Error creating stop loss order for ${platform}`)
      throw error
    }
  }

  static async createOrder(platform: string, asset: string, amount: number, orderType: 'buy' | 'sell', orderMode: 'market' | 'limit', price?: number): Promise<void> {
    console.log('createOrder', platform, asset, amount, orderType, orderMode, price)
    try {
      const platformInstance = createPlatformInstance(platform)
      const symbol = getSymbolForPlatform(platform, asset)

      await this.executeOrder(platformInstance, symbol, amount, orderType, orderMode, price)

    } catch (error) {
      handleServiceError(error, 'createOrder', `Error creating order for ${platform}`)
      throw error
    }
  }

  /**
   * Cancels all orders for a given platform and asset.
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

      //console.log(`Cancelled all ${symbol} orders for ${platform}.`)
      return { message: `Cancelled all ${symbol} orders for ${platform}.` }
    } catch (error) {
      handleServiceError(error, 'cancelAllOrders', `Error canceling all orders for ${platform}`)
      throw error
    }
  }

  /**
   * Cancels all sell orders for a given platform and asset.
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
      handleServiceError(error, 'cancelAllSellOrders', `Error canceling all sell orders for ${platform}`)
      throw error
    }
  }

  /**
   * Cancels all orders for OKX platform.
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