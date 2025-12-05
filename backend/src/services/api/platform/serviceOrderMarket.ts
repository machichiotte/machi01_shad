// src/services/api/platform/serviceOrderMarket.ts
import path from 'path';

import { getMarketSymbolForPlatform } from '@utils/platformUtil';
import { handleServiceError } from '@utils/errorUtil';
import { logger } from '@utils/loggerUtil';

import { PLATFORM } from '@typ/platform';
import { ServiceCcxt } from '@services/api/platform/serviceCcxt';
import { ServiceOrderBalance } from '@services/api/platform/serviceOrderBalance';

export class ServiceOrderMarket {
  static async createOrUpdateStopLossOrder(
    platform: PLATFORM,
    stopPrice: number,
    base: string,
    balance: number
  ): Promise<void> {
    return await this.createStopLossOrder(
      platform,
      base,
      balance,
      'sell',
      'limit',
      stopPrice
    )
  }

  static async deleteOrder(
    platform: PLATFORM,
    oId: string,
    symbol: string
  ): Promise<void> {
    const operation = 'deleteOrder'
    try {
      await ServiceCcxt.cancelOneOrder(platform, oId, symbol.replace('/', ''))
      logger.debug(`Deleted order ${oId} for ${platform}.`, { module: path.parse(__filename).name, operation, symbol })
    } catch (error) {
      handleServiceError(
        error,
        'deleteOrder',
        `Error deleting ${symbol}order with id ${oId} for ${platform}`
      )
      throw error
    }
  }

  static async createMarketOrder(
    platform: PLATFORM,
    base: string,
    amount: number,
    orderType: 'buy' | 'sell'
  ): Promise<void> {
    this.createOrder(platform, base, amount, orderType, 'market')
  }

  static async createLimitOrder(
    platform: PLATFORM,
    base: string,
    amount: number,
    orderType: 'buy' | 'sell',
    price: number
  ): Promise<void> {
    this.createOrder(platform, base, amount, orderType, 'limit', price)
  }

  static async createStopLossOrder(
    platform: PLATFORM,
    base: string,
    amount: number,
    orderType: 'buy' | 'sell',
    orderMode: 'market' | 'limit',
    stopPrice?: number
  ): Promise<void> {
    try {
      if (stopPrice === undefined) {
        throw new Error('Le prix doit être spécifié pour les ordres stop loss.')
      }

      const symbol = getMarketSymbolForPlatform(platform, base)
      const stopLossPrice = stopPrice - stopPrice * 0.001
      await ServiceCcxt.executeMarketOrder(
        platform,
        symbol,
        amount,
        orderType,
        orderMode,
        stopLossPrice,
        stopPrice
      )
    } catch (error) {
      handleServiceError(
        error,
        'createStopLossOrder',
        `Error creating stop loss order for ${platform}`
      )
      throw error
    }
  }

  static async createOrder(
    platform: PLATFORM,
    base: string,
    amount: number,
    orderType: 'buy' | 'sell',
    orderMode: 'market' | 'limit',
    price?: number
  ): Promise<void> {
    try {
      const symbol = getMarketSymbolForPlatform(platform, base)
      await ServiceCcxt.executeMarketOrder(
        platform,
        symbol,
        amount,
        orderType,
        orderMode,
        price
      )
    } catch (error) {
      handleServiceError(
        error,
        'createOrder',
        `Error creating order for ${platform}`
      )
      throw error
    }
  }

  static async cancelAllOrdersByBunch(
    platform: PLATFORM,
    base: string
  ): Promise<{ message: string }> {
    try {
      const symbol = getMarketSymbolForPlatform(platform, base)
      await ServiceCcxt.bunchCancelAllOrdersByAsset(platform, symbol)
      return { message: `Cancelled all ${symbol} orders for ${platform}.` }
    } catch (error) {
      handleServiceError(
        error,
        'cancelAllOrders',
        `Error canceling all orders for ${platform}`
      )
      throw error
    }
  }

  static async cancelAllSellOrders(
    platform: PLATFORM,
    base: string
  ): Promise<{ message: string }> {
    return this.cancelAllOrdersNoBunch(platform, base, 'sell')
  }

  static async cancelAllOrdersNoBunch(
    platform: PLATFORM,
    base: string,
    orderSide?: 'buy' | 'sell'
  ): Promise<{ message: string }> {
    try {
      const orders = await ServiceOrderBalance.getOrdersByPlatformAndSymbol(
        platform,
        base
      )
      const filteredOrders = orderSide
        ? orders.filter((order) => order.side === orderSide)
        : orders
      const orderIds = filteredOrders.map((order) => order._id)

      if (orderIds.length === 0) {
        return {
          message: `Aucun ordre ouvert pour ce symbole ${orderSide ? ` avec côté ${orderSide}` : ''}`
        }
      } else {
        ServiceCcxt.cancelAllOrdersRecursively(platform, base, orderIds)
        return {
          message: `${orderIds.length} ordres${orderSide ? ` ${orderSide}` : ''} annulés avec succès`
        }
      }
    } catch (error) {
      handleServiceError(
        error,
        'cancelAllOrdersNoBunch',
        'fetchOpenOrders problem'
      )
    }
    const msg = { message: `Check your API key for ${platform}` }
    return msg
  }
}
