// src/services/api/platform/serviceCcxt.ts
import * as CCTX from 'ccxt'; // Use CCTX alias to avoid conflict with local 'ccxt' variable name
import { config } from '@config/index';
import { PLATFORM, PlatformBalances, PlatformMarket, PlatformOrder, PlatformTickers, PlatformTrade } from '@typ/platform';
import { handleServiceError } from '@utils/errorUtil';
import { checkApiKeys } from '@utils/platformUtil';
import { ObjectId } from 'mongodb';
import { RepoConfigApi } from '@repo/config/repoConfigApi';
import { logger } from '@utils/loggerUtil'; // Import Winston logger

const myService = 'ServiceCcxt'; // Module name for logging context

export class ServiceCcxt {

    static createPlatformInstance(platform: PLATFORM): CCTX.Exchange {
        const operation = 'createPlatformInstance';
        logger.debug(`Creating CCXT instance for platform: ${platform}`, { myService, operation, platform });

        if (!checkApiKeys(platform)) {
            // Log the error before throwing
            logger.error(`API keys missing for platform: ${platform}`, { myService, operation, platform });
            throw new Error(`API keys missing for platform: ${platform}`);
        }

        const encryptedPlatformConfig = config.apiConfig.platform[platform];
        const decryptedPlatformConfig = RepoConfigApi.decryptConfigPlatform(encryptedPlatformConfig);
        // Destructure safely, checking if keys exist might be good but depends on decrypt logic
        const { apiKey, secretKey } = decryptedPlatformConfig;
        const passphrase = 'passphrase' in decryptedPlatformConfig ? decryptedPlatformConfig.passphrase : undefined;

        try {
            // Use CCTX alias here
            const exchangeClass = CCTX[platform as keyof typeof CCTX] as typeof CCTX.Exchange;
            if (!exchangeClass) {
                logger.error(`CCXT class not found for platform: ${platform}`, { myService, operation, platform });
                throw new Error(`Unsupported platform or CCXT class not found: ${platform}`);
            }

            const platformParams: CCTX.Exchange['options'] = {
                apiKey,
                secret: secretKey,
                ...(passphrase && { password: passphrase }), // Only add password if passphrase exists
                timeout: 20000, // Standard timeout
                enableRateLimit: true, // Enable CCXT's built-in rate limiter
                adjustForTimeDifference: true, // Adjust clock drift
                // verbose: process.env.NODE_ENV !== 'production', // Optional: Enable verbose CCXT logging in dev
            };

            const instance = new exchangeClass(platformParams);
            logger.debug(`CCXT instance created successfully for ${platform}`, { myService, operation, platform });
            return instance;
        } catch (error) {
            // handleServiceError already logs using logger.error
            handleServiceError(error, `${myService}:${operation}`, `Error creating platform instance for ${platform}`);
            throw error; // Re-throw after logging
        }
    }

    // --- Raw Fetch Methods ---

    static async fetchRawBalance(platform: PLATFORM): Promise<PlatformBalances> {
        const operation = 'fetchRawBalance';
        logger.debug(`Workspaceing raw balance for ${platform}...`, { myService, operation, platform });
        try {
            const platformInstance = this.createPlatformInstance(platform);
            const balance = await platformInstance.fetchBalance();
            logger.debug(`Raw balance fetched successfully for ${platform}`, { myService, operation, platform });
            return balance;
        } catch (error) {
            handleServiceError(error, `${myService}:${operation}`, `Error fetching raw balance for ${platform}`);
            throw error;
        }
    }

    static async fetchRawTicker(platform: PLATFORM): Promise<PlatformTickers> {
        const operation = 'fetchRawTicker';
        logger.debug(`Workspaceing raw tickers for ${platform}...`, { myService, operation, platform });
        try {
            const platformInstance = this.createPlatformInstance(platform);
            const tickers = await platformInstance.fetchTickers();
            logger.debug(`Raw tickers fetched successfully for ${platform}. Count: ${Object.keys(tickers).length}`, { myService, operation, platform, tickerCount: Object.keys(tickers).length });
            return tickers;
        } catch (error) {
            handleServiceError(error, `${myService}:${operation}`, `Error fetching raw tickers for ${platform}`);
            throw error;
        }
    }

