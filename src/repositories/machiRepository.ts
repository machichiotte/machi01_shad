// src/repositories/machiRepository.ts
import { DatabaseService } from '@src/services/api/database/databaseService';
import { config } from '@config/index';
import { Asset } from '@typ/metrics';

const COLLECTION_NAME = config.databaseConfig.collection.machi;

export class MachiRepository {
    /**
     * Fetches the most recent SHAD data from the database.
     */
    static async fetchAll(): Promise<Asset[]> {
        return await DatabaseService.getData(COLLECTION_NAME) as Asset[];
    }
}
