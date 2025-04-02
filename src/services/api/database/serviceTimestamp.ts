// src/services/api/database/serviceTimestamp.ts
import { RepoTimestamp } from '@repo/repoTimestamp';
import { TimestampData } from '@typ/timestamp';
import { handleServiceError } from '@utils/errorUtil';

export class ServiceTimestamp {
  /**
   * Récupère les informations de dernière mise à jour depuis la base de données via le repository.
   */
  static async fetchDatabaseTimestamp(): Promise<TimestampData> {
    try {
      return await RepoTimestamp.fetchTimestamp();
    } catch (error) {
      handleServiceError(error, 'fetchDatabaseTimestamp', 'Erreur lors de la récupération des dernières mises à jour');
      throw error;
    }
  }

  /**
   * Sauvegarde les informations de dernière mise à jour dans la base de données via le repository.
   */
  static async saveTimestampToDatabase(category: string, platform?: string): Promise<void> {
    try {
      // Récupération des données actuelles depuis la base de données
      const mappedData: TimestampData = (await this.fetchDatabaseTimestamp())
      const currentTimestamp = Math.floor(Date.now() / 1000); // Conversion en secondes
      if (!platform) {
        this.updateSimpleType(mappedData, category, currentTimestamp); // Mise à jour d'un champ sans plateforme
      } else {
        this.updateForPlatformType(mappedData, category, platform, currentTimestamp); // Mise à jour d'un champ dépendant d'une plateforme
      }
      await RepoTimestamp.updateTimestamp(mappedData);
    } catch (error) {
      throw error as Error
    }
  }

  /**
  * Met à jour un champ simple (sans plateforme) dans les données du timestamp.
  */
  private static updateSimpleType(data: TimestampData, type: string, currentTimestamp: number): void {
    const timestampValue = { $numberLong: currentTimestamp.toString() };

    switch (type) {
      case 'machi':
        data.machi = timestampValue;
        break;
      case 'cmc':
        data.cmc = timestampValue;
        break;
      case 'strategy':
        data.strategy = timestampValue;
        break;
      default:
        throw new Error(`Type non reconnu: ${type}`);
    }
  }

  /**
   * Met à jour un champ dépendant d'une plateforme dans les données du timestamp.
   */
  private static updateForPlatformType(data: TimestampData, category: string, platform: string, currentTimestamp: number): void {
    const timestampValue = { $numberLong: currentTimestamp.toString() };
    switch (category) {
      case 'order':
        data.order[platform] = timestampValue;
        break;
      case 'ticker':
        data.ticker[platform] = timestampValue;
        break;
      case 'balance':
        data.balance[platform] = timestampValue;
        break;
      case 'market':
        data.market[platform] = timestampValue;
        break;
      case 'trade':
        data.trade[platform] = timestampValue;
        break;
      default:
        throw new Error(`Category ou plateforme non reconnus: ${category}, ${platform}`);
    }
  }
}