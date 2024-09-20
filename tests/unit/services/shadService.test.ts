import { ShadService } from '@services/shadService';
import { MongodbService } from '@services/mongodbService';
import { databaseOperations } from '@services/databaseOperationsService';
import { ShadData, HighestPrices } from '@models/dbTypes';

jest.mock('@services/mongodb');
jest.mock('@services/databaseOperationsService');

describe('ShadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchShadInDatabase', () => {
    it('should fetch SHAD data from the database', async () => {
      const mockShadData: Partial<ShadData>[] = [{ id: '1', data: 'test' }];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockShadData);

      const result = await ShadService.fetchShadInDatabase();

      expect(MongodbService.getData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_SHAD);
      expect(result).toEqual(mockShadData);
    });
  });

  describe('getHighestPrices', () => {
    it('should fetch highest prices from the database', async () => {
      const mockHighestPrices: Partial<HighestPrices>[] = [{ base: 'BTC', platform: 'binance', highestPrice: 50000 }];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockHighestPrices);

      const result = await ShadService.getHighestPrices();

      expect(MongodbService.getData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_HIGHEST_PRICES);
      expect(result).toEqual(mockHighestPrices);
    });
  });

  describe('updateHighestPrice', () => {
    it('should update the highest price for a given platform and base', async () => {
      const platform = 'binance';
      const base = 'BTC';
      const price = 60000;

      await ShadService.updateHighestPrice(platform, base, price);

      expect(databaseOperations.updateOneOne).toHaveBeenCalledWith(
        process.env.MONGODB_COLLECTION_HIGHEST_PRICES,
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