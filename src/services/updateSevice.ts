// src/services/UpdateService.ts
import { PLATFORMS } from '@src/types/platform';
import { CmcService } from '@services/cmcService';
import { PlatformUpdateManager } from '@services/platformUpdateManager';
import { TimestampService } from '@services/timestampService';

export class UpdateService {
    // Méthode principale pour gérer toutes les mises à jour
    static async updateAll(): Promise<void> {
        await this.updateCmcIfNeeded(); // Appel pour CMC
        await this.updatePlatforms();  // Mise à jour des plateformes
    }

    // Mise à jour des données de CoinMarketCap (CMC)
    private static async updateCmcIfNeeded(): Promise<void> {
        const timestamps = await TimestampService.fetchDatabaseTimestamp();
        const cmcUpdateInterval = 24 * 60 * 60 * 1000; // 24 heures
        const lastCmcUpdate = timestamps.cmc.$numberLong || '0';

        if (this.hasTimeElapsed(lastCmcUpdate, cmcUpdateInterval)) {
            console.log('Updating CMC data...');
            await CmcService.updateCmcData();
        }
    }

    // Mise à jour des données par plateforme
    private static async updatePlatforms(): Promise<void> {
        const platformUpdates = PLATFORMS.map(platform =>
            PlatformUpdateManager.updatePlatformData(platform)
        );

        // Mise à jour parallèle des plateformes
        await Promise.all(platformUpdates);
        console.log('All platforms updated successfully.');
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
