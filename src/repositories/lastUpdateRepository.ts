// src/repositories/lastUpdateRepository
import { MongodbService } from '@services/mongodbService';
import { LastUpdateData } from '@typ/database';
import config from '@config/index';

const COLLECTION_NAME = config.collection.lastUpdate;

export class LastUpdateRepository {
    /**
     * Récupère les informations de dernière mise à jour depuis la base de données.
     */
    public static async fetchLastUpdate(): Promise<LastUpdateData[]> {
        return await MongodbService.getData(COLLECTION_NAME) as LastUpdateData[];
    }

    /**
     * Met à jour les informations de dernière mise à jour dans la base de données.
     */
    public static async updateLastUpdate(data: LastUpdateData): Promise<void> {
        const filter = {};
        const update = { $set: data };

        await MongodbService.updateOneData(COLLECTION_NAME, filter, update);
    }
}
