// src/repositories/balanceRepository.ts
import { MongodbService } from '@services/mongodbService';
import { MappedBalance } from '@typ/balance';
import { config } from '@config/index';
import { PLATFORM } from '@typ/platform'

const COLLECTION_NAME = config.collection.balance;
const COLLECTION_CATEGORY = config.collectionCategory.balance;

export class BalanceRepository {
    /**
     * Récupère toutes les données de solde de la base de données.
     */
    static async fetchAll(): Promise<MappedBalance[]> {
        return await MongodbService.getData(COLLECTION_NAME) as MappedBalance[];
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
        await MongodbService.saveDataAndTimestampToDatabase(mappedData, COLLECTION_NAME, COLLECTION_CATEGORY, platform);
    }
}
