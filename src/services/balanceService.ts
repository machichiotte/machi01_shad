// src/services/balanceService.ts

import { MongodbService } from '@services/mongodbService';
import { createPlatformInstance } from '@utils/platformUtil';
import { loadErrorPolicies, shouldRetry } from '@utils/errorUtil';
import { validateEnvVariables } from '@utils/controllerUtil';
import { DatabaseService } from '@services/databaseService';
import { MappingService } from '@services/mapping';
import { MappedBalance } from 'src/models/dbTypes';
import { handleServiceError } from '@utils/errorUtil';
import { ProcessorService } from '@services/processorService'

// Valide que les variables d'environnement nécessaires sont définies
validateEnvVariables(['MONGODB_COLLECTION_BALANCE', 'TYPE_BALANCE']);

const COLLECTION_NAME = process.env.MONGODB_COLLECTION_BALANCE as string;
const COLLECTION_TYPE = process.env.TYPE_BALANCE as string;

// Définition de la classe BalancesService
export class BalanceService {
  /**
   * Récupère toutes les données de solde de la base de données.
   */
  static async fetchDatabaseBalances(): Promise<MappedBalance[]> {
    return await MongodbService.getData(COLLECTION_NAME) as MappedBalance[];
  }

  /**
   * Récupère les données de solde de la base de données pour une plateforme spécifique.
   */
  static async fetchDatabaseBalancesByPlatform(platform: string, retries: number = 3): Promise<MappedBalance[]> {
    try {
      const data = await this.fetchDatabaseBalances();
      return data.filter((item: MappedBalance) => item.platform === platform);
    } catch (error) {
      if (
        retries > 0 &&
        shouldRetry(platform, error as Error, await loadErrorPolicies())
      ) {
        const delay = Math.pow(2, 3 - retries) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchDatabaseBalancesByPlatform(platform, retries - 1);
      }

      handleServiceError(error, 'fetchDatabaseBalancesByPlatform', `Erreur lors de la récupération des données de solde de la base de données sur ${platform}`);
      throw error;
    }
  }

  /**
   * Récupère les données de solde actuelles d'une plateforme spécifique.
   */
  static async fetchCurrentBalancesByPlatform(platform: string, retries: number = 3): Promise<MappedBalance[]> {
    const errorPolicies = await loadErrorPolicies();
    try {
      const platformInstance = createPlatformInstance(platform);
      const data = await platformInstance.fetchBalance();
      return MappingService.mapBalance(platform, data);
    } catch (error) {
      if (retries > 0 && shouldRetry(platform, error as Error, errorPolicies)) {
        const delay = Math.pow(2, 3 - retries) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchCurrentBalancesByPlatform(platform, retries - 1);
      }
      handleServiceError(error, 'fetchCurrentBalancesByPlatform', `Erreur lors de la récupération des données de solde actuelles de ${platform}`);
      throw error;
    }
  }

  /**
   * Enregistre les données de solde fournies dans la base de données.
   */
  static async saveDatabaseBalance(mappedData: MappedBalance[], platform: string): Promise<void> {
    if (COLLECTION_NAME && COLLECTION_TYPE) {
      await DatabaseService.saveDataToDatabase(mappedData, COLLECTION_NAME, platform, COLLECTION_TYPE);
    } else {
      throw new Error('Required environment variables are not set');
    }
  }

  /**
   * Met à jour le solde pour une plateforme spécifique en récupérant les données actuelles et en les enregistrant dans la base de données.
   */
  static async updateBalanceForPlatform(platform: string): Promise<MappedBalance[]> {
    const data = await this.fetchCurrentBalancesByPlatform(platform);
    await this.saveDatabaseBalance(data, platform);
    return data;
  }

  /**
 * Updates the balances for a specified platform, compares with previous balances,
 * and processes any changes. Also calculates and saves metrics.
 */
  static async updateBalancesForPlatform(platform: string): Promise<void> {
    try {
      const [currentBalances, previousBalances] = await Promise.all([
        BalanceService.fetchCurrentBalancesByPlatform(platform, 3),
        BalanceService.fetchDatabaseBalancesByPlatform(platform, 3)
      ])

      const differences = ProcessorService.compareBalances(previousBalances, currentBalances)
      if (differences.length > 0) {
        console.log(
          `Différences de solde détectées pour ${platform}:`,
          differences
        )
        await Promise.all([
          BalanceService.saveDatabaseBalance(currentBalances, platform),
          ProcessorService.processBalanceChanges(differences, platform)
        ])
      }
    } catch (error) {
      handleServiceError(error, 'updateBalancesForPlatform', `Erreur lors de la mise à jour des balances pour ${platform}`)
    }
  }
}