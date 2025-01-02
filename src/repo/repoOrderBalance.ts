// src/repo/repoOrderBalance.ts
import { DatabaseService } from '@src/services/api/database/databaseService'
import { MappedOrder } from '@typ/order'
import { config } from '@config/index';
import { PLATFORM } from '@typ/platform';

const COLLECTION_NAME = config.databaseConfig.collection.order;
const COLLECTION_CATEGORY = config.databaseConfig.category.order;

export class RepoOrderBalance {
    /**
     * Fetch all orders from the database.
     */
    static async fetchAll(): Promise<MappedOrder[]> {
        return await DatabaseService.getData(COLLECTION_NAME) as MappedOrder[];
    }

    /**
     * Save mapped orders to the database.
     */
    static async save(mappedOrders: Omit<MappedOrder, '_id'>[], platform: PLATFORM): Promise<void> {
        await DatabaseService.saveDataAndTimestampToDatabase(mappedOrders, COLLECTION_NAME, COLLECTION_CATEGORY, platform);
    }
}
