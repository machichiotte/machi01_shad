// src/services/update/updateManager.ts
import { UpdateManagerGeneral } from '@services/update/updateManagerGeneral'
import { logger } from '@utils/loggerUtil' // Importer le logger Winston
import { formatErrorForLog } from '@utils/errorUtil' // Importer le helper
import { UpdateManagerPlatform } from './updateManagerPlatform'
import path from 'path'

export class UpdateManager {
  // Méthode principale pour gérer toutes les mises à jour
  static async updateAll(): Promise<void> {
    const operation = 'updateAll'
    logger.info('Starting global update process...', {
      module: path.parse(__filename).name,
      operation
    })
    try {
      // Log avant chaque étape majeure
      logger.info('Updating general data (CMC)...', {
        module: path.parse(__filename).name,
        operation
      })
      await UpdateManagerGeneral.updateCmcIfNeeded()
      logger.info('General data update step completed.', {
        module: path.parse(__filename).name,
        operation
      })

      logger.info('Updating platform-specific data...', {
        module: path.parse(__filename).name,
        operation
      })
      await UpdateManagerPlatform.updatePlatforms() // Mise à jour des plateformes
      logger.info('Platform-specific data update step completed.', {
        module: path.parse(__filename).name,

        operation
      })

      logger.info('Global update process finished successfully.', {
        module: path.parse(__filename).name,

        operation
      })
    } catch (error) {
      // Attrape les erreurs qui pourraient survenir dans updateCmcIfNeeded ou si updatePlatforms propage une erreur non interceptée
      logger.error('An error occurred during the global update process.', {
        module: path.parse(__filename).name,

        operation,
        error: formatErrorForLog(error)
      })
      // Décidez si l'erreur doit être relancée pour arrêter d'autres processus ou juste loguée
      // throw error;
    }
  }
}
