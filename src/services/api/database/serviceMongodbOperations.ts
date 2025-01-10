// src/services/mongodbOperationsService.ts
import { Collection, Document, InsertOneResult, InsertManyResult, UpdateResult, AggregateOptions, AnyBulkWriteOperation, FindOptions, BulkWriteResult } from 'mongodb';
import { ServiceMongodb } from '@services/api/database/serviceMongodb';

interface MongodbOperations {
    insertOne: (collectionName: string, document: Document) => Promise<InsertOneResult>;
    insertMany: (collectionName: string, documents: Document[]) => Promise<InsertManyResult>;
    updateOne: (collectionName: string, filter: Document, update: Document) => Promise<boolean>;
    updateOneUpsert: (collectionName: string, filter: Document, update: Document, options?: { upsert?: boolean }) => Promise<{ updated: boolean, upserted: boolean }>;
    updateMany: (collectionName: string, filter: Document, update: Document) => Promise<UpdateResult>;
    deleteOne: (collectionName: string, filter: Document) => Promise<boolean>;
    deleteMany: (collectionName: string, filter: Document) => Promise<number>;
    find: (collectionName: string, filter?: Document, options?: FindOptions) => Promise<Document[]>;
    findOne: (collectionName: string, filter: Document) => Promise<Document | null>;
    aggregate: (collectionName: string, pipeline: Document[], options?: AggregateOptions) => Promise<Document[]>;
    count: (collectionName: string, filter: Document) => Promise<number>;
    bulkWrite: (collectionName: string, operations: AnyBulkWriteOperation<Document>[]) => Promise<BulkWriteResult>;
    createIndex: (collectionName: string, fieldOrSpec: string | Document, options?: Document) => Promise<string>;
    dropIndex: (collectionName: string, indexName: string) => Promise<void>;
    findOneAndUpdate: (collectionName: string, filter: Document, update: Document, options?: Document) => Promise<Document | null>;
    findOneAndDelete: (collectionName: string, filter: Document, options?: Document) => Promise<Document | null>;
}

const getCollection = async (collectionName: string): Promise<Collection> => {
    const db = await ServiceMongodb.getDB();
    return db.collection(collectionName);
};

export const mongodbOperations: MongodbOperations = {
    insertOne: async (collectionName: string, document: Document): Promise<InsertOneResult> => {
        const collection = await getCollection(collectionName);
        return await collection.insertOne(document);
    },

    insertMany: async (collectionName: string, documents: Document[]): Promise<InsertManyResult> => {
        const collection = await getCollection(collectionName);
        return await collection.insertMany(documents);
    },

    updateOne: async (collectionName: string, filter: Document, update: Document): Promise<boolean> => {
        const collection = await getCollection(collectionName);
        const updateOperation = update.$set ? update : { $set: update };
        const result = await collection.updateOne(filter, updateOperation);
        return result.modifiedCount > 0;
    },

    updateOneUpsert: async (collectionName: string, filter: Document, update: Document, options?: { upsert?: boolean }): Promise<{ updated: boolean, upserted: boolean }> => {
        const collection = await getCollection(collectionName);
        const updateOperation = update.$set ? update : { $set: update };
        const result = await collection.updateOne(filter, updateOperation, { upsert: options?.upsert });
        return {
            updated: result.modifiedCount > 0,
            upserted: result.upsertedCount > 0
        };
    },

    updateMany: async (collectionName: string, filter: Document, update: Document): Promise<UpdateResult> => {
        const collection = await getCollection(collectionName);
        const updateOperation = update.$set ? update : { $set: update };
        return await collection.updateMany(filter, updateOperation);
    },

    deleteOne: async (collectionName: string, filter: Document): Promise<boolean> => {
        const collection = await getCollection(collectionName);
        const result = await collection.deleteOne(filter);
        return result.deletedCount > 0;
    },

    deleteMany: async (collectionName: string, filter: Document): Promise<number> => {
        const collection = await getCollection(collectionName);
        const result = await collection.deleteMany(filter);
        return result.deletedCount;
    },

    find: async (collectionName: string, filter?: Document, options?: FindOptions): Promise<Document[]> => {
        const collection = await getCollection(collectionName);
        return collection.find(filter || {}, options).toArray();
    },

    findOne: async (collectionName: string, filter: Document): Promise<Document | null> => {
        const collection = await getCollection(collectionName);
        return collection.findOne(filter);
    },

    aggregate: async (collectionName: string, pipeline: Document[], options?: AggregateOptions): Promise<Document[]> => {
        const collection = await getCollection(collectionName);
        return collection.aggregate(pipeline, options).toArray();
    },

    count: async (collectionName: string, filter: Document): Promise<number> => {
        const collection = await getCollection(collectionName);
        return collection.countDocuments(filter);
    },

    bulkWrite: async (collectionName: string, operations: AnyBulkWriteOperation<Document>[]): Promise<BulkWriteResult> => {
        const collection = await getCollection(collectionName);
        return collection.bulkWrite(operations);
    },

    createIndex: async (collectionName: string, fieldOrSpec: string | Document, options?: Document): Promise<string> => {
        const collection = await getCollection(collectionName);
        return collection.createIndex(fieldOrSpec, options);
    },

    dropIndex: async (collectionName: string, indexName: string): Promise<void> => {
        const collection = await getCollection(collectionName);
        await collection.dropIndex(indexName);
    },

    findOneAndUpdate: async (collectionName: string, filter: Document, update: Document, options?: Document): Promise<Document | null> => {
        const collection = await getCollection(collectionName);
        const result = await collection.findOneAndUpdate(filter, update, options || {});
        return result?.value;
    },

    findOneAndDelete: async (collectionName: string, filter: Document, options?: Document): Promise<Document | null> => {
        const collection = await getCollection(collectionName);
        const result = await collection.findOneAndDelete(filter, options || {});
        return result?.value;
    },
};