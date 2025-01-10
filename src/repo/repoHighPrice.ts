// src/repo/repoHighPrice.ts
import { HighestPrices } from '@typ/database';
import { config } from '@config/index';
import { mongodbOperations } from '@services/api/database/serviceMongodbOperations';
import { ServiceDatabase } from '@services/api/database/serviceDatabase';

const COLLECTION_NAME = config.databaseConfig.collection.highestPrice;

export class RepoHighPrice {

    /**
     * Fetches the highest prices from the database.
     */
    static async fetchHighestPrices(): Promise<HighestPrices[]> {
        return await ServiceDatabase.getData(COLLECTION_NAME) as HighestPrices[];
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
