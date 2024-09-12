// src/services/strategyService.ts
import { getData } from '@utils/dataUtil'
import { saveLastUpdateToDatabase } from './lastUpdateService'
import { updateDataMDB, deleteAllDataMDB, saveData } from './mongodbService'
import { MappedStrategy } from './mapping'
import { UpdateDataMDBParams } from './mongodbService'

export class StrategyService {
  private collectionName: string;
  private collectionType: string;

  constructor() {
    this.collectionName = process.env.MONGODB_COLLECTION_STRAT as string;
    this.collectionType = process.env.TYPE_STRATEGY as string;
  }

  /**
   * Récupère les stratégies de la base de données.
   * @returns {Promise<MappedStrategy[]>} Une promesse qui se résout en un tableau de stratégies.
   */
  async fetchDatabaseStrategies(): Promise<MappedStrategy[]> {
    return await getData(this.collectionName) as MappedStrategy[];
  }

  /**
   * Met à jour une stratégie par son ID.
   * @param {string} strategyId - L'ID de la stratégie à mettre à jour.
   * @param {Partial<MappedStrategy>} updatedStrategy - Les données mises à jour de la stratégie.
   * @returns {Promise<UpdateDataMDBParams>} Une promesse qui se résout avec le résultat de la mise à jour.
   * @throws {Error} Si la mise à jour échoue.
   */
  async updateStrategyById(strategyId: string | undefined, updatedStrategy: Partial<MappedStrategy>): Promise<UpdateDataMDBParams> {
    if (!strategyId) {
      throw new Error('L\'ID de la stratégie est requis');
    }
    try {
      return await updateDataMDB(
        this.collectionName,
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
   * @param {MappedStrategy[]} strategies - Le tableau de stratégies à mettre à jour.
   * @returns {Promise<InsertOneResult<Document> | InsertManyResult<Document>>} Une promesse qui se résout avec le résultat de la sauvegarde.
   */
  async updateStrategies(strategies: MappedStrategy[]): Promise<InsertOneResult<Document> | InsertManyResult<Document>> {
    await deleteAllDataMDB(this.collectionName);
    const data = await saveData(this.collectionName, strategies);
    await saveLastUpdateToDatabase(this.collectionType, '');
    return data;
  }
}