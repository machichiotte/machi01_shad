// src/repo/repoTrailingStop.ts
import { BalanceService } from '@services/api/platform/balanceService';
import { MachiService } from '@services/api/platform/machiService';
import { TickerService } from '@services/api/platform/tickerService';
import { OrderMarketService } from '@services/api/platform/orderMarketService';
import { MappedBalance } from '@typ/balance';
import { HighestPrice } from '@typ/trailingStop';
import { PLATFORM } from '@typ/platform';
import { handleServiceError } from '@utils/errorUtil';

export class RepoTrailingStop {
    static async fetchBalanceAndHighestPrices(): Promise<[MappedBalance[], HighestPrice[]]> {
        try {
            return await Promise.all([
                BalanceService.fetchDatabaseBalance(),
                MachiService.getHighestPrices()
            ]);
        } catch (error) {
            handleServiceError(error, 'fetchBalanceAndHighestPrices', 'Error fetching balance and highest prices');
            return [[], []];
        }
    }

    static async fetchCurrentTickers(platform: PLATFORM) {
        try {
            return await TickerService.fetchCurrentTickers(platform);
        } catch (error) {
            handleServiceError(error, 'fetchCurrentTickers', `Error fetching current tickers for ${platform}`);
            return [];
        }
    }

    static async cancelAllOrdersByBunch(platform: PLATFORM, base: string): Promise<void> {
        try {
            await OrderMarketService.cancelAllOrdersByBunch(platform, base);
        } catch (error) {
            handleServiceError(error, 'cancelAllOrdersByBunch', `Error cancelling orders for ${base} on ${platform}`);
        }
    }

    static async createOrUpdateStopLossOrder(platform: PLATFORM, stopPrice: number, base: string, balance: number): Promise<void> {
        try {
            await OrderMarketService.createOrUpdateStopLossOrder(platform, stopPrice, base, balance);
        } catch (error) {
            handleServiceError(error, 'createOrUpdateStopLossOrder', `Error creating/updating stop loss order for ${base} on ${platform}`);
        }
    }

    static async updateHighestPrice(platform: PLATFORM, base: string, price: number): Promise<void> {
        try {
            await MachiService.updateHighestPrice(platform, base, price);
        } catch (error) {
            handleServiceError(error, 'updateHighestPrice', `Error updating highest price for ${base} on ${platform}`);
        }
    }
}