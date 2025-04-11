// src/services/update/updateManagerPlatform.ts
import { PLATFORM } from '@typ/platform';
import { ServiceTimestamp } from '@services/api/database/serviceTimestamp';
import { ServiceBalance } from '@services/api/platform/serviceBalance';
import { ServiceMarket } from '@services/api/platform/serviceMarket';
import { ServiceTicker } from '@services/api/platform/serviceTicker';
import { hasTimeElapsed } from '@utils/timeUtil';
import { config } from '@config/index';
import path from 'path'; import { logger } from '@utils/loggerUtil'; // Importer le logger Winston
import { formatErrorForLog } from '@utils/errorUtil'; // Importer le helper pour formater les erreurs

const module = 'UpdateManagerPlatform'; // Nom du module pour les logs

export class UpdateManagerPlatform {
  // Utiliser les types de config pour plus de sécurité
  private static readonly UPDATE_INTERVALS = {
    balance: config.serverConfig.cacheExpirationTimes.balance,
    market: config.serverConfig.cacheExpirationTimes.market,
    ticker: config.serverConfig.cacheExpirationTimes.ticker
  };

  static async updatePlatformData(platform: PLATFORM): Promise<void> {
    const operation = 'updatePlatformData';
    logger.debug(`Updating all data types for platform: ${platform}...`, { module, operation, platform });

    try {
      // Promise.all exécutera les mises à jour en parallèle
      await Promise.all([
        this.updateIfNeeded(
          platform,
          'balance',
          ServiceBalance.updateBalancesForPlatform // Passer la référence de la fonction
        ),
        this.updateIfNeeded(
          platform,
          'market',
          ServiceMarket.updateMarketsForPlatform
        ),
        this.updateIfNeeded(
          platform,
          'ticker',
          ServiceTicker.updateTickersForPlatform
        )
      ]);
      logger.debug(`All data type updates initiated successfully for ${platform}.`, { module, operation, platform });
    } catch (error) {
      logger.error(`Error during parallel update initiation for platform ${platform}`, {
        module,
        operation,
        platform,
        error: formatErrorForLog(error) // Utiliser le helper
      });
      // !! IMPORTANT: Relancer l'erreur pour que UpdateManager sache que la mise à jour de cette plateforme a échoué
      throw error;
    }
  }

  private static async updateIfNeeded(
    platform: PLATFORM,
    key: keyof typeof UpdateManagerPlatform.UPDATE_INTERVALS,
    updateFunction: (platform: PLATFORM) => Promise<void>
  ): Promise<void> {
    const operation = 'updateIfNeeded';
    const context = { module, operation, platform, key };
    logger.debug(`Checking if update is needed for '${key}'...`, context);
    try {
      const timestamps = await ServiceTimestamp.fetchDatabaseTimestamp();
      const lastUpdateTimestampStr = timestamps[key]?.[platform]?.$numberLong ?? '0';
      const lastUpdateTimestamp = parseInt(lastUpdateTimestampStr, 10);
      const intervalMinutes = this.UPDATE_INTERVALS[key];
      const updateNeeded = hasTimeElapsed(lastUpdateTimestampStr, intervalMinutes);
      const lastUpdateDate = new Date(lastUpdateTimestamp);

      if (updateNeeded) {
        logger.info(`Update required for '${key}', executing update function...`, {
          ...context,
          lastUpdate: lastUpdateTimestamp === 0 ? 'Never' : lastUpdateDate.toISOString(),
          intervalMinutes: intervalMinutes
        });
        await updateFunction(platform);
        logger.info(`Update function for '${key}' executed successfully.`, context);
      } else {
        logger.debug(`Update not required for '${key}'. Last update was recent enough.`, {
          ...context,
          lastUpdate: lastUpdateTimestamp === 0 ? 'Never' : lastUpdateDate.toISOString(),
          intervalMinutes: intervalMinutes
        });
      }
    } catch (error) {
      logger.error(`Failed processing update check/execution for '${key}' on ${platform}`, {
        ...context,
        error: formatErrorForLog(error)
      });
      // !! IMPORTANT: Relancer l'erreur pour la propagation correcte
      throw error;
    }
  }
}