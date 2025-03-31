// src/repo/repoTimestamp.ts
import { ServiceDatabase } from '@services/api/database/serviceDatabase';
import { TimestampData } from '@typ/timestamp';
import { config } from '@config/index';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = config.databaseConfig.collection.timestamp;

export class RepoTimestamp {
    /**
     * Récupère les informations de dernière mise à jour depuis la base de données.
     */
    static async fetchTimestamp(): Promise<TimestampData> {
        const data = await ServiceDatabase.getCollectionDocuments(COLLECTION_NAME) as TimestampData[];
        if (!data || data.length === 0) {
            throw new Error('No timestamp data found');
        }
        return data[0] as TimestampData;
    }

    /**
     * Met à jour les informations de dernière mise à jour dans la base de données.
     */
    static async updateTimestamp(updatedTimestamp: TimestampData): Promise<void> {
        const { _id, ...mappedData } = updatedTimestamp;

        let objectId: ObjectId;
        if (typeof _id === 'string') {
            objectId = ObjectId.createFromHexString(_id)
        } else if (_id && '$oid' in _id) {
            objectId = ObjectId.createFromHexString(_id.$oid as string);
        } else if (_id instanceof ObjectId) {
            objectId = _id;
        } else {
            throw new Error('Invalid _id format');
        }

        const filter = { _id: objectId };
        const update = { $set: mappedData };

        await ServiceDatabase.updateDocument(COLLECTION_NAME, filter, update);
    }

    static async findTimestamp(filter: object): Promise<TimestampData> {
        return await ServiceDatabase.findSingleDocument(COLLECTION_NAME, filter) as TimestampData
    }
}
