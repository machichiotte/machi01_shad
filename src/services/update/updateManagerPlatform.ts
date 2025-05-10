// src/services/update/updateManagerPlatform.ts
import { PLATFORM } from '@typ/platform'
import { ServiceTimestamp } from '@services/api/database/serviceTimestamp'
import { ServiceBalance } from '@services/api/platform/serviceBalance'
import { ServiceMarket } from '@services/api/platform/serviceMarket'
import { ServiceTicker } from '@services/api/platform/serviceTicker'
import { hasTimeElapsed } from '@utils/timeUtil'
import { config } from '@config/index'
import { PLATFORMS } from '@constants/platform'
import { checkApiKeys } from '@utils/platformUtil'
import { logger } from '@utils/loggerUtil' // Importer le logger Winston
import { formatErrorForLog } from '@utils/errorUtil' // Importer le helper pour formater les erreurs
import path from 'path'

export class UpdateManagerPlatform {
  // Utiliser les types de config pour plus de sécurité
  private static readonly UPDATE_INTERVALS = {
    balance: config.serverConfig.cacheExpirationTimes.balance,
    market: config.serverConfig.cacheExpirationTimes.market,
    ticker: config.serverConfig.cacheExpirationTimes.ticker
  }

  private static async updatePlatformData(platform: PLATFORM): Promise<void> {
    const operation = 'updatePlatformData'
    logger.debug(`Updating all data types for platform: ${platform}...`, {
      module: path.parse(__filename).name,
      operation,
      platform
    })

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
      ])
      logger.debug(
        `All data type updates initiated successfully for ${platform}.`,
        {
          module: path.parse(__filename).name,
          operation, platform
        }
      )
    } catch (error) {
      logger.error(
        `Error during parallel update initiation for platform ${platform}`,
        {
          module: path.parse(__filename).name,

          operation,
          platform,
          error: formatErrorForLog(error) // Utiliser le helper
        }
      )
      // !! IMPORTANT: Relancer l'erreur pour que UpdateManager sache que la mise à jour de cette plateforme a échoué
      throw error
    }
  }

  private static async updateIfNeeded(
    platform: PLATFORM,
    key: keyof typeof UpdateManagerPlatform.UPDATE_INTERVALS,
    updateFunction: (platform: PLATFORM) => Promise<void>
  ): Promise<void> {
    const operation = 'updateIfNeeded'
    const context = {
      module: path.parse(__filename).name,
      operation, platform, key
    }
    logger.debug(`Checking if update is needed for '${key}'...`, context)
    try {
      const timestamps = await ServiceTimestamp.fetchDatabaseTimestamp()
      const lastUpdateTimestampStr =
        timestamps[key]?.[platform]?.$numberLong ?? '0'
      const lastUpdateTimestamp = parseInt(lastUpdateTimestampStr, 10)
      const intervalMinutes = this.UPDATE_INTERVALS[key]
      const updateNeeded = hasTimeElapsed(
        lastUpdateTimestampStr,
        intervalMinutes
      )
      const lastUpdateDate = new Date(lastUpdateTimestamp)

      if (updateNeeded) {
        logger.info(
          `Update required for '${key}', executing update function...`,
          {
            ...context,
            lastUpdate:
              lastUpdateTimestamp === 0
                ? 'Never'
                : lastUpdateDate.toISOString(),
            intervalMinutes: intervalMinutes
          }
        )
        await updateFunction(platform)
        logger.info(
          `Update function for '${key}' executed successfully.`,
          context
        )
      } else {
        logger.debug(
          `Update not required for '${key}'. Last update was recent enough.`,
          {
            ...context,
            lastUpdate:
              lastUpdateTimestamp === 0
                ? 'Never'
                : lastUpdateDate.toISOString(),
            intervalMinutes: intervalMinutes
          }
        )
      }
    } catch (error) {
      logger.error(
        `Failed processing update check/execution for '${key}' on ${platform}`,
        {
          ...context,
          error: formatErrorForLog(error)
        }
      )
      // !! IMPORTANT: Relancer l'erreur pour la propagation correcte
      throw error
    }
  }

  // Mise à jour des données par plateforme
  static async updatePlatforms(): Promise<void> {
    const operation = 'updatePlatforms'
    logger.debug('Checking valid platforms for update...', {
      module: path.parse(__filename).name,

      operation
    })
    const validPlatforms = PLATFORMS.filter((platform) =>
      checkApiKeys(platform)
    )

    if (validPlatforms.length === 0) {
      logger.warn('No valid platforms found with API keys for update.', {
        module: path.parse(__filename).name,

        operation
      })
      return
    }

    let completed = 0
    let failed = 0
    logger.info(
      `Starting platform updates for ${validPlatforms.length} valid platform(s): ${validPlatforms.join(', ')}`,
      {
        module: path.parse(__filename).name,

        operation,
        validPlatforms,
        platformCount: validPlatforms.length
      }
    )

    // Utiliser Promise.allSettled pour exécuter les mises à jour en parallèle (optionnel mais plus rapide)
    // Ou garder la boucle for...of pour une exécution séquentielle (plus simple à suivre dans les logs)
    // Ici, on garde la boucle séquentielle pour correspondre à l'original

    for (const platform of validPlatforms) {
      const platformContext = {
        module: path.parse(__filename).name,
        operation, platform
      }
      logger.debug(`Starting update for platform: ${platform}`, platformContext)
      try {
        await UpdateManagerPlatform.updatePlatformData(platform)
        completed++
        logger.debug(
          `Update completed for: ${platform}. Progress: ${completed}/${validPlatforms.length}`,
          {
            ...platformContext,
            progress: `${completed}/${validPlatforms.length}`,
            status: 'success'
          }
        )
      } catch (error) {
        failed++
        logger.error(`Update failed for platform: ${platform}`, {
          ...platformContext,
          status: 'failed',
          error: formatErrorForLog(error)
        })
        // L'erreur n'est pas relancée ici, permettant à la boucle de continuer pour les autres plateformes.
      }
    }

    const statusMessage =
      failed === 0
        ? 'All platform updates completed successfully.'
        : `Platform updates process finished with ${failed} failure(s).`
    logger.info(statusMessage, {
      module: path.parse(__filename).name,

      operation,
      completedCount: completed,
      failedCount: failed,
      totalAttempted: validPlatforms.length
    })

    // Si une seule erreur doit arrêter tout le processus, il faudrait relancer l'erreur dans le catch
    // ou retourner une information d'échec ici.
  }
}
