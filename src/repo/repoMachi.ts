// src/repo/repoMachi.ts
import { ServiceDatabase } from '@services/api/database/serviceDatabase';
import { config } from '@config/index';
import { Asset } from '@src/types/cryptoAnalytics';

const COLLECTION_NAME = config.databaseConfig.collection.machi;

export class RepoMachi {
    /**
     * Fetches the most recent SHAD data from the database.
     */
    static async fetchAll(): Promise<Asset[]> {
        return await ServiceDatabase.getData(COLLECTION_NAME) as Asset[];
    }
}
