import { TradeService } from '@services/tradeService';
import { createPlatformInstance } from '@utils/platformUtil';
import { handleServiceError } from '@utils/errorUtil';
import { MongodbService } from '@services/mongodbService';
import { LastUpdateService } from '@services/lastUpdateService';
import { MappedTrade } from '@models/dbTypes';
import { Trade } from 'ccxt';

jest.mock('@utils/platformUtil');
jest.mock('@utils/errorUtil');
jest.mock('@services/mongodbService');
jest.mock('@services/lastUpdateService');
jest.mock('@services/mapping');

describe('TradeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchDatabaseTrades', () => {
    it('should fetch trades from the database', async () => {
      const mockTrades: Partial<MappedTrade>[] = [{ _id: '1', base: 'BTC', amount: 1, price: 50000, type: 'buy', timestamp: 1234567890 }];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockTrades);

      const result = await TradeService.fetchDatabaseTrades();

      expect(MongodbService.getData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_TRADES);
      expect(result).toEqual(mockTrades);
    });
  });

  describe('fetchLastTrades', () => {
    it('should fetch last trades for a given platform and symbol', async () => {
      const platform = 'binance';
      const symbol = 'BTC/USDT';
      const mockTrades: Partial<Trade>[] = [{ id: '1', symbol: 'BTC/USDT', amount: 1, price: 50000, side: 'buy', timestamp: 1234567890 }];
      const mockPlatformInstance = {
        fetchMyTrades: jest.fn().mockResolvedValue(mockTrades),
      };
      (createPlatformInstance as jest.Mock).mockReturnValue(mockPlatformInstance);

      const result = await TradeService.fetchLastTrades(platform, symbol);

      expect(createPlatformInstance).toHaveBeenCalledWith(platform);
      expect(mockPlatformInstance.fetchMyTrades).toHaveBeenCalledWith(symbol);
      expect(result).toEqual(mockTrades);
    });

    it('should handle errors when fetching last trades', async () => {
      const platform = 'binance';
      const symbol = 'BTC/USDT';
      const mockError = new Error('Fetch error');
      (createPlatformInstance as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      await expect(TradeService.fetchLastTrades(platform, symbol)).rejects.toThrow(mockError);
      expect(handleServiceError).toHaveBeenCalledWith(mockError, 'fetchLastTrades', `Error fetching last trades for ${platform}`);
    });
  });

  describe('updateTradeById', () => {
    it('should update a trade by its ID', async () => {
      const tradeId = '1';
      const updatedTrade: Partial<MappedTrade> = { amount: 2 };
      (MongodbService.updateDataMDB as jest.Mock).mockResolvedValue(true);

      const result = await TradeService.updateTradeById(tradeId, updatedTrade);

      expect(MongodbService.updateDataMDB).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_TRADES, { _id: tradeId }, { $set: updatedTrade });
      expect(result).toBe(true);
    });

    it('should throw an error if tradeId is not provided', async () => {
      await expect(TradeService.updateTradeById('', {})).rejects.toThrow('L\'ID du trade est requis');
    });

    it('should handle errors when updating a trade', async () => {
      const tradeId = '1';
      const updatedTrade: Partial<MappedTrade> = { amount: 2 };
      const mockError = new Error('Update error');
      (MongodbService.updateDataMDB as jest.Mock).mockRejectedValue(mockError);

      await expect(TradeService.updateTradeById(tradeId, updatedTrade)).rejects.toThrow(mockError);
      expect(handleServiceError).toHaveBeenCalledWith(mockError, 'updateTradeById', `Error updating trade with id ${tradeId}`);
    });
  });

  describe('updateTrades', () => {
    it('should update trades for a given platform', async () => {
      const platform = 'binance';
      const mockMappedTrades: Partial<MappedTrade>[] = [{ _id: '1', base: 'BTC', amount: 1, price: 50000, type: 'buy', timestamp: 1234567890 }];
      jest.spyOn(TradeService, 'fetchPlatformTrades').mockResolvedValue(mockMappedTrades as MappedTrade[]);
      (MongodbService.deleteAndSaveData as jest.Mock).mockResolvedValue(undefined);
      (LastUpdateService.saveLastUpdateToDatabase as jest.Mock).mockResolvedValue(undefined);

      const result = await TradeService.updateTrades(platform);

      expect(TradeService.fetchPlatformTrades).toHaveBeenCalledWith(platform);
      expect(MongodbService.deleteAndSaveData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_TRADES, mockMappedTrades, platform);
      expect(LastUpdateService.saveLastUpdateToDatabase).toHaveBeenCalledWith(process.env.TYPE_TRADES, platform);
      expect(result).toEqual({ data: mockMappedTrades });
    });

    it('should handle errors when updating trades', async () => {
      const platform = 'binance';
      const mockError = new Error('Update error');
      jest.spyOn(TradeService, 'fetchPlatformTrades').mockRejectedValue(mockError);

      await expect(TradeService.updateTrades(platform)).rejects.toThrow(mockError);
      expect(handleServiceError).toHaveBeenCalledWith(mockError, 'updateTrades', `Error updating trades for ${platform}`);
    });
  });

  // Add more tests for other methods...
});