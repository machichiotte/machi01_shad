import { StrategyService } from '@services/strategyService';
import { LastUpdateService } from '@services/lastUpdateService';
import { MongodbService } from '@services/mongodbService';
import { MappedStrategy } from '@models/dbTypes';
import { InsertManyResult } from 'mongodb';
import { handleServiceError } from '@utils/errorUtil';

jest.mock('@services/lastUpdateService');
jest.mock('@services/mongodbService');
jest.mock('@utils/errorUtil');

describe('StrategyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchDatabaseStrategies', () => {
    it('should fetch strategies from the database', async () => {
      const mockStrategies: Partial<MappedStrategy>[] = [
        { _id: '1', asset: 'BTC' },
        { _id: '2', asset: 'ETH' },
      ];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockStrategies);

      const result = await StrategyService.fetchDatabaseStrategies();

      expect(MongodbService.getData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_STRAT);
      expect(result).toEqual(mockStrategies);
    });
  });

  describe('updateStrategyById', () => {
    it('should update a strategy by its ID', async () => {
      const strategyId = '1';
      const updatedStrategy: Partial<MappedStrategy> = { strategies: { 'binance': 'Shad' } };
      (MongodbService.updateDataMDB as jest.Mock).mockResolvedValue(true);

      const result = await StrategyService.updateStrategyById(strategyId, updatedStrategy);

      expect(MongodbService.updateDataMDB).toHaveBeenCalledWith(
        process.env.MONGODB_COLLECTION_STRAT,
        { _id: strategyId },
        { $set: updatedStrategy }
      );
      expect(result).toBe(true);
    });

    it('should throw an error if strategyId is not provided', async () => {
      await expect(StrategyService.updateStrategyById(undefined, {})).rejects.toThrow('L\'ID de la stratégie est requis');
    });

    it('should handle errors when updating a strategy', async () => {
      const strategyId = '1';
      const updatedStrategy: Partial<MappedStrategy> = { asset: 'Updated Strategy' };
      const mockError = new Error('Update error');
      (MongodbService.updateDataMDB as jest.Mock).mockRejectedValue(mockError);

      await expect(StrategyService.updateStrategyById(strategyId, updatedStrategy)).rejects.toThrow(mockError);
      expect(handleServiceError).toHaveBeenCalledWith(mockError, 'updateStrategyById', `Error updating strategy with id ${strategyId}`);
    });
  });

  describe('updateStrategies', () => {
    it('should update all strategies in the database', async () => {
      const mockStrategies: Partial<MappedStrategy>[] = [
        { _id: '1', asset: 'BTC', strategies: { 'binance': 'Shad' }, maxExposure: { 'binance': 0.1 } },
        { _id: '2', asset: 'ETH', strategies: { 'kucoin': 'Shad' }, maxExposure: { 'kucoin': 0.1 } },
      ];
      const mockInsertResult: Partial<InsertManyResult> = { insertedCount: 2 };
      (MongodbService.deleteAllDataMDB as jest.Mock).mockResolvedValue(undefined);
      (MongodbService.saveData as jest.Mock).mockResolvedValue(mockInsertResult);
      (LastUpdateService.saveLastUpdateToDatabase as jest.Mock).mockResolvedValue(undefined);

      const result = await StrategyService.updateStrategies(mockStrategies as MappedStrategy[]);

      expect(MongodbService.deleteAllDataMDB).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_STRAT);
      expect(MongodbService.saveData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_STRAT, mockStrategies);
      expect(LastUpdateService.saveLastUpdateToDatabase).toHaveBeenCalledWith(process.env.TYPE_STRATEGY, '');
      expect(result).toEqual(mockInsertResult);
    });
  });
});