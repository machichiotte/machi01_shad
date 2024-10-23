// src/repositories/shadRepository.ts
import { DatabaseService } from '@services/databaseService';
import { ShadData } from '@typ/database';
import { config } from '@config/index';

const COLLECTION_NAME = config.collection.shad;

export class ShadRepository {
    /**
     * Fetches the most recent SHAD data from the database.
     */
    static async fetchAll(): Promise<ShadData[]> {
        return await DatabaseService.getData(COLLECTION_NAME) as ShadData[];
    }
}
