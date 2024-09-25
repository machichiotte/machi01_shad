// src/services/strategyService.ts
import { TimestampService } from '@services/timestampService'
import { MongodbService } from '@services/mongodbService'
import { MappedStrat } from '@typ/strat'
import { InsertManyResult, InsertOneResult } from 'mongodb'
import { handleServiceError } from '@utils/errorUtil'
import { config } from '@config/index';

const COLLECTION_NAME = config.collection.strat
const COLLECTION_TYPE = config.collectionType.strat

export class StrategyService {
  /**
   * Récupère les stratégies de la base de données.
   */
  static async fetchDatabaseStrategies(): Promise<MappedStrat[]> {
    return await MongodbService.getData(COLLECTION_NAME) as MappedStrat[];
  }

  /**
   * Met à jour une stratégie par son ID.
   */
  static async updateStrategyById(strategyId: string | undefined, updatedStrategy: Partial<MappedStrat>): Promise<boolean> {
    if (!strategyId) {
      throw new Error('L\'ID de la stratégie est requis');
    }
    try {
      return await MongodbService.updateOneData(
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
  static async updateStrategies(strategies: MappedStrat[]): Promise<InsertOneResult<Document> | InsertManyResult<Document>> {
    await MongodbService.deleteAllData(COLLECTION_NAME);
    const data = await MongodbService.insertData(COLLECTION_NAME, strategies);
    await TimestampService.saveTimestampToDatabase(COLLECTION_TYPE, '');
    return data;
  }
}