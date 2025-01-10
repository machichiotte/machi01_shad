// src/services/update/updateManager.ts
import { PLATFORMS } from '@typ/platform';
import { UpdateManagerGeneral } from '@services/update/updateManagerGeneral';
import { UpdateManagerPlatform } from '@services/update/updateManagerPlatform';
import { checkApiKeys } from '@utils/platformUtil';

export class UpdateManager {

    // Méthode principale pour gérer toutes les mises à jour
    static async updateAll(): Promise<void> {
        await UpdateManagerGeneral.updateCmcIfNeeded(); // Appel pour CMC
        await this.updatePlatforms();  // Mise à jour des plateformes
    }

    // Mise à jour des données par plateforme
    private static async updatePlatforms(): Promise<void> {
        const validPlatforms = PLATFORMS.filter(platform => checkApiKeys(platform));
        if (validPlatforms.length === 0) {
            console.warn('Aucune plateforme valide trouvée.');
            return;
        }

        let completed = 0;
        console.info(`Début de la mise à jour pour ${validPlatforms.length} plateforme(s).`);

        for (const platform of validPlatforms) {
            try {
                await UpdateManagerPlatform.updatePlatformData(platform);
                completed++;
                console.info(`Mise à jour ${completed}/${validPlatforms.length} terminée pour : ${platform}`);
            } catch (error) {
                console.error(`Échec de la mise à jour pour : ${platform}`, error);
            }
        }

        console.info('Mise à jour des plateformes terminée.');
    }

}
