// src/services/strategyService.ts
import { LastUpdateService } from '@services/lastUpdateService'
import { MongodbService } from '@services/mongodbService'
import { MappedStrategy } from '@models/dbTypes'
import { InsertManyResult, InsertOneResult } from 'mongodb'
import { handleServiceError } from '@utils/errorUtil'

export class StrategyService {
  /**
   * Récupère les stratégies de la base de données.
   */
  static async fetchDatabaseStrategies(): Promise<MappedStrategy[]> {
    return await MongodbService.getData(process.env.MONGODB_COLLECTION_STRAT as string) as MappedStrategy[];
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
        process.env.MONGODB_COLLECTION_STRAT as string,
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
    const collectionName = process.env.MONGODB_COLLECTION_STRAT as string;
    await MongodbService.deleteAllDataMDB(collectionName);
    const data = await MongodbService.saveData(collectionName, strategies);
    await LastUpdateService.saveLastUpdateToDatabase(process.env.TYPE_STRATEGY as string, '');
    return data;
  }
}