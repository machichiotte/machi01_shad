import { LastUpdateService } from '@services/lastUpdateService';
import { MongodbService } from '@services/mongodbService';

jest.mock('@services/mongodbService');
jest.mock('@config/index', () => ({
  collection: {
    lastUpdate: 'collection_last_update'
  },
  collectionType: {
    lastUpdate: 'lastUpdate'
  }
}));

describe('lastUpdateService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchDatabaseLastUpdate', () => {
    it('should fetch last update data from the database', async () => {
      const mockData = [{ type1: 123456789 }];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockData);

      const result = await LastUpdateService.fetchDatabaseLastUpdate();

      expect(MongodbService.getData).toHaveBeenCalledWith('collection_last_update');
      expect(result).toEqual(mockData);
    });
  });

  describe('saveLastUpdateToDatabase', () => {
    it('should save last update without platform', async () => {
      const mockData = [{ type1: 123456789 }];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockData);
      jest.spyOn(Date, 'now').mockReturnValue(987654321);

      await LastUpdateService.saveLastUpdateToDatabase('type2');

      expect(MongodbService.updateInDatabase).toHaveBeenCalledWith(
        'collection_last_update',
        {},
        { $set: { type1: 123456789, type2: 987654321 } }
      );
    });

    it('should save last update with platform', async () => {
      const mockData = [{ type1: { platform1: 123456789 } }];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockData);
      jest.spyOn(Date, 'now').mockReturnValue(987654321);

      await LastUpdateService.saveLastUpdateToDatabase('type1', 'platform2');

      expect(MongodbService.updateInDatabase).toHaveBeenCalledWith(
        'collection_last_update',
        {},
        { $set: { type1: { platform1: 123456789, platform2: 987654321 } } }
      );
    });

    it('should handle empty initial data', async () => {
      (MongodbService.getData as jest.Mock).mockResolvedValue([]);
      jest.spyOn(Date, 'now').mockReturnValue(987654321);

      await LastUpdateService.saveLastUpdateToDatabase('type1', 'platform1');

      expect(MongodbService.updateInDatabase).toHaveBeenCalledWith(
        'collection_last_update',
        {},
        { $set: { type1: { platform1: 987654321 } } }
      );
    });
  });
});
