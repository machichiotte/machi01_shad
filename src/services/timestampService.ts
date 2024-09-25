// src/services/timestampService.ts
import { TimestampRepository } from '@repositories/timestampRepository';
import { TimestampData } from '@typ/timestamp';
import { handleServiceError } from '@utils/errorUtil';

export class TimestampService {
  /**
   * Récupère les informations de dernière mise à jour depuis la base de données via le repository.
   */
  static async fetchDatabaseTimestamp(): Promise<TimestampData[]> {
    try {
      return await TimestampRepository.fetchTimestamp();
    } catch (error) {
      handleServiceError(error, 'fetchDatabaseTimestamp', 'Erreur lors de la récupération des dernières mises à jour');
      throw error;
    }
  }

  /**
   * Sauvegarde les informations de dernière mise à jour dans la base de données via le repository.
   */
  static async saveTimestampToDatabase(type: string, platform?: string): Promise<void> {
    try {
      const data: TimestampData = (await this.fetchDatabaseTimestamp())[0] || {};

      console.log(`saveTimestampToDatabase Type: ${type} | Platform: ${platform} | Size: ${Array.isArray(data) ? data.length : Object.keys(data).length} | Data: ${JSON.stringify(data)}`);

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
      await TimestampRepository.updateTimestamp(data);

    } catch (error) {
      handleServiceError(error, 'saveTimestampToDatabase', `Erreur lors de la sauvegarde de la dernière mise à jour pour le type ${type}`);
      throw error;
    }
  }
}