// src/repositories/highPriceRepository.ts
import { HighestPrices } from '@typ/database';
import { config } from '@config/index';
import { mongodbOperations } from '@src/services/mongodbOperationsService';
import { DatabaseService } from '@src/services/databaseService';

const COLLECTION_NAME = config.collection.highestPrice;

export class HighestPriceRepository {

    /**
     * Fetches the highest prices from the database.
     */
    static async fetchHighestPrices(): Promise<HighestPrices[]> {
        return await DatabaseService.getData(COLLECTION_NAME) as HighestPrices[];
    }

    /**
     * Updates or inserts the highest price for a given platform and base.
     */
    static async updateHighestPrice(platform: string, base: string, price: number): Promise<void> {
        await mongodbOperations.updateOneUpsert(COLLECTION_NAME, { base, platform },
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
