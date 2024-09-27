// src/repositories/marketRepository.ts

import { MongodbService } from '@services/mongodbService';
import { MappedMarket } from '@typ/market';
import { config } from '@config/index';
import { PLATFORM } from '@src/types/platform';

const COLLECTION_NAME = config.collection.market;

export class MarketRepository {
    static async saveMarkets(markets: Omit<MappedMarket, '_id'>[], platform: PLATFORM): Promise<void> {
        await MongodbService.deleteAndProcessData(COLLECTION_NAME, markets, platform);
    }

    static async getMarkets(): Promise<MappedMarket[]> {
        return await MongodbService.getData(COLLECTION_NAME) as MappedMarket[];
    }
}