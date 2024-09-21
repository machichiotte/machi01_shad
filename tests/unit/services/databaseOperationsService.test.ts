// databaseOperationsService.test.ts
import { MongodbService } from '@services/mongodbService';
import { databaseOperations } from '@services/databaseOperationsService';
import { Collection, Document } from 'mongodb';

// Mock de base de données
jest.mock('@services/mongodbService', () => ({
    MongodbService: {
        getDB: jest.fn(),
    },
}));

describe('databaseOperations', () => {
    let collectionMock: Partial<Collection<Document>>;

    beforeEach(() => {
        collectionMock = {
            insertOne: jest.fn(),
            insertMany: jest.fn(),
            updateOne: jest.fn(),
            updateMany: jest.fn(),
            deleteOne: jest.fn(),
            deleteMany: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn().mockReturnValue({
                toArray: jest.fn(),
            }),
            aggregate: jest.fn().mockReturnValue({
                toArray: jest.fn(),
            }),
            countDocuments: jest.fn(),
            bulkWrite: jest.fn(),
            createIndex: jest.fn(),
            dropIndex: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
        };

        (MongodbService.getDB as jest.Mock).mockResolvedValue({
            collection: jest.fn().mockReturnValue(collectionMock),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('insertOne', () => {
        it('should insert a document into the collection', async () => {
            const mockDocument = { name: 'test' };
            const mockResult = { acknowledged: true, insertedId: '12345' };

            (collectionMock.insertOne as jest.Mock).mockResolvedValue(mockResult);

            const result = await databaseOperations.insertOne('testCollection', mockDocument);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.insertOne).toHaveBeenCalledWith(mockDocument);
            expect(result).toEqual(mockResult);
        });

        it('should handle errors during insertOne', async () => {
            (collectionMock.insertOne as jest.Mock).mockRejectedValue(new Error('Insert failed'));

            await expect(databaseOperations.insertOne('testCollection', { name: 'fail' }))
                .rejects.toThrow('Insert failed');
        });
    });

    describe('insertMany', () => {
        it('should insert multiple documents', async () => {
            const mockDocuments = [{ name: 'test1' }, { name: 'test2' }];
            const mockResult = { acknowledged: true, insertedIds: { 0: 'id1', 1: 'id2' } };

            (collectionMock.insertMany as jest.Mock).mockResolvedValue(mockResult);

            const result = await databaseOperations.insertMany('testCollection', mockDocuments);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.insertMany).toHaveBeenCalledWith(mockDocuments);
            expect(result).toEqual(mockResult);
        });
    });

    describe('updateOne', () => {
        it('should update a single document', async () => {
            const mockFilter = { name: 'test' };
            const mockUpdate = { $set: { name: 'updatedTest' } };
            const mockResult = { modifiedCount: 1 };

            (collectionMock.updateOne as jest.Mock).mockResolvedValue(mockResult);

            const result = await databaseOperations.updateOne('testCollection', mockFilter, mockUpdate);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.updateOne).toHaveBeenCalledWith(mockFilter, mockUpdate);
            expect(result).toBe(true);
        });

        it('should return false if no document is updated', async () => {
            (collectionMock.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

            const result = await databaseOperations.updateOne('testCollection', { name: 'test' }, { $set: { name: 'updatedTest' } });

            expect(result).toBe(false);
        });
    });

    describe('deleteOne', () => {
        it('should delete a single document', async () => {
            const mockFilter = { name: 'test' };
            const mockResult = { deletedCount: 1 };

            (collectionMock.deleteOne as jest.Mock).mockResolvedValue(mockResult);

            const result = await databaseOperations.deleteOne('testCollection', mockFilter);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.deleteOne).toHaveBeenCalledWith(mockFilter);
            expect(result).toBe(true);
        });

        it('should return false if no document is deleted', async () => {
            (collectionMock.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

            const result = await databaseOperations.deleteOne('testCollection', { name: 'non-existent' });

            expect(result).toBe(false);
        });
    });

    describe('updateOneUpsert', () => {
        it('devrait mettre à jour un document existant', async () => {
            const mockFilter = { name: 'test' };
            const mockUpdate = { $set: { value: 'updated' } };
            const mockResult = { modifiedCount: 1, upsertedCount: 0 };

            (collectionMock.updateOne as jest.Mock).mockResolvedValue(mockResult);

            const result = await databaseOperations.updateOneUpsert('testCollection', mockFilter, mockUpdate);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.updateOne).toHaveBeenCalledWith(mockFilter, mockUpdate, { upsert: undefined });
            expect(result).toEqual({ updated: true, upserted: false });
        });

        it('devrait insérer un nouveau document si aucun ne correspond', async () => {
            const mockFilter = { name: 'newTest' };
            const mockUpdate = { $set: { value: 'new' } };
            const mockResult = { modifiedCount: 0, upsertedCount: 1 };

            (collectionMock.updateOne as jest.Mock).mockResolvedValue(mockResult);

            const result = await databaseOperations.updateOneUpsert('testCollection', mockFilter, mockUpdate, { upsert: true });

            expect(collectionMock.updateOne).toHaveBeenCalledWith(mockFilter, mockUpdate, { upsert: true });
            expect(result).toEqual({ updated: false, upserted: true });
        });
    });

    describe('updateMany', () => {
        it('devrait mettre à jour plusieurs documents', async () => {
            const mockFilter = { category: 'test' };
            const mockUpdate = { $set: { status: 'updated' } };
            const mockResult = { modifiedCount: 3 };

            (collectionMock.updateMany as jest.Mock).mockResolvedValue(mockResult);

            const result = await databaseOperations.updateMany('testCollection', mockFilter, mockUpdate);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.updateMany).toHaveBeenCalledWith(mockFilter, mockUpdate);
            expect(result).toEqual(mockResult);
        });
    });

    describe('deleteMany', () => {
        it('devrait supprimer plusieurs documents', async () => {
            const mockFilter = { category: 'obsolete' };
            const mockResult = { deletedCount: 5 };

            (collectionMock.deleteMany as jest.Mock).mockResolvedValue(mockResult);

            const result = await databaseOperations.deleteMany('testCollection', mockFilter);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.deleteMany).toHaveBeenCalledWith(mockFilter);
            expect(result).toBe(5);
        });
    });

    describe('find', () => {
        it('devrait trouver des documents correspondant au filtre', async () => {
            const mockFilter = { status: 'active' };
            const mockDocuments = [{ _id: '1', name: 'doc1' }, { _id: '2', name: 'doc2' }];

            const mockCursor = {
                toArray: jest.fn().mockResolvedValue(mockDocuments)
            };
            (collectionMock.find as jest.Mock).mockReturnValue(mockCursor);

            const result = await databaseOperations.find('testCollection', mockFilter);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.find).toHaveBeenCalledWith(mockFilter, undefined);
            expect(result).toEqual(mockDocuments);
        });
    });

    describe('findOne', () => {
        it('devrait trouver un seul document correspondant au filtre', async () => {
            const mockFilter = { _id: '123' };
            const mockDocument = { _id: '123', name: 'testDoc' };

            (collectionMock.findOne as jest.Mock).mockResolvedValue(mockDocument);

            const result = await databaseOperations.findOne('testCollection', mockFilter);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.findOne).toHaveBeenCalledWith(mockFilter);
            expect(result).toEqual(mockDocument);
        });
    });

    describe('aggregate', () => {
        it('devrait exécuter une agrégation sur la collection', async () => {
            const mockPipeline = [{ $match: { status: 'active' } }, { $group: { _id: '$category', count: { $sum: 1 } } }];
            const mockResult = [{ _id: 'category1', count: 5 }, { _id: 'category2', count: 3 }];

            const mockCursor = {
                toArray: jest.fn().mockResolvedValue(mockResult)
            };
            (collectionMock.aggregate as jest.Mock).mockReturnValue(mockCursor);

            const result = await databaseOperations.aggregate('testCollection', mockPipeline);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.aggregate).toHaveBeenCalledWith(mockPipeline, undefined);
            expect(result).toEqual(mockResult);
        });
    });

    describe('count', () => {
        it('devrait compter les documents correspondant au filtre', async () => {
            const mockFilter = { status: 'active' };
            const mockCount = 10;

            (collectionMock.countDocuments as jest.Mock).mockResolvedValue(mockCount);

            const result = await databaseOperations.count('testCollection', mockFilter);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.countDocuments).toHaveBeenCalledWith(mockFilter);
            expect(result).toBe(mockCount);
        });
    });

    describe('bulkWrite', () => {
        it('devrait exécuter des opérations en masse', async () => {

        });
    });

    describe('createIndex', () => {
        it('devrait créer un index sur la collection', async () => {
            const mockIndex = { name: 1 };
            const mockOptions = { unique: true };
            const mockIndexName = 'name_1';

            (collectionMock.createIndex as jest.Mock).mockResolvedValue(mockIndexName);

            const result = await databaseOperations.createIndex('testCollection', mockIndex, mockOptions);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.createIndex).toHaveBeenCalledWith(mockIndex, mockOptions);
            expect(result).toBe(mockIndexName);
        });
    });

    describe('dropIndex', () => {
        it('devrait supprimer un index de la collection', async () => {
            const mockIndexName = 'name_1';

            (collectionMock.dropIndex as jest.Mock).mockResolvedValue(undefined);

            await databaseOperations.dropIndex('testCollection', mockIndexName);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.dropIndex).toHaveBeenCalledWith(mockIndexName);
        });
    });

    describe('findOneAndUpdate', () => {
        it('devrait trouver et mettre à jour un document', async () => {
            const mockFilter = { _id: '123' };
            const mockUpdate = { $set: { status: 'updated' } };
            const mockOptions = { returnOriginal: false };
            const mockResult = { value: { _id: '123', status: 'updated' } };

            (collectionMock.findOneAndUpdate as jest.Mock).mockResolvedValue(mockResult);

            const result = await databaseOperations.findOneAndUpdate('testCollection', mockFilter, mockUpdate, mockOptions);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.findOneAndUpdate).toHaveBeenCalledWith(mockFilter, mockUpdate, mockOptions);
            expect(result).toEqual(mockResult.value);
        });
    });

    describe('findOneAndDelete', () => {
        it('devrait trouver et supprimer un document', async () => {
            const mockFilter = { _id: '123' };
            const mockOptions = { sort: { createdAt: -1 } };
            const mockResult = { value: { _id: '123', name: 'deletedDoc' } };

            (collectionMock.findOneAndDelete as jest.Mock).mockResolvedValue(mockResult);

            const result = await databaseOperations.findOneAndDelete('testCollection', mockFilter, mockOptions);

            expect(MongodbService.getDB).toHaveBeenCalled();
            expect(collectionMock.findOneAndDelete).toHaveBeenCalledWith(mockFilter, mockOptions);
            expect(result).toEqual(mockResult.value);
        });
    });
});
