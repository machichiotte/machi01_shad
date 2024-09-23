// src/repositories/balanceRepository.ts
import { MongodbService } from '@services/mongodbService';
import { MappedBalance } from '@typ/database';
import config from '@config/index';

const COLLECTION_NAME = config.collection.balance;
const COLLECTION_TYPE = config.collectionType.balance;

export class BalanceRepository {
    /**
     * Récupère toutes les données de solde de la base de données.
     */
    static async fetchAllBalances(): Promise<MappedBalance[]> {
        return await MongodbService.getData(COLLECTION_NAME) as MappedBalance[];
    }

    /**
     * Récupère les données de solde de la base de données pour une plateforme spécifique.
     */
    static async fetchBalancesByPlatform(platform: string): Promise<MappedBalance[]> {
        const data = await this.fetchAllBalances();
        return data.filter((item: MappedBalance) => item.platform === platform);
    }

    /**
     * Enregistre les données de solde dans la base de données pour une plateforme.
     */
    static async saveBalances(mappedData: MappedBalance[], platform: string): Promise<void> {
        await MongodbService.saveDataToDatabase(mappedData, COLLECTION_NAME, platform, COLLECTION_TYPE);
    }
}
