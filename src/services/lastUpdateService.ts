// src/services/lastUpdateService.ts
import { LastUpdateRepository } from '@repositories/lastUpdateRepository';
import { LastUpdateData } from '@typ/database';
import { handleServiceError } from '@utils/errorUtil';

export class LastUpdateService {
  /**
   * Récupère les informations de dernière mise à jour depuis la base de données via le repository.
   */
  static async fetchDatabaseLastUpdate(): Promise<LastUpdateData[]> {
    try {
      return await LastUpdateRepository.fetchLastUpdate();
    } catch (error) {
      handleServiceError(error, 'fetchDatabaseLastUpdate', 'Erreur lors de la récupération des dernières mises à jour');
      throw error;
    }
  }

  /**
   * Sauvegarde les informations de dernière mise à jour dans la base de données via le repository.
   */
  static async saveLastUpdateToDatabase(type: string, platform?: string): Promise<void> {
    try {
      const data: LastUpdateData = (await this.fetchDatabaseLastUpdate())[0] || {};

      console.log(`saveLastUpdateToDatabase Type: ${type} | Platform: ${platform} | Size: ${Array.isArray(data) ? data.length : Object.keys(data).length} | Data: ${JSON.stringify(data)}`);

      if (!platform) {
        data[type] = Date.now();
      } else {
        if (!data[type] || typeof data[type] === 'number') {
          data[type] = {};
        }

        (data[type] as { [key: string]: number })[platform] = Date.now();
        console.log(`data[type] ${(data[type] as { [key: string]: number })[platform]}`);
      }

      // Sauvegarder les données mises à jour via le repository
      await LastUpdateRepository.updateLastUpdate(data);

    } catch (error) {
      handleServiceError(error, 'saveLastUpdateToDatabase', `Erreur lors de la sauvegarde de la dernière mise à jour pour le type ${type}`);
      throw error;
    }
  }
}