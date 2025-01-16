// src/repo/repoAlarm.ts
import { AlarmInput, DbAlarm } from '@typ/database'; // Importez le type Alarm depuis votre typage
import { config } from '@config/index';
import { mongodbOperations } from '@services/api/database/serviceMongodbOperations';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = config.databaseConfig.collection.alarms;

export class RepoAlarm {
    /**
     * Fetches all alarms from the database, with an optional filter.
     * @param filter - Optional filter for fetching alarms.
     * @returns A list of alarms matching the filter.
     */
    static async fetchAlarms(filter: Partial<DbAlarm> = {}): Promise<DbAlarm[]> {
        return await mongodbOperations.find(COLLECTION_NAME, filter) as DbAlarm[];
    }

    /**
     * Inserts a new alarm into the database.
     * @param alarmData - The alarm data to be inserted.
     * @returns The ID of the newly created alarm.
     */
    static async createAlarm(alarmData: AlarmInput): Promise<string> {
        const result = await mongodbOperations.insertOne(COLLECTION_NAME, alarmData);
        return result.insertedId.toString();
    }

    /**
     * Updates an existing alarm by ID.
     * @param id - The ID of the alarm to update.
     * @param updates - The updates to apply.
     */
    static async updateAlarm(id: string, updates: Partial<DbAlarm>): Promise<void> {
        await mongodbOperations.updateOne(COLLECTION_NAME, { _id: new ObjectId(id) }, { $set: updates });
    }

    /**
     * Deletes an alarm by ID.
     * @param id - The ID of the alarm to delete.
     */
    static async deleteAlarm(id: string): Promise<void> {
        await mongodbOperations.deleteOne(COLLECTION_NAME, { _id: new ObjectId(id) });
    }
}
