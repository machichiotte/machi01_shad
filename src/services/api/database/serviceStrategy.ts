// src/services/serviceStrategy.ts
import { MappedStrat } from '@typ/strat';
import { handleServiceError } from '@utils/errorUtil';
import { RepoStrategy } from '@repo/repoStrategy';

export class ServiceStrategy {
  
  static async fetchDatabaseStrategies(): Promise<MappedStrat[]> {
    try {
      return await RepoStrategy.fetchAll();
    } catch (error) {
      handleServiceError(error, 'fetchDatabaseStrategies', 'Error fetching strategies');
      throw error;
    }
  }

  static async updateStrategyById(updatedStrategy: MappedStrat): Promise<boolean> {
    if (!updatedStrategy._id) {
      throw new Error(`L'ID de la stratégie est requis`);
    }

    try {
      return await RepoStrategy.updateById(updatedStrategy);
    } catch (error) {
      handleServiceError(error, 'updateStrategyById', `Error updating strategy with id ${updatedStrategy._id}`);
      throw error;
    }
  }

  static async updateStrategies(strategies: MappedStrat[]): Promise<void> {
    try {
      await RepoStrategy.deleteAll();
      await RepoStrategy.saveStrategies(strategies);
    } catch (error) {
      handleServiceError(error, 'updateStrategies', 'Error updating strategies');
      throw error;
    }
  }
}