    static async fetchRawMarket(platform: PLATFORM): Promise<PlatformMarket[]> {
        const operation = 'fetchRawMarket';
        logger.debug(`Workspaceing raw markets for ${platform}...`, { myService, operation, platform });
        try {
            const platformInstance = this.createPlatformInstance(platform);
            const markets = await platformInstance.fetchMarkets();
            logger.debug(`Raw markets fetched successfully for ${platform}. Count: ${markets.length}`, { myService, operation, platform, marketCount: markets.length });
            return markets;
        } catch (error) {
            handleServiceError(error, `${myService}:${operation}`, `Error fetching raw markets for ${platform}`);
            throw error;
        }
    }

    static async fetchRawTrade(platform: PLATFORM, symbol?: string, since?: number, limit?: number, params?: Record<string, unknown>): Promise<PlatformTrade[]> {
        const operation = 'fetchRawTrade';
        const context = { module: myService, operation, platform, symbol: symbol || 'all', since, limit, params };
        logger.debug(`Workspaceing raw trades...`, context);
        try {
            const platformInstance = this.createPlatformInstance(platform);
            const trades = await platformInstance.fetchMyTrades(symbol, since, limit, params);
            // Replace console.debug with logger.debug
            logger.debug(`Workspaceed ${trades.length} raw trades.`, { ...context, tradeCount: trades.length });
            return trades;
        } catch (error) {
            handleServiceError(error, `${myService}:${operation}`, `Error fetching raw trades for ${platform}, symbol: ${symbol || 'all'}`);
            throw error;
        }
    }

    // --- Orders ---

    // fetch
    static async fetchOpenOrdersByPlatform(platform: PLATFORM): Promise<PlatformOrder[]> {
        const operation = 'fetchOpenOrdersByPlatform';
        logger.debug(`Workspaceing open orders for ${platform}...`, { myService, operation, platform });
        try {
            let orders: PlatformOrder[];
            if (platform === 'kucoin') { // Example platform-specific logic
                logger.debug(`Using paginated fetch for ${platform}.`, { myService, operation, platform });
                orders = await this.fetchRawOpenOrdersByPage(platform);
            } else {
                logger.debug(`Using standard fetch for ${platform}.`, { myService, operation, platform });
                orders = await this.fetchRawOpenOrders(platform);
            }
            logger.debug(`Workspaceed ${orders.length} open orders for ${platform}.`, { myService, operation, platform, orderCount: orders.length });
            return orders;
        } catch (error) {
            handleServiceError(error, `${myService}:${operation}`, `Error fetching open orders for ${platform}`);
            throw error;
        }
    }

    static async fetchRawOpenOrders(platform: PLATFORM, symbol?: string, since?: number, limit?: number, params?: Record<string, unknown>): Promise<PlatformOrder[]> {
        const operation = 'fetchRawOpenOrders';
        const context = { module: myService, operation, platform, symbol: symbol || 'all', since, limit, params };
        logger.debug(`Workspaceing raw open orders (standard)...`, context);
        try {
            const platformInstance = this.createPlatformInstance(platform);
            // Specific handling example
            if (platform === 'binance' && platformInstance.options) {
                logger.debug('Disabling warnOnFetchOpenOrdersWithoutSymbol for Binance.', context);
                platformInstance.options.warnOnFetchOpenOrdersWithoutSymbol = false;
            }
            const orders = await platformInstance.fetchOpenOrders(symbol, since, limit, params);
            logger.debug(`Workspaceed ${orders.length} raw open orders (standard).`, { ...context, orderCount: orders.length });
            return orders;
        } catch (error) {
            handleServiceError(error, `${myService}:${operation}`, `Error fetching raw open orders (standard) for ${platform}`);
            throw error;
        }
    }

