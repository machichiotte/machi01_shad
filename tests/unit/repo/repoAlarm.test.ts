// tests/unit/repo/repoAlarm.test.ts
import { RepoAlarm } from '@repo/repoAlarm';
import { mongodbOperations } from '@services/api/database/serviceMongodbOperations';
import { AlarmInput, DbAlarm } from '@typ/database';
import { ObjectId } from 'mongodb';
import { config } from '@config/index';

const COLLECTION_NAME = config.databaseConfig.collection.alarms;

// Mocking des opérations MongoDB
jest.mock('@services/api/database/serviceMongodbOperations', () => ({
  mongodbOperations: {
    find: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  }
}));

describe('RepoAlarm', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Nettoyer les mocks après chaque test
  });

  describe('fetchAlarms', () => {
    it('should fetch alarms with no filter', async () => {
      const mockAlarms: DbAlarm[] = [{
        _id: new ObjectId('60d5f0f9c0a0c3b914f6e3bc'),  // Utilisation de ObjectId valide
        platform: 'binance',
        base: 'BTC',
        price: 30000,
        oldPrice: 29000,
        status: 'open',
        createdAt: new Date(),
      }];
      
      // Simuler la réponse de find
      (mongodbOperations.find as jest.Mock).mockResolvedValue(mockAlarms);

      const alarms = await RepoAlarm.fetchAlarms();

      expect(mongodbOperations.find).toHaveBeenCalledWith(COLLECTION_NAME, {});
      expect(alarms).toEqual(mockAlarms);
    });

    it('should fetch alarms with a filter', async () => {
      const mockAlarms: DbAlarm[] = [{
        _id: new ObjectId('60d5f0f9c0a0c3b914f6e3bc'),
        platform: 'binance',
        base: 'BTC',
        price: 30000,
        oldPrice: 29000,
        status: 'open',
        createdAt: new Date(),
      }];
      
      // Simuler la réponse de find avec un filtre
      (mongodbOperations.find as jest.Mock).mockResolvedValue(mockAlarms);

      const alarms = await RepoAlarm.fetchAlarms({ platform: 'binance' });

      expect(mongodbOperations.find).toHaveBeenCalledWith(COLLECTION_NAME, { platform: 'binance' });
      expect(alarms).toEqual(mockAlarms);
    });
  });

  describe('createAlarm', () => {
    it('should create an alarm and return its ID', async () => {
      const mockAlarmData: AlarmInput = {
        platform: 'binance',
        base: 'BTC',
        price: 30000,
        oldPrice: 29000,
        status: 'open',
        createdAt: new Date(),
      };

      // Simuler la réponse de insertOne avec un ID inséré
      (mongodbOperations.insertOne as jest.Mock).mockResolvedValue({ insertedId: new ObjectId('60d5f0f9c0a0c3b914f6e3bc') });

      const alarmId = await RepoAlarm.createAlarm(mockAlarmData);

      expect(mongodbOperations.insertOne).toHaveBeenCalledWith(COLLECTION_NAME, mockAlarmData);
      expect(alarmId).toBe('60d5f0f9c0a0c3b914f6e3bc');  // L'ID doit correspondre à celui généré par MongoDB
    });
  });

  describe('updateAlarm', () => {
    it('should update an existing alarm', async () => {
      const alarmId = '60d5f0f9c0a0c3b914f6e3bc'; // ID d'alarme valide
      const updates = { price: 31000 };

      // Simuler la réponse de updateOne (aucun résultat, donc juste un appel réussi)
      (mongodbOperations.updateOne as jest.Mock).mockResolvedValue(undefined);

      await RepoAlarm.updateAlarm(alarmId, updates);

      expect(mongodbOperations.updateOne).toHaveBeenCalledWith(COLLECTION_NAME, { _id: new ObjectId(alarmId) }, { $set: updates });
    });
  });

  describe('deleteAlarm', () => {
    it('should delete an alarm by ID', async () => {
      const alarmId = '60d5f0f9c0a0c3b914f6e3bc'; // ID d'alarme valide

      // Simuler la suppression de l'alarme
      (mongodbOperations.deleteOne as jest.Mock).mockResolvedValue(undefined);

      await RepoAlarm.deleteAlarm(alarmId);

      expect(mongodbOperations.deleteOne).toHaveBeenCalledWith(COLLECTION_NAME, { _id: new ObjectId(alarmId) });
    });
  });
});
