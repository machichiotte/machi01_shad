// src/services/orderMarketService.ts
import {
    createPlatformInstance,
    getSymbolForPlatform
} from '@utils/platformUtil'
import { Order, Exchange } from 'ccxt'
import { handleServiceError } from '@utils/errorUtil'

export class OrderMarketService {

    static async createOrUpdateStopLossOrder(platform: string, stopPrice: number, base: string, balance: number): Promise<void> {
        return await this.createStopLossOrder(platform, base, balance, 'sell', 'limit', stopPrice)
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
    static async cancelAllOrdersByBunch(platform: string, asset: string): Promise<{ message: string }> {
        try {
            const platformInstance = createPlatformInstance(platform)
            const symbol = getSymbolForPlatform(platform, asset)
            if (platform === 'okx') {
                await this.cancelAllOrdersNoBunch(platformInstance, symbol)
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

    static async cancelAllOrdersNoBunch(platformInstance: Exchange, symbol: string, orderSide?: 'buy' | 'sell'): Promise<{ message: string }> {
        // Récupère tous les ordres ouverts pour le symbole donné
        const orders = await platformInstance.fetchOpenOrders(symbol)

        // Si un côté (buy ou sell) est spécifié, filtre les ordres par côté
        const filteredOrders = orderSide ? orders.filter(order => order.side === orderSide) : orders

        // Extrait les identifiants des ordres filtrés
        const orderIds = filteredOrders.map(order => order.id)

        // Si aucun ordre n'est ouvert (après filtrage), retourne un message approprié
        if (orderIds.length === 0) {
            return { message: `Aucun ordre ouvert pour ce symbole${orderSide ? ` avec côté ${orderSide}` : ''}` }
        } else {
            // Annule tous les ordres filtrés
            await Promise.all(orderIds.map(id => platformInstance.cancelOrder(id, symbol)))
            return { message: `${orderIds.length} ordres${orderSide ? ` ${orderSide}` : ''} annulés avec succès` }
        }
    }

}
