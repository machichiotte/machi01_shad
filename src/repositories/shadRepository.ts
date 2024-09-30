// src/repositories/shadRepository.ts
import { MongodbService } from '@services/mongodbService';
import { ShadData, HighestPrices } from '@typ/database';
import { config } from '@config/index';
import { mongodbOperations } from '@src/services/mongodbOperationsService';

const COLLECTION_NAME_SHAD = config.collection.shad;
const COLLECTION_NAME_HIGH_PRICE = config.collection.highestPrice;

export class ShadRepository {
    /**
     * Fetches the most recent SHAD data from the database.
     */
    static async fetchShadData(): Promise<ShadData[]> {
        return await MongodbService.getData(COLLECTION_NAME_SHAD) as ShadData[];
    }

    /**
     * Fetches the highest prices from the database.
     */
    static async fetchHighestPrices(): Promise<HighestPrices[]> {
        return await MongodbService.getData(COLLECTION_NAME_HIGH_PRICE) as HighestPrices[];
    }

    /**
     * Updates or inserts the highest price for a given platform and base.
     */
    static async updateHighestPrice(platform: string, base: string, price: number): Promise<void> {
        await mongodbOperations.updateOneUpsert(COLLECTION_NAME_HIGH_PRICE, { base, platform },
            {
                $set: {
                    base,
                    platform,
                    highestPrice: price,
                },
            },
            { upsert: true }
        );
    }
}
