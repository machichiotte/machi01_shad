import { DatabaseService } from '@services/databaseService';
import { MongodbService } from '@services/mongodbService';
import { LastUpdateService } from '@services/lastUpdateService';
import { handleServiceError } from '@utils/errorUtil';
import { MappedData } from 'src/models/dbTypes';

jest.mock('@services/mongodbService');
jest.mock('@services/lastUpdateService');
jest.mock('@utils/errorUtil');

describe('databaseService', () => {
  const mockData: MappedData[] = [{ id: '1', name: 'Test' }];
  const mockCollectionName = 'testCollection';
  const mockPlatform = 'testPlatform';
  const mockUpdateType = 'testUpdateType';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveDataToDatabase', () => {
    it('should save data to database and update last update date', async () => {
      await DatabaseService.saveDataToDatabase(mockData, mockCollectionName, mockPlatform, mockUpdateType);

      expect(MongodbService.deleteAndSaveData).toHaveBeenCalledWith(mockCollectionName, mockData, mockPlatform);
      expect(LastUpdateService.saveLastUpdateToDatabase).toHaveBeenCalledWith(mockUpdateType, mockPlatform);
      expect(console.log).toHaveBeenCalledTimes(2);
    });

    it('should handle errors correctly', async () => {
      const mockError = new Error('Test error');
      (MongodbService.deleteAndSaveData as jest.Mock).mockRejectedValue(mockError);

      await expect(DatabaseService.saveDataToDatabase(mockData, mockCollectionName, mockPlatform, mockUpdateType))
        .rejects.toThrow('Test error');

      expect(handleServiceError).toHaveBeenCalledWith(mockError, 'saveDataToDatabase', 'Erreur lors de la sauvegarde des données dans la base de données');
    });
  });
});