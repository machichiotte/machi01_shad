// src/services/GeneralUpdateManager.ts
import { TimestampService } from '@src/services/api/database/timestampService';
import { CmcService } from '@services/api/cmcService';
import { hasTimeElapsed } from '@utils/timeUtil';
import { config } from '@config/index';

export class GeneralUpdateManager {
    private static readonly UPDATE_INTERVALS = {
        cmc: config.serverConfig.cacheExpirationTimes.cmc
    };

    static async updateCmcIfNeeded(): Promise<void> {
        const timestamps = await TimestampService.fetchDatabaseTimestamp();
        const cmcUpdateInterval = this.UPDATE_INTERVALS.cmc
        const lastCmcUpdate = timestamps.cmc.$numberLong || '0';

        if (hasTimeElapsed(lastCmcUpdate, cmcUpdateInterval)) {
            console.info('Updating CMC data...');
            await CmcService.updateCmcData();
        }
    }
}
