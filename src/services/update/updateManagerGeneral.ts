// src/services/update/updateManagerGeneral.ts
import { ServiceTimestamp } from '@services/api/database/serviceTimestamp';
import { ServiceCmc } from '@services/api/serviceCmc';
import { hasTimeElapsed } from '@utils/timeUtil';
import { config } from '@config/index';
import path from 'path'; import { logger } from '@src/utils/loggerUtil';

export class UpdateManagerGeneral {
    private static readonly UPDATE_INTERVALS = {
        cmc: config.serverConfig.cacheExpirationTimes.cmc
    };

    static async updateCmcIfNeeded(): Promise<void> {
        const operation = 'updateCmcIfNeeded'
        const timestamps = await ServiceTimestamp.fetchDatabaseTimestamp();
        const cmcUpdateInterval = this.UPDATE_INTERVALS.cmc
        const lastCmcUpdate = timestamps.cmc.$numberLong || '0';

        if (hasTimeElapsed(lastCmcUpdate, cmcUpdateInterval)) {
            logger.debug('[UpdateManagerGeneral] Updating CMC data...', { module: path.parse(__filename).name, operation });
            await ServiceCmc.updateCmcData();
        } else {
            logger.debug('[UpdateManagerGeneral] Cmc : Up to date !', { module: path.parse(__filename).name, operation })
        }
    }
}
