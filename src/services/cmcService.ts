import { LastUpdateService } from '@services/lastUpdateService';
import { MongodbService } from '@services/mongodbService';
import { MappedCmc } from 'src/models/dbTypes';
import { handleServiceError } from '@utils/errorUtil';
import config from '@config/index';


const COLLECTION_NAME = config.collection?.cmc;
const COLLECTION_TYPE = config.collectionType?.cmc;

interface FetchResponse {
  data: MappedCmc[];
  status: { total_count: number };
}

export class CmcService {
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
            'X-CMC_PRO_API_KEY': config?.apiKeys?.cmc?.apiKey || ''
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
    return await MongodbService.getData(COLLECTION_NAME) as MappedCmc[];
  }


  /**
   * Updates the CMC data in the database.
   */
  public static async updateDatabaseCmcData(data: MappedCmc[]): Promise<object> {
    try {
      const deleteResult = await MongodbService.deleteAllDataMDB(COLLECTION_NAME);
      const saveResult = await MongodbService.saveData(COLLECTION_NAME, data);
      await LastUpdateService.saveLastUpdateToDatabase(COLLECTION_TYPE, '');
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