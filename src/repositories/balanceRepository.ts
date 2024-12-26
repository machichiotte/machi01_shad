// src/repositories/balanceRepository.ts
import { MappedBalance } from '@typ/balance';
import { config } from '@config/index';
import { PLATFORM } from '@typ/platform'
import { DatabaseService } from '@src/services/api/database/databaseService';

const COLLECTION_NAME = config.databaseConfig.collection.balance;
const COLLECTION_CATEGORY = config.databaseConfig.category.balance;

export class BalanceRepository {
    /**
     * Récupère toutes les données de solde de la base de données.
     */
    static async fetchAll(): Promise<MappedBalance[]> {
        return await DatabaseService.getData(COLLECTION_NAME) as MappedBalance[];
    }

    /**
     * Récupère les données de solde de la base de données pour une plateforme spécifique.
     */
    static async fetchByPlatform(platform: PLATFORM): Promise<MappedBalance[]> {
        const data = await this.fetchAll();
        return data.filter((item: MappedBalance) => item.platform === platform);
    }

    /**
     * Enregistre les données de solde dans la base de données pour une plateforme.
     */
    static async saveBalances(platform: PLATFORM, mappedData: Omit<MappedBalance, '_id'>[]): Promise<void> {
        await DatabaseService.saveDataAndTimestampToDatabase(mappedData, COLLECTION_NAME, COLLECTION_CATEGORY, platform);
    }
}
