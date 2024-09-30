// src/repositories/tickerRepository.ts
import { MongodbService } from '@services/mongodbService'
import { MappedTicker } from '@typ/ticker'
import { config } from '@config/index'
import { PLATFORM } from '@src/types/platform';

const COLLECTION_NAME = config.collection.ticker
const COLLECTION_CATEGORY = config.collectionCategory.ticker

export class TickerRepository {
    static async fetchAll(): Promise<MappedTicker[]> {
        return await MongodbService.getData(COLLECTION_NAME) as MappedTicker[]
    }

    static async deleteAndSaveAll(tickersData: Omit<MappedTicker, '_id'>[]): Promise<void> {
        await MongodbService.deleteAndProcessData(COLLECTION_NAME, tickersData)
    }

    static async saveTickers(platform: PLATFORM, mappedData: Omit<MappedTicker, '_id'>[]): Promise<void> {
        await MongodbService.saveDataToDatabase(mappedData, COLLECTION_NAME, COLLECTION_CATEGORY, platform)
    }
}