    static async fetchRawOpenOrdersByPage(platform: PLATFORM, symbol?: string, since?: number, _limit?: number /* limit unused */, params?: Record<string, unknown>, pageSize: number = 100): Promise<PlatformOrder[]> {
        const operation = 'fetchRawOpenOrdersByPage';
        const context = { myService, operation, platform, symbol: symbol || 'all', since, params, pageSize };
        logger.debug(`Workspaceing raw open orders (paginated)...`, context);
        try {
            const platformInstance = this.createPlatformInstance(platform);
            // Specific handling example
            if (platform === 'binance' && platformInstance.options) {
                logger.debug('Disabling warnOnFetchOpenOrdersWithoutSymbol for Binance.', context);
                platformInstance.options.warnOnFetchOpenOrdersWithoutSymbol = false;
            }

            let currentPage = 1;
            let allOrders: PlatformOrder[] = [];
            let totalFetched = 0;

            while (true) {
                logger.debug(`Workspaceing page ${currentPage}...`, { ...context, currentPage });
                const pageParams = { ...params, currentPage }; // Pass currentPage in params
                const orders = await platformInstance.fetchOpenOrders(
                    symbol, // Use provided symbol
                    since,  // Use provided since
                    pageSize, // Use pageSize as limit for the page fetch
                    pageParams
                );
                totalFetched += orders.length;
                logger.debug(`Workspaceed ${orders.length} orders on page ${currentPage}. Total so far: ${totalFetched}`, { ...context, currentPage, pageCount: orders.length, totalFetched });

                if (orders.length > 0) {
                    allOrders = allOrders.concat(orders);
                }

                if (orders.length < pageSize) {
                    logger.debug(`Last page reached (fetched ${orders.length} < ${pageSize}). Stopping pagination.`, { ...context, currentPage, pageCount: orders.length });
                    break; // Exit loop if fewer orders than page size were returned
                }

                currentPage++;

                // Optional: Add a safety break or delay for very long loops
                if (currentPage > 100) { // Example safety break after 100 pages
                    logger.warn(`Pagination safety break: Exceeded 100 pages.`, { ...context, currentPage });
                    break;
                }
                // await sleep(100); // Optional small delay between pages
            }
            logger.debug(`Workspaceed ${allOrders.length} raw open orders (paginated) in ${currentPage - 1} pages.`, { ...context, orderCount: allOrders.length, totalPages: currentPage - 1 });
            return allOrders;
        } catch (error) {
            handleServiceError(error, `${myService}:${operation}`, `Error fetching raw open orders (paginated) for ${platform}`);
            throw error;
        }
    }

    // --- cancel ---
    static async bunchCancelAllOrdersByAsset(platform: PLATFORM, symbol?: string, orderIds?: ObjectId[]) {
        const operation = 'bunchCancelAllOrdersByAsset';
        const context = { myService, operation, platform, symbol, orderIds: orderIds?.map(id => id.toHexString()) };
        logger.info(`Attempting to cancel orders...`, context);
        try {
            if (platform === 'okx') { // Platform specific logic example
                if (symbol && orderIds && orderIds.length > 0) {
                    logger.debug(`Using recursive cancel for ${platform} for ${orderIds.length} orders.`, context);
                    await this.cancelAllOrdersRecursively(platform, symbol, orderIds);
                } else {
                    logger.warn(`Cannot perform recursive cancel for ${platform}: Missing symbol or orderIds.`, context);
                    // Maybe default to cancelAllOrders if symbol is known? Or just do nothing/throw?
                    // throw new Error('Symbol and Order IDs required for OKX recursive cancel');
                }
            } else {
                logger.debug(`Using standard cancelAllOrders for ${platform}.`, context);
                const platformInstance = this.createPlatformInstance(platform);
                await platformInstance.cancelAllOrders(symbol);
                logger.info(`Standard cancelAllOrders initiated for ${platform}`, context);
            }
        } catch (error) {
            handleServiceError(error, `${myService}:${operation}`, `Error during bunch cancel orders for ${platform}, symbol: ${symbol || 'all'}`);
            throw error;
        }
    }

