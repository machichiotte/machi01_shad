// src/repositories/tradeRepository
import { MongodbService } from '@services/mongodbService'
import { MappedTrade } from '@typ/trade'
import { config } from '@config/index';
import { InsertData } from '@typ/trade';
import { PLATFORM } from '@src/types/platform';

const TRADES_COLLECTION = config.collection.trade

export class TradeRepository {
    static async fetchAllTrades(): Promise<MappedTrade[]> {
        return await MongodbService.getData(TRADES_COLLECTION) as MappedTrade[]
    }

    static async updateTradeById(tradeId: string, updatedTrade: MappedTrade): Promise<boolean> {
        return await MongodbService.updateOneData(TRADES_COLLECTION, { _id: tradeId }, { $set: updatedTrade })
    }

    static async deleteAndProcessTrades(mappedData: MappedTrade[], platform: PLATFORM): Promise<void> {
        await MongodbService.deleteAndProcessData(TRADES_COLLECTION, mappedData, platform)
    }

    static async insertTrades(tradesData: MappedTrade | MappedTrade[]): Promise<InsertData> {
        return await MongodbService.insertData(TRADES_COLLECTION, tradesData)
    }

    static async insertFilteredTrades(newTrades: MappedTrade[], existingTrades: MappedTrade[]): Promise<void> {
        const tradesToInsert = newTrades.filter(newTrade =>
            !existingTrades.some(existingTrade => existingTrade.timestamp === newTrade.timestamp)
        )

        if (tradesToInsert.length > 0) {
            await MongodbService.insertData(TRADES_COLLECTION, tradesToInsert)
        }
    }
}