import { TickerService } from '@services/tickerService';
import { createPlatformInstance, getPlatforms } from '@utils/platformUtil';
import { loadErrorPolicies, shouldRetry, } from '@utils/errorUtil';
import { LastUpdateService } from '@services/lastUpdateService';
import { MongodbService } from '@services/mongodbService';
import { MappingService } from '@services/mappingService';
import { MappedTicker } from '@models/dbTypes';

jest.mock('@utils/platformUtil');
jest.mock('@utils/errorUtil');
jest.mock('@services/lastUpdateService');
jest.mock('@services/mongodbService');
jest.mock('@services/databaseService');
jest.mock('@services/mappingService');

describe('TickerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchDatabaseTickers', () => {
    it('should fetch tickers from the database', async () => {
      const mockTickers: Partial<MappedTicker>[] = [
        { symbol: 'BTC/USDT', last: 50000, platform: 'binance' },
        { symbol: 'ETH/USDT', last: 3000, platform: 'binance' },
      ];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockTickers);

      const result = await TickerService.fetchDatabaseTickers();

      expect(MongodbService.getData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_TICKERS);
      expect(result).toEqual(mockTickers);
    });
  });

  describe('getFilteredTickers', () => {
    it('should return filtered tickers for a specific platform', async () => {
      const mockTickers: Partial<MappedTicker>[] = [
        { symbol: 'BTC/USDT', last: 50000, platform: 'binance' },
        { symbol: 'ETH/USDT', last: 3000, platform: 'binance' },
        { symbol: 'BTC/USDT', last: 49000, platform: 'kucoin' },
      ];
      jest.spyOn(TickerService, 'fetchDatabaseTickers').mockResolvedValue(mockTickers as MappedTicker[]);

      const result = await TickerService.getFilteredTickers('binance');

      expect(result).toEqual([
        { symbol: 'BTC/USDT', last: 50000, platform: 'binance' },
        { symbol: 'ETH/USDT', last: 3000, platform: 'binance' },
      ]);
    });

    it('should throw an error if no data is found', async () => {
      jest.spyOn(TickerService, 'fetchDatabaseTickers').mockResolvedValue([]);

      await expect(TickerService.getFilteredTickers('binance')).rejects.toThrow('No data found');
    });
  });

  describe('updateAllTickers', () => {
    it('should update tickers for all platforms', async () => {
      const mockPlatforms = ['binance', 'kucoin'];
      (getPlatforms as jest.Mock).mockReturnValue(mockPlatforms);

      const mockInstance = {
        fetchTickers: jest.fn().mockResolvedValue({ 'BTC/USDT': { last: 50000 } }),
      };
      (createPlatformInstance as jest.Mock).mockReturnValue(mockInstance);

      const mockMappedTickers: Partial<MappedTicker>[] = [{ symbol: 'BTC/USDT', last: 50000, platform: 'binance' }];
      (MappingService.mapTickers as jest.Mock).mockReturnValue(mockMappedTickers as MappedTicker[]);

      await TickerService.updateAllTickers();

      expect(MongodbService.deleteAndProcessData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_TICKERS, expect.any(Array), '', true);
      expect(LastUpdateService.saveLastUpdateToDatabase).toHaveBeenCalledWith(process.env.TYPE_TICKERS, 'combined');
    });
  });

  describe('fetchCurrentTickers', () => {
    it('should fetch current tickers for a platform', async () => {
      const mockInstance = {
        fetchTickers: jest.fn().mockResolvedValue({ 'BTC/USDT': { last: 50000 } }),
      };
      (createPlatformInstance as jest.Mock).mockReturnValue(mockInstance);

      const mockMappedTickers: Partial<MappedTicker>[] = [{ symbol: 'BTC/USDT', last: 50000, platform: 'binance' }];
      (MappingService.mapTickers as jest.Mock).mockReturnValue(mockMappedTickers);

      const result = await TickerService.fetchCurrentTickers('binance');

      expect(result).toEqual(mockMappedTickers);
    });

    it('should retry on error if conditions are met', async () => {
      const mockError = new Error('Network error');
      const mockInstance = {
        fetchTickers: jest.fn().mockRejectedValue(mockError),
      };

      jest.setTimeout(10000); // Augmente le délai à 10 secondes

      (createPlatformInstance as jest.Mock).mockReturnValue(mockInstance);
      (loadErrorPolicies as jest.Mock).mockResolvedValue({});
      (shouldRetry as jest.Mock).mockReturnValue(true);

      await expect(TickerService.fetchCurrentTickers('binance')).rejects.toThrow('Network error');
      expect(mockInstance.fetchTickers).toHaveBeenCalledTimes(4); // Initial call + 3 retries
    }, 15000 // Ajoute un délai d'attente explicite de 15 secondes pour ce test
    );
  });

  // Add more test cases for other methods...
});