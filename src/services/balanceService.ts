// src/services/balanceService.ts
import { BalanceRepository } from '@repositories/balanceRepository';
import { createPlatformInstance } from '@utils/platformUtil';
import { handleServiceError } from '@utils/errorUtil';
import { MappingService } from '@services/mappingService';
import { ProcessorService } from '@services/processorService';
import { MappedBalance } from '@typ/database';
import { retry } from '@utils/retryUtil';

export class BalanceService {
  static async fetchDatabaseBalance(): Promise<MappedBalance[]> {
    return await BalanceRepository.fetchAllBalances()
  }
  /**
   * Récupère les données de solde de la base de données pour une plateforme spécifique avec tentatives.
   */
  static async fetchDatabaseBalancesByPlatform(platform: string, retries: number = 3): Promise<MappedBalance[]> {
    try {
      return await retry(() => BalanceRepository.fetchBalancesByPlatform(platform), [], retries);
    } catch (error) {
      handleServiceError(error, 'fetchDatabaseBalancesByPlatform', `Erreur lors de la récupération des données de solde pour la plateforme ${platform}`);
      throw error;
    }
  }

  /**
   * Récupère les balances actuelles d'une plateforme via API, avec tentatives.
   */
  static async fetchCurrentBalancesByPlatform(platform: string, retries: number = 3): Promise<MappedBalance[]> {
    try {
      return await retry(async () => {
        const platformInstance = createPlatformInstance(platform);
        const data = await platformInstance.fetchBalance();
        return MappingService.mapBalance(platform, data);
      }, [], retries);
    } catch (error) {
      handleServiceError(error, 'fetchCurrentBalancesByPlatform', `Erreur lors de la récupération des balances actuelles pour ${platform}`);
      throw error;
    }
  }

  /**
   * Met à jour les balances d'une plateforme en récupérant les données actuelles et en les sauvegardant dans la base de données.
   */
  static async updateBalanceForPlatform(platform: string): Promise<MappedBalance[]> {
    try {
      const currentBalances = await this.fetchCurrentBalancesByPlatform(platform);
      await BalanceRepository.saveBalances(currentBalances, platform);
      return currentBalances;
    } catch (error) {
      handleServiceError(error, 'updateBalanceForPlatform', `Erreur lors de la mise à jour des balances pour la plateforme ${platform}`);
      throw error;
    }
  }

  /**
   * Compare les balances actuelles et celles de la base de données, puis traite les différences.
   */
  static async updateBalancesForPlatform(platform: string): Promise<void> {
    try {
      const [currentBalances, previousBalances] = await Promise.all([
        this.fetchCurrentBalancesByPlatform(platform),
        this.fetchDatabaseBalancesByPlatform(platform)
      ]);

      const differences = ProcessorService.compareBalances(previousBalances, currentBalances);

      if (differences.length > 0) {
        console.log(`Différences de solde détectées pour ${platform}:`, differences);
        await Promise.all([
          BalanceRepository.saveBalances(currentBalances, platform),
          ProcessorService.processBalanceChanges(differences, platform)
        ]);
      }
    } catch (error) {
      handleServiceError(error, 'updateBalancesForPlatform', `Erreur lors de la mise à jour des balances pour ${platform}`);
      throw error;
    }
  }
}
