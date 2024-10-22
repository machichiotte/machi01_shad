// src/services/ccxtService.ts
import * as ccxt from 'ccxt';
import { config } from '@config/index';
import { PLATFORM, PlatformBalances, PlatformMarket, PlatformOrder, PlatformTickers, PlatformTrade } from '@typ/platform';
import { handleServiceError } from '@utils/errorUtil';
import { checkApiKeys } from '@utils/platformUtil';
import { ObjectId } from 'mongodb';

export class CcxtService {

    static createPlatformInstance(platform: PLATFORM): ccxt.Exchange {
        if (!checkApiKeys(platform)) {
            throw new Error(`API keys missing for platform: ${platform}`);
        }

        const platformConfig = config.apiKeys.platform[platform];
        const { apiKey, secretKey } = platformConfig
        const passphrase = 'passphrase' in platformConfig ? platformConfig.passphrase : undefined;

        try {
            // Check if the CCXT class exists
            const exchangeClass = ccxt[platform as keyof typeof ccxt] as typeof ccxt.Exchange

            const platformParams: ccxt.Exchange['options'] = {
                apiKey,
                secret: secretKey,
                ...(passphrase && { password: passphrase }),
                timeout: 20000, // Timeout for requests
                enableRateLimit: true // Enable rate limiting
            }
            return new exchangeClass(platformParams)
        } catch (error) {
            console.log(`Error creating platform instance for ${platform}`)
            handleServiceError(error, 'createPlatformInstance', `Error creating platform instance for ${platform}`)
            throw error
        }
    }

    //raw
    static async fetchRawBalance(platform: PLATFORM): Promise<PlatformBalances> {
        const platformInstance = this.createPlatformInstance(platform);
        return await platformInstance.fetchBalance();
    }

    static async fetchRawTicker(platform: PLATFORM): Promise<PlatformTickers> {
        const platformInstance = this.createPlatformInstance(platform);
        return await platformInstance.fetchTickers();
    }

    static async fetchRawMarket(platform: PLATFORM): Promise<PlatformMarket[]> {
        const platformInstance = this.createPlatformInstance(platform);
        const markets = await platformInstance.fetchMarkets()
        return markets;
    }

    static async fetchRawTrade(platform: PLATFORM, symbol?: string, since?: number, limit?: number, params?: Record<string, unknown>): Promise<PlatformTrade[]> {
        const platformInstance = this.createPlatformInstance(platform);
        return await platformInstance.fetchMyTrades(symbol, since, limit, params);
    }



    // orders
    // fetch
    static async fetchOpenOrdersByPlatform(platform: PLATFORM): Promise<PlatformOrder[]> {
        try {
            if (platform === 'kucoin') {
                return await this.fetchRawOpenOrdersByPage(platform)
            } else {
                return await this.fetchRawOpenOrders(platform)
            }
        } catch (error) {
            handleServiceError(error, 'fetchOpenOrdersByPlatform', `Error fetching open orders for ${platform}`)
            throw error
        }
    }

    static async fetchRawOpenOrders(platform: PLATFORM, symbol?: string, since?: number, limit?: number, params?: Record<string, unknown>): Promise<PlatformOrder[]> {
        const platformInstance = this.createPlatformInstance(platform);
        if (platform === 'binance' && platformInstance.options) {
            platformInstance.options.warnOnFetchOpenOrdersWithoutSymbol = false
        }
        return await platformInstance.fetchOpenOrders(symbol, since, limit, params);
    }

    static async fetchRawOpenOrdersByPage(platform: PLATFORM, symbol?: string, since?: number, limit?: number, params?: Record<string, unknown>, pageSize: number = 100): Promise<PlatformOrder[]> {
        const platformInstance = this.createPlatformInstance(platform);
        if (platform === 'binance' && platformInstance.options) {
            platformInstance.options.warnOnFetchOpenOrdersWithoutSymbol = false
        }
        let currentPage = 1
        let allOrders: PlatformOrder[] = []

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

    //cancel
    static async bunchCancelAllOrdersByAsset(platform: PLATFORM, symbol?: string, orderIds?: ObjectId[]) {
        if (platform === 'okx') {
            if (symbol && orderIds)
                await this.cancelAllOrdersRecursively(platform, symbol, orderIds)
        } else {
            const platformInstance = this.createPlatformInstance(platform)
            await platformInstance.cancelAllOrders(symbol)
        }

    }

    static async cancelAllOrdersRecursively(platform: PLATFORM, symbol: string, orderIds: ObjectId[]) {
        const platformInstance = this.createPlatformInstance(platform)// Récupère tous les ordres ouverts pour le symbole donné
        await Promise.all(orderIds.map(order => platformInstance.cancelOrder(order.toHexString(), symbol)))
    }

    static async cancelOneOrder(platform: PLATFORM, symbol: string, orderId: string) {

        const platformInstance = this.createPlatformInstance(platform)
        await platformInstance.cancelOrder(orderId, symbol)
    }

    //execute order
    static async executeMarketOrder(platform: PLATFORM, symbol: string, amount: number, orderSide: 'buy' | 'sell', orderMode: 'market' | 'limit', price?: number, stopLossPrice?: number): Promise<PlatformOrder> {
        const platformInstance = this.createPlatformInstance(platform)
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

    // trades 
    static async fetchPlatformTrades(platform: PLATFORM): Promise<PlatformTrade[]> {
        let trades: PlatformTrade[] = []
        const platformInstance = this.createPlatformInstance(platform)

        switch (platform) {
            //TODO POSSIBLE BUG AVEC BINANCE IL FAUDRA RAJOUTER LES AUTRES APRES TEST
            case 'binance':
                trades = await platformInstance.fetchMyTrades();
                break;
            case 'kucoin':
                trades = await this.fetchKucoinTrades(platform)
                break
            case 'htx':
                trades = await this.fetchHtxTrades(platform)
                break
            default:
                throw new Error(`Plateforme non supportée: ${platform}`)
        }

        return trades
    }

    private static async fetchKucoinTrades(platform: PLATFORM): Promise<PlatformTrade[]> {
        const platformInstance = this.createPlatformInstance(platform)

        const weeksBack = 4 * 52
        let allTrades: PlatformTrade[] = []
        for (let i = weeksBack; i > 1; i--) {
            const trades = await platformInstance.fetchMyTrades(
                undefined,
                Date.now() - i * 7 * 86400 * 1000,
                500
            )
            allTrades = allTrades.concat(trades)
        }
        return allTrades
    }

    private static async fetchHtxTrades(platform: PLATFORM): Promise<PlatformTrade[]> {
        const platformInstance = this.createPlatformInstance(platform)

        const currentTime = Date.now()
        const windowSize = 48 * 60 * 60 * 1000
        const totalDuration = 1 * 365 * 24 * 60 * 60 * 1000
        const iterations = Math.ceil(totalDuration / windowSize)
        let allTrades: PlatformTrade[] = []

        for (let i = 0; i < iterations; i++) {
            const startTime = currentTime - (i + 1) * windowSize
            const endTime = currentTime - i * windowSize
            const param = { 'start-time': startTime, 'end-time': endTime }
            const trades = await platformInstance.fetchMyTrades(undefined, undefined, 1000, param)
            allTrades = allTrades.concat(trades)
        }
        return allTrades
    }
}

export default new CcxtService();
