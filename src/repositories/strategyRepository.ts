// src/repositories.strategyRepository.ts
import { DatabaseService } from '@services/databaseService';
import { MappedStrat } from '@typ/strat';
import { config } from '@config/index';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = config.databaseConfig.collection.strat;
const COLLECTION_CATEGORY = config.databaseConfig.category.strat;

export class StrategyRepository {
    static async fetchAll(): Promise<MappedStrat[]> {
        return await DatabaseService.getData(COLLECTION_NAME) as MappedStrat[];
    }

    static async updateById(mappedData: MappedStrat): Promise<boolean> {
        const { _id, ...mappedStrat } = mappedData;
        return await DatabaseService.updateDoc(COLLECTION_NAME, { _id: new ObjectId(_id) }, { $set: mappedStrat });
    }

    static async deleteAll(): Promise<void> {
        await DatabaseService.deleteAllData(COLLECTION_NAME);
    }

    static async saveStrategies(strategies: MappedStrat[]): Promise<void> {
        //return await DatabaseService.insertData(COLLECTION_NAME, strategies);
        await DatabaseService.saveDataAndTimestampToDatabase(strategies, COLLECTION_NAME, COLLECTION_CATEGORY);
    }
}