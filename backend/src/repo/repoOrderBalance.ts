// src/repo/repoOrderBalance.ts
import { ServiceDatabase } from '@services/api/database/serviceDatabase'
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
        return await ServiceDatabase.getCollectionDocuments(COLLECTION_NAME) as MappedOrder[];
    }

    /**
     * Save mapped orders to the database.
     */
    static async save(mappedOrders: Omit<MappedOrder, '_id'>[], platform: PLATFORM): Promise<void> {
        await ServiceDatabase.saveDocumentsWithTimestamp(mappedOrders, COLLECTION_NAME, COLLECTION_CATEGORY, platform);
    }
}
