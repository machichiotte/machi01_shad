// src/services/serviceBalance.ts
import { RepoBalance } from '@repo/repoBalance';
import { ServiceCcxt } from '@services/api/platform/serviceCcxt';
import { MappingPlatform } from '@services/api/platform/mappingPlatform';
import { ServiceProcessor } from '@services/serviceProcessor';
import { MappedBalance, BalanceWithDifference } from '@typ/balance';
import { PLATFORM } from '@typ/platform';
import { retry } from '@utils/retryUtil';
import { handleServiceError } from '@utils/errorUtil';
import { executeCronTask } from '@utils/cronUtil';
import { removeDuplicateDifferences, removeDuplicates } from '@utils/processorUtil';

export class ServiceBalance {
  static async fetchDatabaseBalance(): Promise<MappedBalance[]> {
    return await RepoBalance.fetchAll()
  }
  /**
   * Récupère les données de solde de la base de données pour une plateforme spécifique avec tentatives.
   */
  static async fetchDatabaseBalancesByPlatform(platform: PLATFORM, retries: number = 3): Promise<MappedBalance[]> {

    try {
      return await retry(() => RepoBalance.fetchByPlatform(platform), [], 'fetchDatabaseBalancesByPlatform', retries);
    } catch (error) {
      handleServiceError(error, 'fetchDatabaseBalancesByPlatform', `Erreur lors de la récupération des données de solde pour la plateforme ${platform}`);
      throw error;
    }
  }

  /**
   * Récupère les balances actuelles d'une plateforme via API, avec tentatives.
   */
  static async fetchCurrentBalancesByPlatform(platform: PLATFORM, retries: number = 3): Promise<MappedBalance[]> {
    try {
      return await retry(async () => {
        const data = await ServiceCcxt.fetchRawBalance(platform);
        return MappingPlatform.mapBalance(platform, data);
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
        await RepoBalance.saveBalances(platform, currentBalances);
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
    
    console.log(`Mise à jour des balances pour la plateforme ${platform}`)
    try {
      return await retry(async () => {
        const [currentBalances, previousBalances] = await Promise.all([
          ServiceBalance.fetchCurrentBalancesByPlatform(platform),
          ServiceBalance.fetchDatabaseBalancesByPlatform(platform)
        ]);

        const differences = ServiceBalance.compareBalances(previousBalances, currentBalances);
        
        console.log(`Mise à jour des balances pour la plateforme ${platform} : ${differences.length} nouvelles differences`)
        const uniqueDifferences = removeDuplicateDifferences(differences)

        console.log(`Mise à jour des balances pour la plateforme ${platform} : ${uniqueDifferences.length} nouvelles differences`)
        if (uniqueDifferences.length > 0) {
          await Promise.all([
            RepoBalance.saveBalances(platform, currentBalances),
            ServiceProcessor.processBalanceChanges(platform, uniqueDifferences)
          ]);
        }
      }, [], 'updateBalancesForPlatform', 3)
    } catch (error) {
      handleServiceError(error, 'updateBalancesForPlatform', `Erreur lors de la mise à jour des balances pour ${platform}`);
      throw error;
    }
  }

  static async cronBalance(platform: PLATFORM): Promise<void> {
    await executeCronTask(() => ServiceBalance.updateBalancesForPlatform(platform), true)

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

    return removeDuplicates(differences)
  }
}
