// src/services/serviceTrailingStop.ts
import { MappedBalance } from '@typ/balance';
import { Asset, HighestPrice, UpdatedOrder } from '@typ/trailingStop';
import { RepoTrailingStop } from '@repo/repoTrailingStop';
import { handleServiceError } from '@utils/errorUtil';
import { PLATFORM } from '@typ/platform';
import path from 'path'; import { logger } from '@utils/loggerUtil';

export class ServiceTrailingStop {
    private static readonly PERCENTAGE_TO_LOSE = 0.01;
    private static readonly rateLimits = {
        kucoin: { weight: 4000, period: 30000 },
        binance: { orders: 50, period: 10000 }
    };

    static async handleTrailingStopHedge(simplifiedSelectedAssets?: Asset[]): Promise<UpdatedOrder[]> {
        try {
            const [balanceFromDb, highestPrices] = await RepoTrailingStop.fetchBalanceAndHighestPrices();

            const balanceFromDbFiltered = simplifiedSelectedAssets
                ? this.filterBalances(balanceFromDb, simplifiedSelectedAssets)
                : balanceFromDb;

            const symbolsAndBalanceByPlatform = this.groupBalancesByPlatform(balanceFromDbFiltered);

            return this.processTrailingStops(symbolsAndBalanceByPlatform, highestPrices, !simplifiedSelectedAssets);
        } catch (error) {
            handleServiceError(error, 'handleTrailingStopHedge', `Error handling trailing stop hedge`);
            return [];
        }
    }

    private static filterBalances(balances: MappedBalance[], selectedAssets: Asset[]): MappedBalance[] {
        try {
            return balances.filter(bal =>
                selectedAssets.some(sa => sa.base === bal.base && sa.platform === bal.platform)
            );
        } catch (error) {
            handleServiceError(error, 'filterBalances', `Error filtering balances`)
            return []
        }
    }

    private static groupBalancesByPlatform(balances: MappedBalance[]): Record<string, Set<{ base: string; balance: number; }>> {
        try {
            return balances.reduce<Record<string, Set<{ base: string; balance: number; }>>>((acc, bal) => {
                const platform = bal.platform;
                if (platform !== 'binance' && platform !== 'kucoin') {
                    return acc;
                }
                if (!acc[platform]) acc[platform] = new Set();
                acc[platform].add({
                    base: bal.base,
                    balance: bal.balance
                });
                return acc;
            }, {});
        } catch (error) {
            handleServiceError(error, 'groupBalancesByPlatform', `Error grouping balances by platform`)
            return {}
        }
    }

    private static async processTrailingStops(symbolsAndBalanceByPlatform: Record<string, Set<{ base: string; balance: number; }>>, highestPrices: HighestPrice[], kucoinOnly = false): Promise<UpdatedOrder[]> {
        const operation = 'processTrailingStops'
        try {
            const updatedOrders: UpdatedOrder[] = [];

            for (const [platform, symbolsAndBalances] of Object.entries(symbolsAndBalanceByPlatform)) {
                if (kucoinOnly && platform !== 'kucoin') continue;

                const platformTickers = await RepoTrailingStop.fetchCurrentTickers(platform as PLATFORM);
                let requestWeight = 0;
                let orderCount = 0;
                const lastResetTime = Date.now();

                for (const { base, balance } of symbolsAndBalances) {
                    if (platform !== 'kucoin' && platform !== 'binance') continue;

                    await this.handleRateLimiting(platform, requestWeight, orderCount, lastResetTime);

                    const ticker = platformTickers.find(t => t.symbol === `${base}/USDC`);
                    if (!ticker) continue;

                    const { last: currentPrice } = ticker;
                    const matchingHighestPrice = highestPrices.find(hp => hp.base === base && hp.platform === platform);
                    const highestPrice = matchingHighestPrice?.highestPrice;
                    if (currentPrice !== undefined) {
                        const order = await this.updateOrCreateOrder(platform, base, balance, currentPrice, highestPrice);
                        if (order) {
                            updatedOrders.push(order);
                            requestWeight += platform === 'kucoin' ? 2 : 0;
                            orderCount += platform === 'binance' ? 1 : 0;
                        }
                    } else {
                        logger.debug(`Prix actuel non défini pour ${base} sur ${platform}`, { module: path.parse(__filename).name, operation });
                    }
                }
            }

            return updatedOrders;
        } catch (error) {
            handleServiceError(error, 'processTrailingStops', `Error processing trailing stops`);
            return [];
        }
    }

    private static async handleRateLimiting(platform: PLATFORM, requestWeight: number, orderCount: number, lastResetTime: number): Promise<void> {
        const operation = 'handleRateLimiting'
        try {
            const currentTime = Date.now();
            const timeSinceLastReset = currentTime - lastResetTime;
            const rateLimitReached =
                (platform === 'kucoin' && requestWeight >= this.rateLimits.kucoin.weight) ||
                (platform === 'binance' && orderCount >= this.rateLimits.binance.orders) ||
                timeSinceLastReset >= (platform === 'kucoin' ? this.rateLimits.kucoin.period : this.rateLimits.binance.period);

            if (rateLimitReached) {
                const waitTime = Math.max(0, (platform === 'kucoin' ? this.rateLimits.kucoin.period : this.rateLimits.binance.period) - timeSinceLastReset);
                logger.debug(`Limite atteinte pour ${platform}. Pause de ${waitTime}ms.`, { module: path.parse(__filename).name, operation });
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        } catch (error) {
            handleServiceError(error, 'handleRateLimiting', `Error handling rate limiting for ${platform}`)
        }
    }

    private static async updateOrCreateOrder(platform: PLATFORM, base: string, balance: number, currentPrice: number, highestPrice: number | undefined): Promise<UpdatedOrder | null> {
        const operation = 'updateOrCreateOrder'

        try {
            if (!highestPrice && currentPrice) {
                const stopPrice = currentPrice * (1 - this.PERCENTAGE_TO_LOSE);
                await RepoTrailingStop.cancelAllOrdersByBunch(platform, base);
                await RepoTrailingStop.createOrUpdateStopLossOrder(platform, stopPrice, base, balance);
                await RepoTrailingStop.updateHighestPrice(platform, base, currentPrice);
                logger.debug(`Ordre de trailing stop créé pour ${base}`, { module: path.parse(__filename).name, operation });
                return { base, platform };
            }

            if (highestPrice && currentPrice && currentPrice > highestPrice) {
                const stopLossPrice = Math.max(highestPrice, currentPrice) * (1 - this.PERCENTAGE_TO_LOSE);
                await RepoTrailingStop.cancelAllOrdersByBunch(platform, base);
                await RepoTrailingStop.createOrUpdateStopLossOrder(platform, stopLossPrice, base, balance);
                await RepoTrailingStop.updateHighestPrice(platform, base, currentPrice);
                logger.debug(`Ordre de trailing stop mis à jour pour ${base}`, { module: path.parse(__filename).name, operation });
                return { base, platform };
            }
        } catch (error) {
            handleServiceError(error, 'updateOrCreateOrder', `Error updating/creating order for ${base} on ${platform}`);
        }

        return null;
    }
}