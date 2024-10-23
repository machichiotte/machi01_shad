// src/repositories/marketRepository.ts
import { DatabaseService } from '@services/databaseService';
import { MappedMarket } from '@typ/market';
import { config } from '@config/index';
import { PLATFORM } from '@src/types/platform';

const COLLECTION_NAME = config.collection.market;
const COLLECTION_CATEGORY = config.collectionCategory.market;

export class MarketRepository {

    static async fetchAll(): Promise<MappedMarket[]> {
        return await DatabaseService.getData(COLLECTION_NAME) as MappedMarket[];
    }

    static async save(mappedData: Omit<MappedMarket, '_id'>[], platform: PLATFORM): Promise<void> {
        await DatabaseService.saveDataAndTimestampToDatabase(mappedData, COLLECTION_NAME, COLLECTION_CATEGORY, platform);
    }
}