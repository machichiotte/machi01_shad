// src/services/GeneralUpdateManager.ts
import { TimestampService } from '@services/timestampService';
import { CmcService } from '@services/cmcService';
import { hasTimeElapsed } from '@src/utils/timeUtil';

export class GeneralUpdateManager {
    private static readonly UPDATE_INTERVALS = {
        cmc: 24 * 60 * 60 * 1000, // 24 hours
    };

    static async updateCmcIfNeeded(): Promise<void> {
        const timestamps = await TimestampService.fetchDatabaseTimestamp();
        const cmcUpdateInterval = this.UPDATE_INTERVALS.cmc
        const lastCmcUpdate = timestamps.cmc.$numberLong || '0';

        if (hasTimeElapsed(lastCmcUpdate, cmcUpdateInterval)) {
            console.log('Updating CMC data...');
            await CmcService.updateCmcData();
        }
    }
}
