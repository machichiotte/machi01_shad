// src/services/strategyService.ts
import { LastUpdateService } from '@services/lastUpdateService'
import { MongodbService } from '@services/mongodbService'
import { MappedStrategy } from '@models/dbTypes'
import { InsertManyResult, InsertOneResult } from 'mongodb'
import { handleServiceError } from '@utils/errorUtil'
import config from '@config/index'

const COLLECTION_NAME = config?.collection?.strat
const COLLECTION_TYPE = config?.collectionType?.strat

export class StrategyService {
  /**
   * Récupère les stratégies de la base de données.
   */
  static async fetchDatabaseStrategies(): Promise<MappedStrategy[]> {
    return await MongodbService.getData(COLLECTION_NAME) as MappedStrategy[];
  }

  /**
   * Met à jour une stratégie par son ID.
   */
  static async updateStrategyById(strategyId: string | undefined, updatedStrategy: Partial<MappedStrategy>): Promise<boolean> {
    if (!strategyId) {
      throw new Error('L\'ID de la stratégie est requis');
    }
    try {
      return await MongodbService.updateDataMDB(
        COLLECTION_NAME,
        { _id: strategyId },
        { $set: updatedStrategy }
      );
    } catch (error) {
      handleServiceError(error, 'updateStrategyById', `Error updating strategy with id ${strategyId}`)
      throw error;
    }
  }

  /**
   * Met à jour toutes les stratégies dans la base de données.
   */
  static async updateStrategies(strategies: MappedStrategy[]): Promise<InsertOneResult<Document> | InsertManyResult<Document>> {
    const collectionName = COLLECTION_NAME;
    await MongodbService.deleteAllDataMDB(collectionName);
    const data = await MongodbService.saveData(collectionName, strategies);
    await LastUpdateService.saveLastUpdateToDatabase(COLLECTION_TYPE, '');
    return data;
  }
}