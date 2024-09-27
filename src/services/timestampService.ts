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

  private static initializeTimestampData(): Omit<TimestampData, '_id'> {
    return {
      cmc: { $numberLong: Date.now().toString() },
      strategy: { $numberLong: Date.now().toString() },
      balance: {},
      order: {},
      market: {},
      ticker: {}
    };
  }

  /**
   * Sauvegarde les informations de dernière mise à jour dans la base de données via le repository.
   */
  static async saveTimestampToDatabase(type: string, platform?: string): Promise<void> {
    try {
      // Récupération des données actuelles depuis la base de données
      const data: TimestampData = (await this.fetchDatabaseTimestamp())[0] || this.initializeTimestampData()

      const currentTimestamp = Date.now().toString(); // Utilisation de timestamp en string comme attendu par MongoDB

      if (!platform) {
        this.updateSimpleType(data, type, currentTimestamp); // Mise à jour d'un champ sans plateforme
      } else {
        this.updatePlatformType(data, type, platform, currentTimestamp); // Mise à jour d'un champ dépendant d'une plateforme
      }

      // Sauvegarder les données mises à jour via le repository
      await TimestampRepository.updateTimestamp(data);

    } catch (error) {
      handleServiceError(error, 'saveTimestampToDatabase', `Erreur lors de la sauvegarde de la dernière mise à jour pour le type ${type}`);
      throw error;
    }
  }

  /**
  * Met à jour un champ simple (sans plateforme) dans les données du timestamp.
  */
  private static updateSimpleType(data: TimestampData, type: string, currentTimestamp: string): void {
    switch (type) {
      case 'cmc':
        data.cmc.$numberLong = currentTimestamp;
        break;
      case 'strategy':
        data.strategy.$numberLong = currentTimestamp;
        break;
      default:
        throw new Error(`Type non reconnu: ${type}`);
    }
  }

  /**
   * Met à jour un champ dépendant d'une plateforme dans les données du timestamp.
   */
  private static updatePlatformType(data: TimestampData, type: string, platform: string, currentTimestamp: string): void {
    switch (type) {
      case 'activeOrders':
        data.order[platform] = { $numberLong: currentTimestamp };
        break;
      case 'tickers':
        data.ticker[platform] = { $numberLong: currentTimestamp };
        break;
      case 'balance':
        data.balance[platform] = { $numberLong: currentTimestamp };
        break;
      case 'loadMarkets':
        data.market[platform] = { $numberLong: currentTimestamp };
        break;
      default:
        throw new Error(`Type ou plateforme non reconnus: ${type}, ${platform}`);
    }
  }
}