    static async cancelAllOrdersRecursively(platform: PLATFORM, symbol: string, orderIds: ObjectId[]) {
        const operation = 'cancelAllOrdersRecursively';
        const orderIdStrings = orderIds.map(id => id.toHexString());
        const context = { myService, operation, platform, symbol, orderIds: orderIdStrings, orderCount: orderIds.length };
        logger.debug(`Cancelling ${orderIds.length} specific orders recursively...`, context);
        try {
            const platformInstance = this.createPlatformInstance(platform);
            // Use Promise.allSettled to attempt all cancellations even if some fail
            const results = await Promise.allSettled(orderIds.map(order => {
                logger.debug(`Attempting cancellation for order ID: ${order.toHexString()}`, { ...context, orderId: order.toHexString() });
                return platformInstance.cancelOrder(order.toHexString(), symbol);
            }));

            const successfulCancellations = results.filter(r => r.status === 'fulfilled').length;
            const failedCancellations = results.filter(r => r.status === 'rejected');

            if (failedCancellations.length > 0) {
                logger.warn(`Completed recursive cancellation with ${failedCancellations.length} failures out of ${orderIds.length}.`, { ...context, successes: successfulCancellations, failures: failedCancellations.length });
                failedCancellations.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        handleServiceError(result.reason, `${myService}:${operation}:singleCancel`, `Failed to cancel order ID ${orderIdStrings[index]}`);
                    }
                });
                // Decide if partial failure should throw an error
                // throw new Error(`Failed to cancel ${failedCancellations.length} orders.`);
            } else {
                logger.info(`Successfully initiated cancellation for all ${orderIds.length} orders.`, context);
            }
        } catch (error) { // Catch errors from createPlatformInstance or unexpected Promise.allSettled issues
            handleServiceError(error, `${myService}:${operation}`, `Error during recursive cancellation process for ${platform}`);
            throw error;
        }
    }

    static async cancelOneOrder(platform: PLATFORM, symbol: string, orderId: string) {
        const operation = 'cancelOneOrder';
        const context = { myService, operation, platform, symbol, orderId };
        logger.info(`Attempting to cancel single order...`, context);
        try {
            const platformInstance = this.createPlatformInstance(platform);
            await platformInstance.cancelOrder(orderId, symbol);
            logger.info(`Successfully initiated cancellation for order ${orderId}`, context);
        } catch (error) {
            handleServiceError(error, `${myService}:${operation}`, `Error cancelling order ${orderId} for ${platform}`);
            throw error;
        }
    }

    // --- execute order ---
    static async executeMarketOrder(platform: PLATFORM, symbol: string, amount: number, orderSide: 'buy' | 'sell', orderMode: 'market' | 'limit', price?: number, stopLossPrice?: number): Promise<PlatformOrder> {
        const operation = 'executeMarketOrder';
        const context = { module: myService, operation, platform, symbol, amount, side: orderSide, type: orderMode, price, stopLossPrice };
        logger.info(`Attempting to execute order...`, context);
        try {
            const platformInstance = this.createPlatformInstance(platform);
            let orderResult: PlatformOrder;

            if (orderMode === 'market') {
                logger.debug(`Executing market order...`, context);
                orderResult = orderSide === 'buy'
                    ? await platformInstance.createMarketBuyOrder(symbol, amount)
                    : await platformInstance.createMarketSellOrder(symbol, amount);
            } else if (orderMode === 'limit') {
                if (price === undefined) {
                    logger.error('Price must be specified for limit orders.', context);
                    throw new Error('Price must be specified for limit orders.');
                }
                logger.debug(`Executing limit order... Price: ${price}`, { ...context, price }); // Log price specifically for limit
                if (stopLossPrice) { // Assuming this creates a stop-limit order if supported
                    logger.debug(`Executing stop-limit order... Stop Price: ${stopLossPrice}`, { ...context, stopLossPrice });
                    // Note: CCXT's createStopOrder might need specific params structure
                    orderResult = await platformInstance.createOrder(symbol, 'limit', orderSide, amount, price, { 'stopPrice': stopLossPrice }); // Example using createOrder for stop-limit
                    // orderResult = await platformInstance.createStopLimitOrder(symbol, orderSide, amount, price, stopLossPrice); // If method exists
                } else {
                    orderResult = orderSide === 'buy'
                        ? await platformInstance.createLimitBuyOrder(symbol, amount, price)
                        : await platformInstance.createLimitSellOrder(symbol, amount, price);
                }
            } else {
                logger.error('Invalid order mode specified.', { ...context, invalidMode: orderMode });
                throw new Error(`Invalid order mode: ${orderMode}`);
            }

            logger.info(`Order executed successfully. Order ID: ${orderResult?.id || 'N/A'}`, { ...context, orderId: orderResult?.id, resultStatus: orderResult?.status });
            return orderResult;
        } catch (error) {
            handleServiceError(error, `${myService}:${operation}`, `Error executing ${orderMode} ${orderSide} order for ${symbol} on ${platform}`);
            throw error;
        }
    }

    // --- trades ---
    static async fetchPlatformTrades(platform: PLATFORM): Promise<PlatformTrade[]> {
        const operation = 'fetchPlatformTrades';
        const context = { myService, operation, platform };
        logger.info(`Workspaceing all trades for platform ${platform}...`, context);
        try {
            let trades: PlatformTrade[] = [];
            // No need for platformInstance here yet, handled in specific methods if needed

            switch (platform) {
                case 'binance':
                    logger.debug(`Using standard fetchMyTrades for ${platform}`, context);
                    // Potential Bug Note: fetchMyTrades without symbol might be restricted on Binance.
                    // Consider fetching trades per market/symbol if this fails.
                    trades = await this.createPlatformInstance(platform).fetchMyTrades();
                    break;
                case 'kucoin':
                    logger.debug(`Using specific fetchKucoinTrades for ${platform}`, context);
                    trades = await this.fetchKucoinTrades(platform);
                    break;
                case 'htx': // Assuming 'htx' corresponds to Huobi
                    logger.debug(`Using specific fetchHtxTrades for ${platform}`, context);
                    trades = await this.fetchHtxTrades(platform);
                    break;
                default:
                    logger.error(`Unsupported platform for fetching trades: ${platform}`, context);
                    throw new Error(`Platform not supported for fetching all trades: ${platform}`);
            }

            logger.info(`Workspaceed a total of ${trades.length} trades for ${platform}.`, { ...context, tradeCount: trades.length });
            return trades;
        } catch (error) {
            handleServiceError(error, `${myService}:${operation}`, `Error fetching trades for ${platform}`);
            throw error;
        }
    }

    private static async fetchKucoinTrades(platform: PLATFORM): Promise<PlatformTrade[]> {
        const operation = 'fetchKucoinTrades';
        const context = { myService, operation, platform };
        logger.debug(`Workspaceing Kucoin trades (paginated by time)...`, context);
        try {
            const platformInstance = this.createPlatformInstance(platform);
            const weeksBack = 4 * 52; // Fetch trades up to 4 years back (adjust as needed)
            let allTrades: PlatformTrade[] = [];
            const fetchLimit = 500; // Kucoin's max limit per fetch

            logger.debug(`Workspaceing trades for the last ${weeksBack} weeks...`, { ...context, weeksBack, fetchLimit });

            for (let i = weeksBack; i > 0; i--) { // Iterate backwards in time
                const endTime = Date.now() - (i - 1) * 7 * 86400 * 1000; // End of the week window
                const startTime = Date.now() - i * 7 * 86400 * 1000;     // Start of the week window
                logger.debug(`Workspaceing week ${weeksBack - i + 1}/${weeksBack}. Time range: ${new Date(startTime).toISOString()} - ${new Date(endTime).toISOString()}`, { ...context, iteration: weeksBack - i + 1, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() });
                try {
                    // Note: fetchMyTrades 'since' parameter includes trades AT or AFTER the timestamp.
                    const trades = await platformInstance.fetchMyTrades(
                        undefined, // Fetch for all symbols
                        startTime, // Fetch trades since the start of the week
                        fetchLimit // Max limit per request
                        // KuCoin might need specific params for time range, check CCXT docs if 'since' isn't enough
                        // params: { startTime: startTime, endTime: endTime } // Example if needed
                    );
                    logger.debug(`Workspaceed ${trades.length} trades for the week.`, { ...context, iteration: weeksBack - i + 1, tradeCount: trades.length });
                    if (trades.length > 0) {
                        // Filter trades to strictly be within the window if 'since' is not precise enough (optional)
                        // const filteredTrades = trades.filter(t => t.timestamp < endTime);
                        allTrades = allTrades.concat(trades);
                    }
                    if (trades.length >= fetchLimit) {
                        logger.warn(`Workspaceed maximum limit (${fetchLimit}) for week ${weeksBack - i + 1}. Some trades might be missed for this period if > ${fetchLimit} occurred. Consider fetching per symbol or smaller time windows.`, { ...context, iteration: weeksBack - i + 1 });
                    }
                } catch (weekError) {
                    // Log error for the specific week but continue fetching other weeks
                    handleServiceError(weekError, `${myService}:${operation}:fetchWeek`, `Error fetching trades for week ${weeksBack - i + 1} on ${platform}`);
                }
                // await sleep(platformInstance.rateLimit); // Respect rate limit between fetches
            }
            logger.debug(`Finished fetching Kucoin trades. Total fetched: ${allTrades.length}`, { ...context, totalTradeCount: allTrades.length });
            return allTrades;
        } catch (error) { // Catch errors from createPlatformInstance
            handleServiceError(error, `${myService}:${operation}`, `Error setting up Kucoin trade fetch for ${platform}`);
            throw error;
        }
    }

    private static async fetchHtxTrades(platform: PLATFORM): Promise<PlatformTrade[]> {
        const operation = 'fetchHtxTrades';
        const context = { myService, operation, platform };
        logger.debug(`Workspaceing HTX (Huobi) trades (paginated by time)...`, context);
        try {
            const platformInstance = this.createPlatformInstance(platform);
            const currentTime = Date.now();
            const windowSize = 48 * 60 * 60 * 1000; // 48 hours window (as per HTX limits)
            const totalDuration = 1 * 365 * 24 * 60 * 60 * 1000; // Fetch trades for the last year (adjust as needed)
            const iterations = Math.ceil(totalDuration / windowSize);
            let allTrades: PlatformTrade[] = [];
            const fetchLimit = 1000; // Check HTX limit, might be lower

            logger.debug(`Workspaceing trades for the last year in ${iterations} iterations of ${windowSize / (1000 * 60 * 60)} hours...`, { ...context, iterations, windowHours: windowSize / (1000 * 60 * 60), fetchLimit });

            for (let i = 0; i < iterations; i++) {
                const startTime = currentTime - (i + 1) * windowSize;
                const endTime = currentTime - i * windowSize; // fetchMyTrades usually includes 'endTime' if provided
                const param = { 'start-time': startTime, 'end-time': endTime }; // Check CCXT/HTX docs for correct param names
                logger.debug(`Workspaceing iteration ${i + 1}/${iterations}. Time range: ${new Date(startTime).toISOString()} - ${new Date(endTime).toISOString()}`, { ...context, iteration: i + 1, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() });
                try {
                    // Check CCXT docs for HTX fetchMyTrades params for time ranges
                    const trades = await platformInstance.fetchMyTrades(undefined, undefined, fetchLimit, param);
                    logger.debug(`Workspaceed ${trades.length} trades for the iteration.`, { ...context, iteration: i + 1, tradeCount: trades.length });
                    if (trades.length > 0) {
                        allTrades = allTrades.concat(trades);
                    }
                    if (trades.length >= fetchLimit) {
                        logger.warn(`Workspaceed maximum limit (${fetchLimit}) for iteration ${i + 1}. Some trades might be missed.`, { ...context, iteration: i + 1 });
                    }
                } catch (iterError) {
                    handleServiceError(iterError, `${myService}:${operation}:fetchIteration`, `Error fetching trades for iteration ${i + 1} on ${platform}`);
                }
                // await sleep(platformInstance.rateLimit); // Respect rate limit
            }
            logger.debug(`Finished fetching HTX trades. Total fetched: ${allTrades.length}`, { ...context, totalTradeCount: allTrades.length });
            return allTrades;
        } catch (error) { // Catch errors from createPlatformInstance
            handleServiceError(error, `${myService}:${operation}`, `Error setting up HTX trade fetch for ${platform}`);
            throw error;
        }
    }
}

// Exporting the class itself instead of an instance, allows for better testing/mocking if needed.
// Consumers will call ServiceCcxt.fetchRawBalance(...) etc.
// export default new ServiceCcxt(); // Remove this line