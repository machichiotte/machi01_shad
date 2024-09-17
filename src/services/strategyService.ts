// src/services/strategyService.ts
import { getData } from '@utils/dataUtil'
import { LastUpdateService } from './lastUpdateService'
import { updateDataMDB, deleteAllDataMDB, saveData } from './mongodbService'
import { MappedStrategy } from 'src/models/dbTypes'
import { InsertManyResult, InsertOneResult } from 'mongodb'

export class StrategyService {
  /**
   * Récupère les stratégies de la base de données.
   */
  static async fetchDatabaseStrategies(): Promise<MappedStrategy[]> {
    return await getData(process.env.MONGODB_COLLECTION_STRAT as string) as MappedStrategy[];
  }

  /**
   * Met à jour une stratégie par son ID.
   */
  static async updateStrategyById(strategyId: string | undefined, updatedStrategy: Partial<MappedStrategy>): Promise<boolean> {
    if (!strategyId) {
      throw new Error('L\'ID de la stratégie est requis');
    }
    try {
      return await updateDataMDB(
        process.env.MONGODB_COLLECTION_STRAT as string,
        { _id: strategyId },
        { $set: updatedStrategy }
      );
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la stratégie avec l'ID ${strategyId}:`, error);
      throw error;
    }
  }

  /**
   * Met à jour toutes les stratégies dans la base de données.
   */
  static async updateStrategies(strategies: MappedStrategy[]): Promise<InsertOneResult<Document> | InsertManyResult<Document>> {
    const collectionName = process.env.MONGODB_COLLECTION_STRAT as string;
    await deleteAllDataMDB(collectionName);
    const data = await saveData(collectionName, strategies);
    await LastUpdateService.saveLastUpdateToDatabase(process.env.TYPE_STRATEGY as string, '');
    return data;
  }
}