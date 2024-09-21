import { ShadService } from '@services/shadService';
import { MongodbService } from '@services/mongodbService';
import { databaseOperations } from '@services/databaseOperationsService';
import { ShadData, HighestPrices } from '@models/dbTypes';
import config from '@config/index';

jest.mock('@services/mongodbService');
jest.mock('@services/databaseOperationsService');

jest.mock('@config/index', () => ({
  collection: {
    shad: 'collection_shad',
    highestPrices: 'collection_highest_prices'
  },
  collectionType: {
    shad: 'shad'
  }
}));

describe('ShadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchShadInDatabase', () => {
    it('should fetch SHAD data from the database', async () => {
      const mockShadData: Partial<ShadData>[] = [{ id: '1', data: 'test' }];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockShadData);

      const result = await ShadService.fetchShadInDatabase();

      expect(MongodbService.getData).toHaveBeenCalledWith(config?.collection?.shad);
      expect(result).toEqual(mockShadData);
    });
  });

  describe('getHighestPrices', () => {
    it('should fetch highest prices from the database', async () => {
      const mockHighestPrices: Partial<HighestPrices>[] = [{ base: 'BTC', platform: 'binance', highestPrice: 50000 }];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockHighestPrices);

      const result = await ShadService.getHighestPrices();

      expect(MongodbService.getData).toHaveBeenCalledWith(config?.collection?.highestPrices);
      expect(result).toEqual(mockHighestPrices);
    });
  });

  describe('updateHighestPrice', () => {
    it('should update the highest price for a given platform and base', async () => {
      const platform = 'binance';
      const base = 'BTC';
      const price = 60000;

      await ShadService.updateHighestPrice(platform, base, price);

      expect(databaseOperations.updateOneUpsert).toHaveBeenCalledWith(
        config?.collection?.highestPrices,
        { base, platform },
        {
          $set: {
            base,
            platform,
            highestPrice: price
          },
        },
        { upsert: true }
      );
    });
  });
});