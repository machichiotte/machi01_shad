import { BalanceService } from '@services/balanceService';
import { MongodbService } from '@services/mongodbService';
import { createPlatformInstance } from '@utils/platformUtil';
import { loadErrorPolicies, shouldRetry, handleServiceError } from '@utils/errorUtil';
import { DatabaseService } from '@services/databaseService';
import { MappingService } from '@services/mapping';
import { ProcessorService } from '@services/processorService';
import { MappedBalance } from '@models/dbTypes';

jest.mock('@services/mongodb');
jest.mock('@utils/platformUtil');
jest.mock('@utils/errorUtil');
jest.mock('@utils/controllerUtil');
jest.mock('@services/databaseService');
jest.mock('@services/mapping');
jest.mock('@services/processorService');

describe('balanceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchDatabaseBalances', () => {
    it('should return mapped balances from database', async () => {
      const mockBalances = [{ platform: 'test', base: 'BTC', balance: 1 }];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockBalances);

      const result = await BalanceService.fetchDatabaseBalances();

      expect(result).toEqual(mockBalances);
      expect(MongodbService.getData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_BALANCE);
    });
  });

  describe('fetchDatabaseBalancesByPlatform', () => {
    it('should return balances filtered by platform', async () => {
      const mockBalances = [
        { platform: 'test1', base: 'BTC', balance: 1 },
        { platform: 'test2', base: 'ETH', balance: 2 }
      ];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockBalances);

      const result = await BalanceService.fetchDatabaseBalancesByPlatform('test1');

      expect(result).toEqual([mockBalances[0]]);
    });

    it('should retry on error if shouldRetry returns true', async () => {
      (MongodbService.getData as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
      (MongodbService.getData as jest.Mock).mockResolvedValueOnce([{ platform: 'test', base: 'BTC', balance: 1 }]);
      (shouldRetry as jest.Mock).mockReturnValueOnce(true);
      (loadErrorPolicies as jest.Mock).mockResolvedValue({});

      await BalanceService.fetchDatabaseBalancesByPlatform('test');

      expect(MongodbService.getData).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchCurrentBalancesByPlatform', () => {
    it('should fetch and map current balances', async () => {
      const mockPlatformInstance = { fetchBalance: jest.fn().mockResolvedValue({ BTC: { free: 1 } }) };
      (createPlatformInstance as jest.Mock).mockReturnValue(mockPlatformInstance);
      (MappingService.mapBalance as jest.Mock).mockReturnValue([{ base: 'BTC', balance: 1 }]);

      const result = await BalanceService.fetchCurrentBalancesByPlatform('test');

      expect(result).toEqual([{ base: 'BTC', balance: 1 }]);
      expect(createPlatformInstance).toHaveBeenCalledWith('test');
      expect(mockPlatformInstance.fetchBalance).toHaveBeenCalled();
      expect(MappingService.mapBalance).toHaveBeenCalledWith('test', { BTC: { free: 1 } });
    });
  });

  describe('saveDatabaseBalance', () => {
    it('should call DatabaseService.saveDataToDatabase with correct parameters', async () => {
      const mockMappedData = [{ base: 'BTC', balance: 1 }];

      await BalanceService.saveDatabaseBalance(mockMappedData as MappedBalance[], 'test');

      expect(DatabaseService.saveDataToDatabase).toHaveBeenCalledWith(
        mockMappedData,
        process.env.MONGODB_COLLECTION_BALANCE,
        'test',
        process.env.TYPE_BALANCE
      );
    });
  });

  describe('updateBalanceForPlatform', () => {
    it('should fetch current balances and save them to database', async () => {
      const mockCurrentBalances = [{ base: 'BTC', balance: 1 }];
      jest.spyOn(BalanceService, 'fetchCurrentBalancesByPlatform').mockResolvedValue(mockCurrentBalances as MappedBalance[]);
      jest.spyOn(BalanceService, 'saveDatabaseBalance').mockResolvedValue();

      const result = await BalanceService.updateBalanceForPlatform('test');

      expect(result).toEqual(mockCurrentBalances);
      expect(BalanceService.fetchCurrentBalancesByPlatform).toHaveBeenCalledWith('test');
      expect(BalanceService.saveDatabaseBalance).toHaveBeenCalledWith(mockCurrentBalances, 'test');
    });
  });

  describe('updateBalancesForPlatform', () => {
    it('should update balances and process changes if differences are found', async () => {
      const mockCurrentBalances = [{ base: 'BTC', balance: 2 }];
      const mockPreviousBalances = [{ base: 'BTC', balance: 1 }];
      const mockDifferences = [{ base: 'BTC', difference: 1 }];

      jest.spyOn(BalanceService, 'fetchCurrentBalancesByPlatform').mockResolvedValue(mockCurrentBalances as MappedBalance[]);
      jest.spyOn(BalanceService, 'fetchDatabaseBalancesByPlatform').mockResolvedValue(mockPreviousBalances as MappedBalance[]);
      (ProcessorService.compareBalances as jest.Mock).mockReturnValue(mockDifferences);
      jest.spyOn(BalanceService, 'saveDatabaseBalance').mockResolvedValue();
      jest.spyOn(ProcessorService, 'processBalanceChanges').mockResolvedValue();

      await BalanceService.updateBalancesForPlatform('test');

      expect(BalanceService.fetchCurrentBalancesByPlatform).toHaveBeenCalledWith('test', 3);
      expect(BalanceService.fetchDatabaseBalancesByPlatform).toHaveBeenCalledWith('test', 3);
      expect(ProcessorService.compareBalances).toHaveBeenCalledWith(mockPreviousBalances, mockCurrentBalances);
      expect(BalanceService.saveDatabaseBalance).toHaveBeenCalledWith(mockCurrentBalances, 'test');
      expect(ProcessorService.processBalanceChanges).toHaveBeenCalledWith(mockDifferences, 'test');
    });

    it('should not process changes if no differences are found', async () => {
      jest.spyOn(BalanceService, 'fetchCurrentBalancesByPlatform').mockResolvedValue([]);
      jest.spyOn(BalanceService, 'fetchDatabaseBalancesByPlatform').mockResolvedValue([]);
      (ProcessorService.compareBalances as jest.Mock).mockReturnValue([]);

      await BalanceService.updateBalancesForPlatform('test');

      expect(BalanceService.saveDatabaseBalance).not.toHaveBeenCalled();
      expect(ProcessorService.processBalanceChanges).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      jest.spyOn(BalanceService, 'fetchCurrentBalancesByPlatform').mockRejectedValue(new Error('Test error'));

      await BalanceService.updateBalancesForPlatform('test');

      expect(handleServiceError).toHaveBeenCalledWith(
        expect.any(Error),
        'updateBalancesForPlatform',
        'Erreur lors de la mise à jour des balances pour test'
      );
    });
  });
});