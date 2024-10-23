// src/repositories/tradeRepository.ts
import { DatabaseService } from '@services/databaseService'
import { MappedTrade } from '@typ/trade'
import { config } from '@config/index';
import { InsertData } from '@typ/trade';
import { ObjectId } from 'mongodb';

const TRADES_COLLECTION = config.collection.trade

export class TradeRepository {
    static async fetchAllTrades(): Promise<MappedTrade[]> {
        return await DatabaseService.getData(TRADES_COLLECTION) as MappedTrade[]
    }

    static async updateTradeById(updatedTrade: MappedTrade): Promise<boolean> {
        const { _id, ...mappedData } = updatedTrade;
        return await DatabaseService.updateOneData(TRADES_COLLECTION, { _id: new ObjectId(_id) }, { $set: mappedData })
    }

    static async insertTrades(tradesData: MappedTrade | MappedTrade[]): Promise<InsertData> {
        return await DatabaseService.insertData(TRADES_COLLECTION, tradesData)
    }

    static async insertFilteredTrades(newTrades: MappedTrade[], existingTrades: MappedTrade[]): Promise<void> {
        const tradesToInsert = newTrades.filter(newTrade =>
            !existingTrades.some(existingTrade => existingTrade.timestamp === newTrade.timestamp)
        )

        if (tradesToInsert.length > 0) {
            await DatabaseService.insertData(TRADES_COLLECTION, tradesToInsert)
        }
    }
}