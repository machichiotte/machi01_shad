// src/repo/repoTicker.ts
import { DatabaseService } from '@src/services/api/database/databaseService'
import { MappedTicker } from '@typ/ticker'
import { config } from '@config/index'
import { PLATFORM } from '@typ/platform';

const COLLECTION_NAME = config.databaseConfig.collection.ticker
const COLLECTION_CATEGORY = config.databaseConfig.category.ticker

export class RepoTicker {
    static async fetchAll(): Promise<MappedTicker[]> {
        return await DatabaseService.getData(COLLECTION_NAME) as MappedTicker[]
    }

    static async deleteAndSaveAll(tickersData: Omit<MappedTicker, '_id'>[]): Promise<void> {
        await DatabaseService.deleteAndInsertData(COLLECTION_NAME, tickersData)
    }

    static async saveTickers(platform: PLATFORM, mappedData: Omit<MappedTicker, '_id'>[]): Promise<void> {
        await DatabaseService.saveDataAndTimestampToDatabase(mappedData, COLLECTION_NAME, COLLECTION_CATEGORY, platform)
    }
}