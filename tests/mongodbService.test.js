// tests/mongodbService.test.js
require('dotenv').config();
const { MongoClient } = require('mongodb');
const {
  connectToMongoDB,
  saveData,
  getDataMDB,
  getOne,
  insertDataMDB,
  getAllDataMDB,
  updateDataMDB,
  deleteDataMDB,
  deleteMultipleDataMDB,
  deleteAllDataMDB,
} = require('../src/services/mongodbService.js');

jest.mock('mongodb');

const mockDb = {
  collection: jest.fn().mockReturnThis(),
  listCollections: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
  createCollection: jest.fn(),
  insertMany: jest.fn(),
  insertOne: jest.fn(),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  getAll: jest.fn()
};

const mockClient = {
  db: jest.fn(() => mockDb),
  connect: jest.fn(),
};

MongoClient.mockImplementation(() => mockClient);

describe('MongoDB Service', () => {
  const testCollection = 'test_collection';
  const testData = { _id: 'testId', value: 'testValue' };
  const testArrayData = [testData];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('connectToMongoDB connects and creates collections', async () => {
    mockDb.listCollections().toArray.mockResolvedValue([]);
    await connectToMongoDB();
    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockDb.createCollection).toHaveBeenCalledTimes(8);
  });

  test('saveData inserts array of documents', async () => {
    mockDb.insertMany.mockResolvedValue({ insertedCount: 1 });
    const result = await saveData(testArrayData, testCollection);
    expect(mockDb.insertMany).toHaveBeenCalledWith(testArrayData);
    expect(result.insertedCount).toBe(1);
  });

  test('saveData inserts a single document', async () => {
    mockDb.insertOne.mockResolvedValue({ insertedId: 'testId' });
    const result = await saveData(testData, testCollection);
    expect(mockDb.insertOne).toHaveBeenCalledWith(testData);
    expect(result.insertedId).toBe('testId');
  });

  test('getDataMDB fetches all documents', async () => {
    mockDb.find().toArray.mockResolvedValue(testArrayData);
    const result = await getDataMDB(testCollection);
    expect(mockDb.find().toArray).toHaveBeenCalled();
    expect(result).toEqual(testArrayData);
  });

  test('insertDataMDB inserts a document', async () => {
    mockDb.insertOne.mockResolvedValue({ insertedId: 'testId' });
    const result = await insertDataMDB(testCollection, testData);
    expect(mockDb.insertOne).toHaveBeenCalledWith(testData);
    expect(result).toBe('testId');
  });

  test('getOne fetches a single document', async () => {
    mockDb.findOne.mockResolvedValue(testData);
    const result = await getOne(testCollection, { _id: 'testId' });
    expect(mockDb.findOne).toHaveBeenCalledWith({ _id: 'testId' });
    expect(result).toEqual(testData);
  });

  test('getAllDataMDB fetches all documents', async () => {
    mockDb.find().toArray.mockResolvedValue(testArrayData);
    const result = await getAllDataMDB(testCollection);
    expect(mockDb.find().toArray).toHaveBeenCalled();
    expect(result).toEqual(testArrayData);
  });

  test('updateDataMDB updates a document', async () => {
    mockDb.updateOne.mockResolvedValue({ modifiedCount: 1, upsertedCount: 0 });
    const result = await updateDataMDB(testCollection, { _id: 'testId' }, { $set: { value: 'newValue' } });
    expect(mockDb.updateOne).toHaveBeenCalledWith({ _id: 'testId' }, { $set: { value: 'newValue' } }, { upsert: true });
    expect(result.modifiedCount).toBe(1);
  });

  test('deleteDataMDB deletes a document', async () => {
    mockDb.deleteOne.mockResolvedValue({ deletedCount: 1 });
    const result = await deleteDataMDB(testCollection, { _id: 'testId' });
    expect(mockDb.deleteOne).toHaveBeenCalledWith({ _id: 'testId' });
    expect(result).toBe(1);
  });

  test('deleteMultipleDataMDB deletes multiple documents', async () => {
    mockDb.deleteMany.mockResolvedValue({ deletedCount: 2 });
    const result = await deleteMultipleDataMDB(testCollection, { value: 'testValue' });
    expect(mockDb.deleteMany).toHaveBeenCalledWith({ value: 'testValue' });
    expect(result).toBe(2);
  });

  test('deleteAllDataMDB deletes all documents', async () => {
    mockDb.deleteMany.mockResolvedValue({ deletedCount: 3 });
    const result = await deleteAllDataMDB(testCollection);
    expect(mockDb.deleteMany).toHaveBeenCalledWith({});
    expect(result).toBe(3);
  });
});
