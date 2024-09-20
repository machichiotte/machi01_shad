import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import { MongodbService } from '@services/mongodbService';
import { handleServiceError } from '@utils/errorUtil';

jest.mock('mongodb');
jest.mock('@services/databaseOperationsService');
jest.mock('@utils/errorUtil');
jest.mock('@utils/retryUtil');

describe('MongodbService', () => {
  let mockMongoClient: jest.Mocked<MongoClient>;
  let mockDb: jest.Mocked<Db>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockMongoClient = {
      connect: jest.fn(),
      db: jest.fn(),
    } as unknown as jest.Mocked<MongoClient>;
    mockDb = {
      listCollections: jest.fn(),
      createCollection: jest.fn(),
    } as unknown as jest.Mocked<Db>;

    (MongoClient as jest.MockedClass<typeof MongoClient>).mockImplementation(() => mockMongoClient);
    mockMongoClient.db.mockReturnValue(mockDb);
  });

  describe('getMongoClient', () => {
    it('should create a new MongoClient instance and connect', async () => {
      await MongodbService.getMongoClient();

      expect(MongoClient).toHaveBeenCalledWith(expect.any(String), {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true
        }
      });
      expect(mockMongoClient.connect).toHaveBeenCalled();
    });

    it('should return existing instance if already connected', async () => {
      const firstInstance = await MongodbService.getMongoClient();
      const secondInstance = await MongodbService.getMongoClient();

      expect(firstInstance).toBe(secondInstance);
      expect(MongoClient).toHaveBeenCalledTimes(1);
    });

    it('should handle connection errors', async () => {
      const mockError = new Error('Connection failed');
      mockMongoClient.connect.mockRejectedValue(mockError);

      await expect(MongodbService.getMongoClient()).rejects.toThrow('Connection failed');
      expect(handleServiceError).toHaveBeenCalledWith(mockError, 'getMongoClient', 'Error connecting to MongoDB');
    });
  });

  describe('getDB', () => {
    it('should return a database instance', async () => {
      const result = await MongodbService.getDB();

      expect(result).toBe(mockDb);
      expect(mockMongoClient.db).toHaveBeenCalledWith(process.env.MONGODB_DATABASE);
    });

    it('should handle database selection errors', async () => {
      const mockError = new Error('Database selection failed');
      mockMongoClient.db.mockImplementation(() => { throw mockError; });

      await expect(MongodbService.getDB()).rejects.toThrow('Database selection failed');
      expect(handleServiceError).toHaveBeenCalledWith(mockError, 'getDB', 'Error getting database');
    });
  });

  describe('createCollectionIfNotExists', () => {
    it('should create a collection if it does not exist', async () => {
      const mockListCollections = jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) });
      mockDb.listCollections.mockReturnValue(mockListCollections());

      await MongodbService.createCollectionIfNotExists('testCollection');

      expect(mockDb.createCollection).toHaveBeenCalledWith('testCollection');
    });

    it('should not create a collection if it already exists', async () => {
      const mockListCollections = jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([{ name: 'testCollection' }]) });
      mockDb.listCollections.mockReturnValue(mockListCollections());

      await MongodbService.createCollectionIfNotExists('testCollection');

      expect(mockDb.createCollection).not.toHaveBeenCalled();
    });
  });

  // Ajoutez d'autres tests pour les méthodes restantes...
});