// src/services/UpdateService.ts

import { CmcService } from '@services/cmcService';
import { BalanceService } from '@services/balanceService';
import { MarketService } from '@services/marketService';
import { TickerService } from '@services/tickerService';
import { TimestampService } from '@services/timestampService';
import { PLATFORM } from '@src/types/platform';

export class UpdateService {
    // Méthode publique pour gérer toutes les mises à jour
    static async updateAll(): Promise<void> {
        await this.updateCmcIfNeeded();
        await this.updateBalancesIfNeeded();
        await this.updateMarketsIfNeeded();
        await this.updateTickersIfNeeded();
    }

    // Mise à jour des données CMC si nécessaire
    private static async updateCmcIfNeeded(): Promise<void> {
        const timestamps = await TimestampService.fetchDatabaseTimestamp();
        const cmcUpdateInterval = 24 * 60 * 60 * 1000; // 24 heures
        const lastCmcUpdate = timestamps.cmc.$numberLong || '0';

        if (this.hasTimeElapsed(lastCmcUpdate, cmcUpdateInterval)) {
            console.log('CMC data is outdated, updating now...');
            await CmcService.updateCmcData();
        }
    }

    // Mise à jour des balances si nécessaire
    private static async updateBalancesIfNeeded(): Promise<void> {
        const timestamps = await TimestampService.fetchDatabaseTimestamp();
        const balanceUpdateInterval = 5 * 60 * 1000; // 5 minutes
        const balanceTimestamps = timestamps.balance;

        for (const platform in balanceTimestamps) {
            const lastBalanceUpdate = balanceTimestamps[platform]?.$numberLong || '0';
            if (this.hasTimeElapsed(lastBalanceUpdate, balanceUpdateInterval)) {
                console.log(`Balance for ${platform} is outdated, updating now...`);
                await BalanceService.updateBalancesForPlatform(platform as PLATFORM);
            }
        }
    }

    // Mise à jour des marchés si nécessaire
    private static async updateMarketsIfNeeded(): Promise<void> {
        const timestamps = await TimestampService.fetchDatabaseTimestamp();
        const marketUpdateInterval = 24 * 60 * 60 * 1000; // 24 heures
        const marketTimestamps = timestamps.market;

        for (const platform in marketTimestamps) {
            const lastMarketUpdate = marketTimestamps[platform]?.$numberLong || '0';
            if (this.hasTimeElapsed(lastMarketUpdate, marketUpdateInterval)) {
                console.log(`Market data for ${platform} is outdated, updating now...`);
                await MarketService.updateMarketsForPlatform(platform as PLATFORM);
            }
        }
    }

    // Mise à jour des tickers si nécessaire
    private static async updateTickersIfNeeded(): Promise<void> {
        const timestamps = await TimestampService.fetchDatabaseTimestamp();
        const tickerUpdateInterval = 1 * 60 * 1000; // 1 minute
        const tickerTimestamps = timestamps.ticker;

        for (const platform in tickerTimestamps) {
            const lastTickerUpdate = tickerTimestamps[platform]?.$numberLong || '0';
            if (this.hasTimeElapsed(lastTickerUpdate, tickerUpdateInterval)) {
                console.log(`Ticker data for ${platform} is outdated, updating now...`);
                await TickerService.updateTickersForPlatform(platform as PLATFORM);
            }
        }
    }

    // Méthode pour comparer les timestamps
    private static hasTimeElapsed(lastTimestamp: string, intervalInMs: number): boolean {
        if (isNaN(parseInt(lastTimestamp))) {
            return false;
        }
        const currentTime = Date.now();
        return (currentTime - parseInt(lastTimestamp)) > intervalInMs;
    }
}
