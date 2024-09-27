// src/services/orderMarketService.ts
import { getSymbolForPlatform } from '@utils/platformUtil'
import { handleServiceError } from '@utils/errorUtil'
import { PLATFORM } from '@src/types/platform'
import { PlatformService } from './platformService'
import { OrderBalanceService } from './orderBalanceService'

export class OrderMarketService {

    static async createOrUpdateStopLossOrder(platform: PLATFORM, stopPrice: number, base: string, balance: number): Promise<void> {
        return await this.createStopLossOrder(platform, base, balance, 'sell', 'limit', stopPrice)
    }

    /**
       * Deletes an order for a given platform.
       */
    static async deleteOrder(platform: PLATFORM, oId: string, symbol: string): Promise<void> {
        try {
            await PlatformService.cancelOneOrder(platform, oId, symbol.replace('/', ''))
            console.log(`Deleted order ${oId} for ${platform}.`, { symbol })
        } catch (error) {
            handleServiceError(error, 'deleteOrder', `Error deleting ${symbol}order with id ${oId} for ${platform}`)
            throw error
        }
    }

    /**
    * Creates a market order for a given platform.
    */
    static async createMarketOrder(platform: PLATFORM, asset: string, amount: number, orderType: 'buy' | 'sell'): Promise<void> {
        this.createOrder(platform, asset, amount, orderType, 'market')
    }

    /**
     * Creates a limit order for a given platform.
     */
    static async createLimitOrder(platform: PLATFORM, asset: string, amount: number, orderType: 'buy' | 'sell', price: number): Promise<void> {
        this.createOrder(platform, asset, amount, orderType, 'limit', price)
    }




    static async createStopLossOrder(platform: PLATFORM, asset: string, amount: number, orderType: 'buy' | 'sell', orderMode: 'market' | 'limit', stopPrice?: number): Promise<void> {
        try {
            if (stopPrice === undefined) {
                throw new Error('Le prix doit être spécifié pour les ordres stop loss.')
            }

            const symbol = getSymbolForPlatform(platform, asset)
            const stopLossPrice = stopPrice - stopPrice * 0.001
            await PlatformService.executeMarketOrder(platform, symbol, amount, orderType, orderMode, stopLossPrice, stopPrice)
        } catch (error) {
            handleServiceError(error, 'createStopLossOrder', `Error creating stop loss order for ${platform}`)
            throw error
        }
    }

    static async createOrder(platform: PLATFORM, asset: string, amount: number, orderType: 'buy' | 'sell', orderMode: 'market' | 'limit', price?: number): Promise<void> {
        console.log('createOrder', platform, asset, amount, orderType, orderMode, price)
        try {
            const symbol = getSymbolForPlatform(platform, asset)
            await PlatformService.executeMarketOrder(platform, symbol, amount, orderType, orderMode, price)
        } catch (error) {
            handleServiceError(error, 'createOrder', `Error creating order for ${platform}`)
            throw error
        }
    }

    /**
    * Cancels all orders for a given platform and asset.
    */
    static async cancelAllOrdersByBunch(platform: PLATFORM, asset: string): Promise<{ message: string }> {
        try {
            const symbol = getSymbolForPlatform(platform, asset)
            await PlatformService.bunchCancelAllOrdersByAsset(platform, symbol)
            return { message: `Cancelled all ${symbol} orders for ${platform}.` }
        } catch (error) {
            handleServiceError(error, 'cancelAllOrders', `Error canceling all orders for ${platform}`)
            throw error
        }
    }

    /**
    * Cancels all sell orders for a given platform and asset.
    */
    static async cancelAllSellOrders(platform: PLATFORM, asset: string): Promise<{ message: string }> {
        return this.cancelAllOrdersNoBunch(platform, asset, 'sell');
    }

    static async cancelAllOrdersNoBunch(platform: PLATFORM, asset: string, orderSide?: 'buy' | 'sell'): Promise<{ message: string }> {
        try {
            const orders = await OrderBalanceService.getOrdersByPlatformAndSymbol(platform, asset)
            const filteredOrders = orderSide ? orders.filter(order => order.side === orderSide) : orders
            const orderIds = filteredOrders.map(order => order._id.$oid)

            if (orderIds.length === 0) {
                return { message: `Aucun ordre ouvert pour ce symbole ${orderSide ? ` avec côté ${orderSide}` : ''}` }
            } else {
                PlatformService.cancelAllOrdersRecursively(platform, asset, orderIds)
                return { message: `${orderIds.length} ordres${orderSide ? ` ${orderSide}` : ''} annulés avec succès` }
            }
        } catch (error) {
            handleServiceError(error, 'cancelAllOrdersNoBunch', 'fetchOpenOrders problem')
        }
        const msg = { message: `Check your API key for ${platform}` }
        return msg
    }
}