// src/repo/repoTicker.ts
import { ServiceDatabase } from '@services/api/database/serviceDatabase'
import { MappedTicker } from '@typ/ticker'
import { config } from '@config/index'
import { PLATFORM } from '@typ/platform';

const COLLECTION_NAME = config.databaseConfig.collection.ticker
const COLLECTION_CATEGORY = config.databaseConfig.category.ticker

export class RepoTicker {
    static async fetchAll(): Promise<MappedTicker[]> {
        return await ServiceDatabase.getData(COLLECTION_NAME) as MappedTicker[]
    }

    static async deleteAndSaveAll(tickersData: Omit<MappedTicker, '_id'>[]): Promise<void> {
        await ServiceDatabase.deleteAndInsertData(COLLECTION_NAME, tickersData)
    }

    static async saveTickers(platform: PLATFORM, mappedData: Omit<MappedTicker, '_id'>[]): Promise<void> {
        await ServiceDatabase.saveDataAndTimestampToDatabase(mappedData, COLLECTION_NAME, COLLECTION_CATEGORY, platform)
    }
}