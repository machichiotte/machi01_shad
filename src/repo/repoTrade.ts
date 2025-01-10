// src/repo/repoTrade.ts
import { ServiceDatabase } from '@services/api/database/serviceDatabase'
import { MappedTrade } from '@typ/trade'
import { config } from '@config/index';
import { InsertData } from '@typ/trade';
import { ObjectId } from 'mongodb';

const TRADES_COLLECTION = config.databaseConfig.collection.trade

export class RepoTrade {
    static async fetchAllTrades(): Promise<MappedTrade[]> {
        return await ServiceDatabase.getData(TRADES_COLLECTION) as MappedTrade[]
    }

    static async updateById(updatedTrade: MappedTrade): Promise<boolean> {
        const { _id, ...mappedData } = updatedTrade;
        return await ServiceDatabase.updateDoc(TRADES_COLLECTION, { _id: new ObjectId(_id) }, { $set: mappedData })
    }

    static async insertTrades(tradesData: MappedTrade | MappedTrade[]): Promise<InsertData> {
        return await ServiceDatabase.insertData(TRADES_COLLECTION, tradesData)
    }

    static async insertFilteredTrades(newTrades: MappedTrade[], existingTrades: MappedTrade[]): Promise<void> {
        const tradesToInsert = newTrades.filter(newTrade =>
            !existingTrades.some(existingTrade => existingTrade.timestamp === newTrade.timestamp)
        )

        if (tradesToInsert.length > 0) {
            await ServiceDatabase.insertData(TRADES_COLLECTION, tradesToInsert)
        }
    }
}