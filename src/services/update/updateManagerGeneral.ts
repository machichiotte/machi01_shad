// src/services/update/updateManagerGeneral.ts
import { ServiceTimestamp } from '@services/api/database/serviceTimestamp';
import { ServiceCmc } from '@services/api/serviceCmc';
import { hasTimeElapsed } from '@utils/timeUtil';
import { config } from '@config/index';

export class UpdateManagerGeneral {
    private static readonly UPDATE_INTERVALS = {
        cmc: config.serverConfig.cacheExpirationTimes.cmc
    };

    static async updateCmcIfNeeded(): Promise<void> {
        const timestamps = await ServiceTimestamp.fetchDatabaseTimestamp();
        const cmcUpdateInterval = this.UPDATE_INTERVALS.cmc
        const lastCmcUpdate = timestamps.cmc.$numberLong || '0';

        if (hasTimeElapsed(lastCmcUpdate, cmcUpdateInterval)) {
            console.debug('[UpdateManagerGeneral] Updating CMC data...');
            await ServiceCmc.updateCmcData();
        } else {
            console.debug('[UpdateManagerGeneral] Cmc : Up to date !')
        }
    }
}
