// src/repositories/tickerRepository
import { MongodbService } from '@services/mongodbService'
import { MappedTicker } from '@typ/ticker'
import { config } from '@config/index'
import { PLATFORM } from '@src/types/platform';

const COLLECTION_NAME = config.collection.ticker
const COLLECTION_TYPE = config.collectionType.ticker

export class TickerRepository {
    static async fetchAll(): Promise<MappedTicker[]> {
        return await MongodbService.getData(COLLECTION_NAME) as MappedTicker[]
    }

    static async deleteAndSaveAll(tickersData: MappedTicker[]): Promise<void> {
        await MongodbService.deleteAndProcessData(COLLECTION_NAME, tickersData, '', true)
    }

    static async saveForPlatform(mappedData: MappedTicker[], platform: PLATFORM): Promise<void> {
        await MongodbService.saveDataToDatabase(
            mappedData,
            COLLECTION_NAME,
            platform,
            COLLECTION_TYPE
        )
    }
}