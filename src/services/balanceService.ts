// src/services/balanceService.ts
import { BalanceRepository } from '@repositories/balanceRepository';
import { CcxtService } from '@services/ccxtService';
import { handleServiceError } from '@utils/errorUtil';
import { MappingService } from '@services/mappingService';
import { ProcessorService } from '@services/processorService';
import { MappedBalance, BalanceWithDifference } from '@typ/balance';
import { retry } from '@utils/retryUtil';
import { PLATFORM } from '@typ/platform';
import { executeForPlatforms } from '@utils/cronUtil';
import { removeDuplicateDifferences, removeDuplicatesAndStablecoins } from '@utils/processorUtil';

export class BalanceService {
  static async fetchDatabaseBalance(): Promise<MappedBalance[]> {
    return await BalanceRepository.fetchAll()
  }
  /**
   * Récupère les données de solde de la base de données pour une plateforme spécifique avec tentatives.
   */
  static async fetchDatabaseBalancesByPlatform(platform: PLATFORM, retries: number = 3): Promise<MappedBalance[]> {

    try {
      return await retry(() => BalanceRepository.fetchByPlatform(platform), [], 'fetchDatabaseBalancesByPlatform', retries);
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
        const data = await CcxtService.fetchRawBalance(platform);
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
        //rajouter timestamp
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
        const uniqueDifferences = removeDuplicateDifferences(differences)

        if (uniqueDifferences.length > 0) {
          await Promise.all([
            BalanceRepository.saveBalances(platform, currentBalances),
            ProcessorService.processBalanceChanges(platform, uniqueDifferences)
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

  /**
  * Compares current balances with those from the previous database.
  */
  private static compareBalances(lastBalances: MappedBalance[], currentBalances: MappedBalance[]): BalanceWithDifference[] {
    const differences: BalanceWithDifference[] = []

    // Vérification des balances actuelles par rapport aux balances précédentes
    currentBalances.forEach((currentBalance) => {
      const { platform, base, balance: currentBalanceValue } = currentBalance

      const matchedBalance = lastBalances.find(
        (item) => item.platform === platform && item.base === base
      )

      if (!matchedBalance) {
        // Nouveau symbole trouvé
        differences.push({
          base,
          platform,
          newSymbol: true
        })
      } else if (matchedBalance.balance !== currentBalanceValue) {
        // Différence de balance trouvée
        differences.push({
          base,
          platform,
          balanceDifference: true
        })
      }
    })

    // Vérification des balances précédentes pour détecter celles qui ne sont plus présentes
    lastBalances.forEach((lastBalance) => {
      const { platform, base, balance: lastBalanceValue } = lastBalance

      const matchedBalance = currentBalances.find(
        (item) => item.platform === platform && item.base === base
      )

      if (!matchedBalance) {
        if (lastBalanceValue !== 0) {
          // Ancien symbole trouvé
          differences.push({
            base,
            platform,
            zeroBalance: true
          })
        }
      } else if (matchedBalance.balance !== lastBalanceValue) {
        // Différence de balance trouvée
        differences.push({
          base,
          platform,
          balanceDifference: true
        })
      }
    })

    return removeDuplicatesAndStablecoins(differences)
  }
}
