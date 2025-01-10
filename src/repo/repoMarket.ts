// src/repo/repoMarket.ts
import { ServiceDatabase } from '@services/api/database/serviceDatabase';
import { MappedMarket } from '@typ/market';
import { config } from '@config/index';
import { PLATFORM } from '@typ/platform';

const COLLECTION_NAME = config.databaseConfig.collection.market;
const COLLECTION_CATEGORY = config.databaseConfig.category.market;

export class RepoMarket {

    static async fetchAll(): Promise<MappedMarket[]> {
        return await ServiceDatabase.getData(COLLECTION_NAME) as MappedMarket[];
    }

    static async save(mappedData: Omit<MappedMarket, '_id'>[], platform: PLATFORM): Promise<void> {
        await ServiceDatabase.saveDataAndTimestampToDatabase(mappedData, COLLECTION_NAME, COLLECTION_CATEGORY, platform);
    }
}