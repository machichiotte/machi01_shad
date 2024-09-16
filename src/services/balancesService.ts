// src/services/BalancesService.ts

import { getData } from '@utils/dataUtil';
import { createPlatformInstance } from '@utils/platformUtil';
import { loadErrorPolicies, shouldRetry } from '@utils/errorUtil';
import { validateEnvVariables } from '@utils/controllerUtil';
import { DatabaseService } from './databaseService';
import { mapBalance } from './mapping';
import { MappedBalance } from 'src/models/dbTypes';

// Valide que les variables d'environnement nécessaires sont définies
validateEnvVariables(['MONGODB_COLLECTION_BALANCE', 'TYPE_BALANCE']);

// Définition de la classe BalancesService
export class BalancesService {
  /**
   * Récupère toutes les données de solde de la base de données.
   * @returns {Promise<MappedBalance[]>} Une promesse qui se résout à un tableau de données de solde.
   */
  static async fetchDatabaseBalances(): Promise<MappedBalance[]> {
    const collectionName = process.env.MONGODB_COLLECTION_BALANCE as string;
    return await getData(collectionName) as MappedBalance[];
  }

  /**
   * Récupère les données de solde de la base de données pour une plateforme spécifique.
   * @param {string} platform - L'identifiant de la plateforme.
   * @param {number} [retries=3] - Le nombre de tentatives de réessai.
   * @returns {Promise<MappedBalance[]>} Une promesse qui se résout à un tableau de données de solde pour la plateforme spécifiée.
   * @throws {Error} Si la récupération échoue après toutes les tentatives.
   */
  static async fetchDatabaseBalancesByPlatform(
    platform: string,
    retries: number = 3
  ): Promise<MappedBalance[]> {
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
      console.error('Failed to fetch current balance from platform', {
        platform,
        error: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Récupère les données de solde actuelles d'une plateforme spécifique.
   * @param {string} platform - L'identifiant de la plateforme.
   * @param {number} [retries=3] - Le nombre de tentatives de réessai.
   * @returns {Promise<MappedBalance[]>} Une promesse qui se résout à un tableau de données de solde actuelles pour la plateforme spécifiée.
   * @throws {Error} Si la récupération échoue après toutes les tentatives.
   */
  static async fetchCurrentBalancesByPlatform(
    platform: string,
    retries: number = 3
  ): Promise<MappedBalance[]> {
    const errorPolicies = await loadErrorPolicies();
    try {
      const platformInstance = createPlatformInstance(platform);
      const data = await platformInstance.fetchBalance();
      return mapBalance(platform, data);
    } catch (error) {
      if (retries > 0 && shouldRetry(platform, error as Error, errorPolicies)) {
        const delay = Math.pow(2, 3 - retries) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchCurrentBalancesByPlatform(platform, retries - 1);
      }
      console.error('Failed to fetch current balance from platform', {
        platform,
        error: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Enregistre les données de solde fournies dans la base de données.
   * @param {MappedBalance[]} mappedData - Les données de solde à enregistrer.
   * @param {string} platform - L'identifiant de la plateforme.
   * @returns {Promise<void>}
   */
  static async saveDatabaseBalance(
    mappedData: MappedBalance[],
    platform: string
  ): Promise<void> {
    const collection = process.env.MONGODB_COLLECTION_BALANCE;
    const updateType = process.env.TYPE_BALANCE;

    if (collection && updateType) {
      await DatabaseService.saveDataToDatabase(mappedData, collection, platform, updateType);
    } else {
      throw new Error('Required environment variables are not set');
    }
  }

  /**
   * Met à jour le solde pour une plateforme spécifique en récupérant les données actuelles et en les enregistrant dans la base de données.
   * @param {string} platform - L'identifiant de la plateforme.
   * @returns {Promise<MappedBalance[]>} Une promesse qui se résout aux données de solde mises à jour.
   */
  static async updateBalanceForPlatform(
    platform: string
  ): Promise<MappedBalance[]> {
    const data = await this.fetchCurrentBalancesByPlatform(platform);
    await this.saveDatabaseBalance(data, platform);
    return data;
  }
}