// src/services/PlatformUpdateManager.ts
import { PLATFORM } from '@src/types/platform';
import { TimestampService } from '@services/timestampService';
import { BalanceService } from '@services/balanceService';
import { MarketService } from '@services/marketService';
import { TickerService } from '@services/tickerService';

export class PlatformUpdateManager {
    static async updatePlatformData(platform: PLATFORM): Promise<void> {
        console.log(`Updating data for platform: ${platform}...`);

        try {
            await this.updateBalancesIfNeeded(platform);
            await this.updateMarketsIfNeeded(platform);
            await this.updateTickersIfNeeded(platform);
        } catch (error) {
            console.error(`Error updating platform ${platform}:`, error);
        }
    }

    // Mise à jour des balances
    private static async updateBalancesIfNeeded(platform: PLATFORM): Promise<void> {
        const timestamps = await TimestampService.fetchDatabaseTimestamp();
        const balanceUpdateInterval = 5 * 60 * 1000; // 5 minutes
        const lastBalanceUpdate = timestamps.balance[platform]?.$numberLong || '0';

        if (this.hasTimeElapsed(lastBalanceUpdate, balanceUpdateInterval)) {
            console.log(`Updating balances for ${platform}...`);
            await BalanceService.updateBalancesForPlatform(platform);
        }
    }

    // Mise à jour des marchés
    private static async updateMarketsIfNeeded(platform: PLATFORM): Promise<void> {
        const timestamps = await TimestampService.fetchDatabaseTimestamp();
        const marketUpdateInterval = 24 * 60 * 60 * 1000; // 24 heures
        const lastMarketUpdate = timestamps.market[platform]?.$numberLong || '0';

        if (this.hasTimeElapsed(lastMarketUpdate, marketUpdateInterval)) {
            console.log(`Updating markets for ${platform}...`);
            await MarketService.updateMarketsForPlatform(platform);
        }
    }

    // Mise à jour des tickers
    private static async updateTickersIfNeeded(platform: PLATFORM): Promise<void> {
        const timestamps = await TimestampService.fetchDatabaseTimestamp();
        const tickerUpdateInterval = 1 * 60 * 1000; // 1 minute
        const lastTickerUpdate = timestamps.ticker[platform]?.$numberLong || '0';

        if (this.hasTimeElapsed(lastTickerUpdate, tickerUpdateInterval)) {
            console.log(`Updating tickers for ${platform}...`);
            await TickerService.updateTickersForPlatform(platform);
        }
    }

    // Vérification du temps écoulé
    private static hasTimeElapsed(lastTimestamp: string, intervalInMs: number): boolean {
        if (isNaN(parseInt(lastTimestamp))) {
            return false;
        }
        const currentTime = Date.now();
        return (currentTime - parseInt(lastTimestamp)) > intervalInMs;
    }
}
