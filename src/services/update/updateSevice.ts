// src/services/UpdateService.ts
import { PLATFORMS } from '@typ/platform';
import { GeneralUpdateManager } from '@services/generalUpdateManager';
import { PlatformUpdateManager } from '@services/api/platform/platformUpdateManager';
import { checkApiKeys } from '@utils/platformUtil';

export class UpdateService {

    // Méthode principale pour gérer toutes les mises à jour
    static async updateAll(): Promise<void> {
        await GeneralUpdateManager.updateCmcIfNeeded(); // Appel pour CMC
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
                await PlatformUpdateManager.updatePlatformData(platform);
                completed++;
                console.info(`Mise à jour ${completed}/${validPlatforms.length} terminée pour : ${platform}`);
            } catch (error) {
                console.error(`Échec de la mise à jour pour : ${platform}`, error);
            }
        }

        console.info('Mise à jour des plateformes terminée.');
    }

}
