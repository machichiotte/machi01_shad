// src/services/update/updateManager.ts
import { PLATFORMS } from '@constants/platform';
import { UpdateManagerGeneral } from '@services/update/updateManagerGeneral';
import { UpdateManagerPlatform } from '@services/update/updateManagerPlatform';
import { checkApiKeys } from '@utils/platformUtil';
import { logger } from '@utils/loggerUtil'; // Importer le logger Winston
import { formatErrorForLog } from '@utils/errorUtil'; // Importer le helper

const module = 'UpdateManager'; // Nom du module pour les logs

export class UpdateManager {

    // Méthode principale pour gérer toutes les mises à jour
    static async updateAll(): Promise<void> {
        const operation = 'updateAll';
        logger.info('Starting global update process...', { module, operation });
        try {
            // Log avant chaque étape majeure
            logger.info('Updating general data (CMC)...', { module, operation });
            await UpdateManagerGeneral.updateCmcIfNeeded();
            logger.info('General data update step completed.', { module, operation });

            logger.info('Updating platform-specific data...', { module, operation });
            await this.updatePlatforms(); // Mise à jour des plateformes
            logger.info('Platform-specific data update step completed.', { module, operation });

            logger.info('Global update process finished successfully.', { module, operation });
        } catch (error) {
            // Attrape les erreurs qui pourraient survenir dans updateCmcIfNeeded ou si updatePlatforms propage une erreur non interceptée
            logger.error('An error occurred during the global update process.', { module, operation, error: formatErrorForLog(error) });
            // Décidez si l'erreur doit être relancée pour arrêter d'autres processus ou juste loguée
            // throw error;
        }
    }

    // Mise à jour des données par plateforme
    private static async updatePlatforms(): Promise<void> {
        const operation = 'updatePlatforms';
        logger.debug('Checking valid platforms for update...', { module, operation });
        const validPlatforms = PLATFORMS.filter(platform => checkApiKeys(platform));

        if (validPlatforms.length === 0) {
            logger.warn('No valid platforms found with API keys for update.', { module, operation });
            return;
        }

        let completed = 0;
        let failed = 0;
        logger.info(`Starting platform updates for ${validPlatforms.length} valid platform(s): ${validPlatforms.join(', ')}`, { module, operation, validPlatforms, platformCount: validPlatforms.length });

        // Utiliser Promise.allSettled pour exécuter les mises à jour en parallèle (optionnel mais plus rapide)
        // Ou garder la boucle for...of pour une exécution séquentielle (plus simple à suivre dans les logs)
        // Ici, on garde la boucle séquentielle pour correspondre à l'original

        for (const platform of validPlatforms) {
            const platformContext = { module, operation, platform };
            logger.debug(`Starting update for platform: ${platform}`, platformContext);
            try {
                await UpdateManagerPlatform.updatePlatformData(platform);
                completed++;
                logger.debug(`Update completed for: ${platform}. Progress: ${completed}/${validPlatforms.length}`, { ...platformContext, progress: `${completed}/${validPlatforms.length}`, status: 'success' });
            } catch (error) {
                failed++;
                logger.error(`Update failed for platform: ${platform}`, { ...platformContext, status: 'failed', error: formatErrorForLog(error) });
                // L'erreur n'est pas relancée ici, permettant à la boucle de continuer pour les autres plateformes.
            }
        }

        const statusMessage = failed === 0 ? 'All platform updates completed successfully.' : `Platform updates process finished with ${failed} failure(s).`;
        logger.info(statusMessage, { module, operation, completedCount: completed, failedCount: failed, totalAttempted: validPlatforms.length });

        // Si une seule erreur doit arrêter tout le processus, il faudrait relancer l'erreur dans le catch
        // ou retourner une information d'échec ici.
    }
}