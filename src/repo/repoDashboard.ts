// src/repo/repoDashboard.ts
import { ServiceDatabase } from '@services/api/database/serviceDatabase';
import { config } from '@config/index';
import { Asset } from '@typ/cryptoAnalytics';

const COLLECTION_NAME = config.databaseConfig.collection.dashboard;

export class RepoDashboard {
    /**
     * Fetches the most recent Dashboard data from the database.
     */
    static async fetchAll(): Promise<Asset[]> {
        return await ServiceDatabase.getCollectionDocuments(COLLECTION_NAME) as Asset[];
    }
}
