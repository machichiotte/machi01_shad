// src/services/balanceService.ts
import { BalanceRepository } from '@repositories/balanceRepository';
import { PlatformService } from '@services/platformService';
import { handleServiceError } from '@utils/errorUtil';
import { MappingService } from '@services/mappingService';
import { ProcessorService } from '@services/processorService';
import { MappedBalance } from '@typ/balance';
import { retry } from '@utils/retryUtil';
import { PLATFORM } from '@src/types/platform';
import { executeForPlatforms } from '@utils/taskExecutor';

export class BalanceService {
  static async fetchDatabaseBalance(): Promise<MappedBalance[]> {
    return await BalanceRepository.fetchAllBalances()
  }
  /**
   * Récupère les données de solde de la base de données pour une plateforme spécifique avec tentatives.
   */
  static async fetchDatabaseBalancesByPlatform(platform: PLATFORM, retries: number = 3): Promise<MappedBalance[]> {

    try {
      return await retry(() => BalanceRepository.fetchBalancesByPlatform(platform), [], 'fetchDatabaseBalancesByPlatform', retries);
    } catch (error) {
      handleServiceError(error, 'fetchDatabaseBalancesByPlatform', `Erreur lors de la récupération des données de solde pour la plateforme ${platform}`);
      throw error;
    }
  }

  /**
   * Récupère les balances actuelles d'une plateforme via API, avec tentatives.
   */
  static async fetchCurrentBalancesByPlatform(platform: PLATFORM, retries: number = 3): Promise<Omit<MappedBalance, '_id'>[]> {
    try {
      return await retry(async () => {
        const data = await PlatformService.fetchRawBalance(platform);
        return MappingService.mapBalance(platform, data);
      }, [], 'fetchCurrentBalancesByPlatform', retries);
    } catch (error) {
      handleServiceError(error, 'fetchCurrentBalancesByPlatform', `Erreur lors de la récupération des balances actuelles pour ${platform}`);
      throw error;
    }
  }

  /**
   * Met à jour les balances d'une plateforme en récupérant les données actuelles et en les sauvegardant dans la base de données.
   */
  static async updateBalanceForPlatform(platform: PLATFORM): Promise<Omit<MappedBalance, '_id'>[]> {
    try {
      return await retry(async () => {
        const currentBalances = await this.fetchCurrentBalancesByPlatform(platform);
        await BalanceRepository.saveBalances(platform, currentBalances);
        return currentBalances;
      }, [], 'updateBalanceForPlatform', 3)
    } catch (error) {
      handleServiceError(error, 'updateBalanceForPlatform', `Erreur lors de la mise à jour des balances pour la plateforme ${platform}`);
      throw error;
    }
  }

  /**
   * Compare les balances actuelles et celles de la base de données, puis traite les différences.
   */
  static async updateBalancesForPlatform(platform: PLATFORM): Promise<void> {
    try {
      return await retry(async () => {
        const [currentBalances, previousBalances] = await Promise.all([
          BalanceService.fetchCurrentBalancesByPlatform(platform),
          BalanceService.fetchDatabaseBalancesByPlatform(platform)
        ]);

        const differences = ProcessorService.compareBalances(previousBalances, currentBalances);

        if (differences.length > 0) {
          console.log(`Différences de solde détectées pour ${platform}:`, differences);
          await Promise.all([
            BalanceRepository.saveBalances(platform, currentBalances),
            ProcessorService.processBalanceChanges(platform, differences)
          ]);
        }
      }, [], 'updateBalancesForPlatform', 3)
    } catch (error) {
      handleServiceError(error, 'updateBalancesForPlatform', `Erreur lors de la mise à jour des balances pour ${platform}`);
      throw error;
    }
  }

  static async cronBalance(): Promise<void> {
    await executeForPlatforms('updateBalances', BalanceService.updateBalancesForPlatform)
  }
}
