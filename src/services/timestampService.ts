// src/services/timestampService.ts
import { TimestampRepository } from '@repositories/timestampRepository';
import { ExchangeData, TimestampData } from '@typ/timestamp';
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
      cmc: Date.now(),
      strategy: Date.now(),
      balance: {} as ExchangeData,
      order: {} as ExchangeData,
      market: {} as ExchangeData,
      ticker: {} as ExchangeData
    };
  }

  /**
   * Sauvegarde les informations de dernière mise à jour dans la base de données via le repository.
   */
  static async saveTimestampToDatabase(category: string, platform?: string): Promise<void> {
    console.log('typeeee', category)
    console.log('platformeeeee', platform)
    try {
      const bla = (await this.fetchDatabaseTimestamp())[0]
      const bla2 = this.initializeTimestampData()
      console.log('bla', bla)
      console.log('bla2', bla2)
      // Récupération des données actuelles depuis la base de données
      const data: TimestampData = (await this.fetchDatabaseTimestamp())[0] || this.initializeTimestampData()

      const currentTimestamp = Date.now(); // Utilisation de timestamp en string comme attendu par MongoDB
      console.log('currentTimestamp', currentTimestamp)
      if (!platform) {
        this.updateSimpleType(data, category, currentTimestamp); // Mise à jour d'un champ sans plateforme
      } else {
        this.updateForPlatformType(data, category, platform, currentTimestamp); // Mise à jour d'un champ dépendant d'une plateforme
      }

      // Sauvegarder les données mises à jour via le repository
      await TimestampRepository.updateTimestamp(data);

    } catch (error) {
      handleServiceError(error, 'saveTimestampToDatabase', ``);
      throw error;
    }
  }

  /**
  * Met à jour un champ simple (sans plateforme) dans les données du timestamp.
  */
  private static updateSimpleType(data: TimestampData, type: string, currentTimestamp: number): void {
    console.log('updateSimpleType type', type)
    switch (type) {
      case 'cmc':
        data.cmc = currentTimestamp;
        break;
      case 'strategy':
        data.strategy = currentTimestamp;
        break;
      default:
        throw new Error(`Type non reconnu: ${type}`);
    }
  }

  /**
   * Met à jour un champ dépendant d'une plateforme dans les données du timestamp.
   */
  private static updateForPlatformType(data: TimestampData, category: string, platform: string, currentTimestamp: number): void {
    console.log('updateForPlatformType - category:', category);
    console.log('updateForPlatformType - platform:', platform);

    // Vérification que 'platform' est bien une clé valide dans 'data.balance' 
    console.log('balance avant mise à jour:', data.balance);

    switch (category) {
      case 'order':
        data.order[platform] = currentTimestamp;
        break;
      case 'ticker':
        data.ticker[platform] = currentTimestamp;
        break;
      case 'balance':
        console.log(`Mise à jour de 'balance' pour la plateforme: ${platform}`);
        if (typeof data.balance !== 'object') {
          console.error("Le champ 'balance' n'est pas un objet comme attendu", data.balance);
        }
        data.balance[platform] = currentTimestamp;
        console.log('balance après mise à jour:', data.balance[platform]); // Log pour vérifier la mise à jour
        break;
      case 'market':
        data.market[platform] = currentTimestamp;
        break;
      default:
        throw new Error(`Category ou plateforme non reconnus: ${category}, ${platform}`);
    }

    console.log('balance après switch:', data.balance); // Pour vérifier l'état final de balance
  }

}