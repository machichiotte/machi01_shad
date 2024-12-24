// src/services/cmcService.ts
import { CmcRepository } from '@repositories/cmcRepository';
import { handleServiceError } from '@utils/errorUtil';
import { MappedCmc, FetchResponse } from '@typ/cmc'
import { config } from '@config/index';

export class CmcService {
  private static readonly limit = 5000;
  private static readonly baseStart = 1;
  private static readonly convert = 'USD';

  /**
   * Récupère les données CMC actuelles via l'API CoinMarketCap.
   */
  public static async fetchCurrentCmc(): Promise<MappedCmc[]> {
    let start = this.baseStart;
    const allData: MappedCmc[] = [];
    if (config.apiConfig.cmc.apiKey)
      try {
        while (true) {
          const URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${this.limit}&convert=${this.convert}`;
          const response = await fetch(URL, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-CMC_PRO_API_KEY': config.apiConfig.cmc.apiKey || '',
            },
          });

          if (!response.ok) throw new Error(`Échec de la récupération des données CoinMarketCap: ${response.statusText}`);

          const { data, status }: FetchResponse = await response.json();
          if (data.length === 0) break;

          allData.push(...data);
          start += data.length;

          // Si toutes les données sont récupérées, on arrête la boucle
          if (status.total_count <= start) break;
        }
      } catch (error) {
        handleServiceError(error, 'fetchCurrentCmc', 'Erreur lors de la récupération des données CMC');
        throw error;
      }

    return allData;
  }

  /**
   * Récupère les données CMC depuis la base de données via le repository.
   */
  public static async fetchDatabaseCmc(): Promise<MappedCmc[]> {
    try {
      return await CmcRepository.fetchAll();
    } catch (error) {
      handleServiceError(error, 'fetchDatabaseCmc', 'Erreur lors de la récupération des données CMC de la base de données');
      throw error;
    }
  }

  /**
   * Met à jour les données CMC dans la base de données via le repository.
   */
  public static async updateDatabaseCmcData(data: MappedCmc[]): Promise<object> {
    try {
      const deleteResult = await CmcRepository.deleteAll();
      const saveResult = await CmcRepository.save(data);

      return {
        status: true,
        message: 'Données CMC mises à jour avec succès',
        data,
        deleteResult,
        saveResult,
        totalCount: data.length,
      };
    } catch (error) {
      handleServiceError(error, 'updateDatabaseCmcData', 'Erreur lors de la mise à jour des données CMC dans la base de données');
      throw error;
    }
  }

  /**
   * Met à jour les données CMC en récupérant les informations les plus récentes
   * via l'API puis en les enregistrant dans la base de données.
   */
  public static async updateCmcData(): Promise<object> {
    try {
      const data = await CmcService.fetchCurrentCmc();
      console.log('Dernières données CMC récupérées', { count: data.length });
      return await CmcService.updateDatabaseCmcData(data);
    } catch (error) {
      handleServiceError(error, 'updateCmcData', 'Erreur lors de la mise à jour des données CMC');
      throw error;
    }
  }
}
