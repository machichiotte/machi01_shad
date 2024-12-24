// src/services/PlatformUpdateManager.ts
import { PLATFORM } from '@src/types/platform';
import { TimestampService } from '@services/timestampService';
import { BalanceService } from '@services/balanceService';
import { MarketService } from '@services/marketService';
import { TickerService } from '@services/tickerService';
import { hasTimeElapsed } from '@src/utils/timeUtil';

export class PlatformUpdateManager {
    private static readonly UPDATE_INTERVALS = {
        balance: 5 * 60 * 1000, // 5 minutes
        market: 24 * 60 * 60 * 1000, // 24 hours
        ticker: 1 * 60 * 1000 // 1 minute
    };

    static async updatePlatformData(platform: PLATFORM): Promise<void> {
        console.log(`Updating data for ${platform}...`);

        try {
            await Promise.all([
                this.updateIfNeeded(platform, 'balance', BalanceService.updateBalancesForPlatform),
                this.updateIfNeeded(platform, 'market', MarketService.updateMarketsForPlatform),
                this.updateIfNeeded(platform, 'ticker', TickerService.updateTickersForPlatform)
            ]);
        } catch (error) {
            console.error(`Error updating platform ${platform}:`, error);
        }
    }

    private static async updateIfNeeded(
        platform: PLATFORM,
        key: keyof typeof PlatformUpdateManager.UPDATE_INTERVALS,
        updateFunction: (platform: PLATFORM) => Promise<void>
    ): Promise<void> {
        try {
            const timestamps = await TimestampService.fetchDatabaseTimestamp();
            const lastUpdate = timestamps[key]?.[platform]?.$numberLong || '0';
            const interval = this.UPDATE_INTERVALS[key];

            if (hasTimeElapsed(lastUpdate, interval)) {
                console.info(`Updating ${key} for ${platform}...`);
                await updateFunction(platform);
            }
        } catch (error) {
            console.error(`Failed to update ${key} for ${platform}:`, error);
        }
    }
}
