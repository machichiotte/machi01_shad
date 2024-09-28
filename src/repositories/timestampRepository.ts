// src/repositories/timestampRepository.ts
import { MongodbService } from '@services/mongodbService';
import { TimestampData } from '@typ/timestamp';
import { config } from '@config/index';

const COLLECTION_NAME = config.collection.timestamp;

export class TimestampRepository {
    /**
     * Récupère les informations de dernière mise à jour depuis la base de données.
     */
    static async fetchTimestamp(): Promise<TimestampData[]> {
        return await MongodbService.getData(COLLECTION_NAME) as TimestampData[];
    }

    /**
     * Met à jour les informations de dernière mise à jour dans la base de données.
     */
    static async updateTimestamp(data: TimestampData): Promise<void> {
        const filter = {};
        const update = { $set: data };

        await MongodbService.updateOneData(COLLECTION_NAME, filter, update);
    }

    static async findTimestamp(filter: object): Promise<TimestampData> {
        return await MongodbService.findOneData(COLLECTION_NAME, filter) as TimestampData
    }
}
