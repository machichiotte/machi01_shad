import { getData } from '@utils/dataUtil';
import { LastUpdateService } from './lastUpdateService';
import { deleteAllDataMDB, saveData } from './mongodbService';
import { MappedCmc } from 'src/models/dbTypes';
import { handleServiceError } from '@utils/errorUtil';
interface FetchResponse {
  data: MappedCmc[];
  status: { total_count: number };
}

export class CmcService {
  private static readonly API_KEY = process.env.CMC_APIKEY as string;
  private static readonly limit = 5000;
  private static readonly baseStart = 1;
  private static readonly convert = 'USD';

  /**
   * Fetches the latest CoinMarketCap data from the API.
   */
  public static async fetchCurrentCmc(): Promise<MappedCmc[]> {
    let start = this.baseStart;
    const allData: MappedCmc[] = [];

    try {
      while (true) {
        const URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${this.limit}&convert=${this.convert}`;
        const response = await fetch(URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CMC_PRO_API_KEY': this.API_KEY
          }
        });

        if (!response.ok) throw new Error(`Échec de la récupération des données CoinMarketCap: ${response.statusText}`);
        const { data, status }: FetchResponse = await response.json();
        if (data.length === 0) break;

        allData.push(...data);
        start += data.length;
        if (status.total_count <= start) break;
      }
    } catch (error) {
      handleServiceError(error, 'fetchCmcData', 'Erreur lors de la récupération des données CMC');
      throw error;
    }

    return allData;
  }

  /**
   * Retrieves the latest CMC data from the database.
   */
  public static async fetchDatabaseCmc(): Promise<MappedCmc[]> {
    const collectionName = process.env.MONGODB_COLLECTION_CMC as string;
    try {
      const data = await getData(collectionName);
      console.log(`🚀 ~ fetchDatabaseCmc:`, { collectionName, count: data.length });
      return data as MappedCmc[];
    } catch (error) {
      handleServiceError(error, 'fetchDatabaseCmc', 'Erreur lors de la récupération des données CMC de la base de données');
      throw error;
    }
  }

  /**
   * Updates the CMC data in the database.
   */
  public static async updateDatabaseCmcData(data: MappedCmc[]): Promise<object> {
    const collectionName = process.env.MONGODB_COLLECTION_CMC as string, collectionType = process.env.TYPE_CMC as string;
    try {
      const deleteResult = await deleteAllDataMDB(collectionName);
      const saveResult = await saveData(collectionName, data);
      await LastUpdateService.saveLastUpdateToDatabase(collectionType, '');
      console.log('Données CMC mises à jour dans la base de données', { deleteResult, saveResult, totalCount: data.length });

      return { status: true, message: 'Données CMC mises à jour avec succès', data, deleteResult, saveResult, totalCount: data.length };
    } catch (error) {
      handleServiceError(error, 'updateDatabaseCmcData', 'Erreur lors de la mise à jour des données CMC dans la base de données');
      throw error;
    }
  }

  /**
   * Updates CMC data by fetching the latest info from the API and saving it to the database.
   */
  public static async updateCmcData(): Promise<object> {
    try {
      const data = await this.fetchCurrentCmc();
      console.log('Dernières données CMC récupérées', { count: data.length });
      return await this.updateDatabaseCmcData(data);
    } catch (error) {
      handleServiceError(error, 'updateCmcData', 'Erreur lors de la mise à jour des données CMC');
      throw error;
    }
  }
}