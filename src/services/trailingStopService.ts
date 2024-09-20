import { BalanceService } from '@src/services/balanceService';
import { ShadService } from './shadService';
import { TickerService } from './tickerService';
import { OrderMarketService } from '@services/orderMarketService';
import { MappedBalance } from '@models/dbTypes';
import { handleServiceError } from '@utils/errorUtil'

interface Asset {
    base: string;
    platform: string;
}

interface HighestPrice {
    base: string;
    platform: string;
    highestPrice: number;
}

interface UpdatedOrder {
    base: string;
    platform: string;
}

export class TrailingStopService {
    private static readonly PERCENTAGE_TO_LOSE = 0.01;
    private static readonly rateLimits = {
        kucoin: { weight: 4000, period: 30000 },
        binance: { orders: 50, period: 10000 }
    };

    static async handleTrailingStopHedge(simplifiedSelectedAssets?: Asset[]): Promise<UpdatedOrder[]> {
        try {
            // Récupérer les balances de la base de données et les plus hauts prix en parallèle
            const [balanceFromDb, highestPrices] = await Promise.all([
                BalanceService.fetchDatabaseBalances(),
                ShadService.getHighestPrices()
            ]);

            // Si les actifs sélectionnés sont fournis, filtrer les balances
            const balanceFromDbFiltered = simplifiedSelectedAssets
                ? this.filterBalances(balanceFromDb, simplifiedSelectedAssets)
                : balanceFromDb;

            // Grouper les balances par plateforme
            const symbolsAndBalanceByPlatform = this.groupBalancesByPlatform(balanceFromDbFiltered);

            // Processus de trailing stop
            return this.processTrailingStops(symbolsAndBalanceByPlatform, highestPrices, !simplifiedSelectedAssets);
        } catch (error) {
            handleServiceError(error, 'handleTrailingStopHedge', `Error handling trailing stop hedge`)
            return []
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
        try {
            const updatedOrders: UpdatedOrder[] = [];

            for (const [platform, symbolsAndBalances] of Object.entries(symbolsAndBalanceByPlatform)) {
                if (kucoinOnly && platform !== 'kucoin') continue;

                const platformTickers = await TickerService.fetchCurrentTickers(platform);
                let requestWeight = 0;
                let orderCount = 0;
                const lastResetTime = Date.now();

                for (const { base, balance } of symbolsAndBalances) {
                    if (platform !== 'kucoin' && platform !== 'binance') continue;

                    await this.handleRateLimiting(platform, requestWeight, orderCount, lastResetTime);

                    const ticker = platformTickers.find(t => t.symbol === `${base}/USDT`);
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
                        console.log(`Prix actuel non défini pour ${base} sur ${platform}`);
                    }
                }
            }

            return updatedOrders;
        } catch (error) {
            handleServiceError(error, 'processTrailingStops', `Error processing trailing stops`)
            return []
        }
    }

    private static async handleRateLimiting(platform: string, requestWeight: number, orderCount: number, lastResetTime: number): Promise<void> {
        try {
            const currentTime = Date.now();
            const timeSinceLastReset = currentTime - lastResetTime;
            const rateLimitReached =
                (platform === 'kucoin' && requestWeight >= this.rateLimits.kucoin.weight) ||
                (platform === 'binance' && orderCount >= this.rateLimits.binance.orders) ||
                timeSinceLastReset >= (platform === 'kucoin' ? this.rateLimits.kucoin.period : this.rateLimits.binance.period);

            if (rateLimitReached) {
                const waitTime = Math.max(0, (platform === 'kucoin' ? this.rateLimits.kucoin.period : this.rateLimits.binance.period) - timeSinceLastReset);
                console.log(`Limite atteinte pour ${platform}. Pause de ${waitTime}ms.`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        } catch (error) {
            handleServiceError(error, 'handleRateLimiting', `Error handling rate limiting for ${platform}`)
        }
    }

    private static async updateOrCreateOrder(platform: string, base: string, balance: number, currentPrice: number, highestPrice: number | undefined): Promise<UpdatedOrder | null> {
        try {
            if (!highestPrice && currentPrice) {
                const stopPrice = currentPrice * (1 - this.PERCENTAGE_TO_LOSE);
                await OrderMarketService.cancelAllOrdersByBunch(platform, base);
                await OrderMarketService.createOrUpdateStopLossOrder(platform, stopPrice, base, balance);
                await ShadService.updateHighestPrice(platform, base, currentPrice);
                console.log(`Ordre de trailing stop créé pour ${base}`);
                return { base, platform };
            }
        } catch (error) {
            handleServiceError(error, 'updateOrCreateOrder', `Error creating order for ${base} on ${platform}`)
            return null
        }

        try {
            if (highestPrice && currentPrice && currentPrice > highestPrice) {
                const stopLossPrice = Math.max(highestPrice, currentPrice) * (1 - this.PERCENTAGE_TO_LOSE);
                await OrderMarketService.cancelAllOrdersByBunch(platform, base);
                await OrderMarketService.createOrUpdateStopLossOrder(platform, stopLossPrice, base, balance);
                await ShadService.updateHighestPrice(platform, base, currentPrice);
                console.log(`Ordre de trailing stop mis à jour pour ${base}`);
                return { base, platform };
            }
        } catch (error) {
            handleServiceError(error, 'updateOrCreateOrder', `Error updating  order for ${base} on ${platform}`)
            return null
        }

        return null;
    }
}