// src/repo/repoStrategy.ts
import { ServiceDatabase } from '@services/api/database/serviceDatabase';
import { MappedStrat } from '@typ/strat';
import { config } from '@config/index';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = config.databaseConfig.collection.strat;
const COLLECTION_CATEGORY = config.databaseConfig.category.strat;

export class RepoStrategy {
    static async fetchAll(): Promise<MappedStrat[]> {
        return await ServiceDatabase.getData(COLLECTION_NAME) as MappedStrat[];
    }

    static async updateById(mappedData: MappedStrat): Promise<boolean> {
        const { _id, ...mappedStrat } = mappedData;
        return await ServiceDatabase.updateDoc(COLLECTION_NAME, { _id: new ObjectId(_id) }, { $set: mappedStrat });
    }

    static async deleteAll(): Promise<void> {
        await ServiceDatabase.deleteAllData(COLLECTION_NAME);
    }

    static async saveStrategies(strategies: MappedStrat[]): Promise<void> {
        //return await DatabaseService.insertData(COLLECTION_NAME, strategies);
        await ServiceDatabase.saveDataAndTimestampToDatabase(strategies, COLLECTION_NAME, COLLECTION_CATEGORY);
    }
}