import { fetchDatabaseSwapMigration, handleMigrationSwaps } from '@services/migrationSwapService';
import { MongodbService } from '@services/mongodbService';
import { MappedTrade, MappedStrategy, SwapMigration } from '@models/dbTypes';
import { StrategyService } from '@services/strategyService';
import { TradeService } from '@services/tradeService';
import { handleServiceError } from '@utils/errorUtil';

jest.mock('@services/mongodb');
jest.mock('@services/strategyService');
jest.mock('@services/tradeService');
jest.mock('@utils/errorUtil');

describe('migrationSwapService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchDatabaseSwapMigration', () => {
    it('devrait récupérer les données de migration de swap', async () => {
      const mockSwaps: Partial<SwapMigration>[] = [
        { oldAsset: 'BTC', newAsset: 'ETH', swapRate: '1:10', platform: 'binance', delistingDate: '2023-07-01' }
      ];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockSwaps);

      const result = await fetchDatabaseSwapMigration();

      expect(result).toEqual(mockSwaps);
      expect(MongodbService.getData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_SWAP);
    });
  });

  describe('handleMigrationSwaps', () => {
    it('devrait gérer les swaps de migration', async () => {
      const mockSwaps: Partial<SwapMigration>[] = [
        { oldAsset: 'BTC', newAsset: 'ETH', swapRate: '1:10', platform: 'binance', delistingDate: '2023-07-01' }
      ];
      const mockTrades: Partial<MappedTrade>[] = [
        { _id: '1', base: 'BTC', pair: 'BTC/USDT', amount: 1, total: 50000, fee: 0.1, feecoin: 'BTC', platform: 'binance' }
      ];
      const mockStrategies: Partial<MappedStrategy>[] = [
        { _id: '1', asset: 'BTC', strategies: { binance: 'Shad' } }
      ];

      jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-07-02').valueOf());
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockSwaps);
      (TradeService.fetchDatabaseTrades as jest.Mock).mockResolvedValue(mockTrades);
      (StrategyService.fetchDatabaseStrategies as jest.Mock).mockResolvedValue(mockStrategies);

      await handleMigrationSwaps();

      expect(TradeService.updateTradeById).toHaveBeenCalledWith('1', expect.objectContaining({
        base: 'ETH',
        pair: 'ETH/USDT',
        amount: 10,
        price: 5000,
        fee: 1,
        feecoin: 'ETH',
        swap: true
      }));
      expect(StrategyService.updateStrategyById).toHaveBeenCalledWith('1', { asset: 'ETH' });
    });

    it('devrait ignorer les swaps dont la date de delisting n\'est pas dépassée', async () => {
      const mockSwaps: Partial<SwapMigration>[] = [
        { oldAsset: 'BTC', newAsset: 'ETH', swapRate: '1:10', platform: 'binance', delistingDate: '2023-07-03' }
      ];
      jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-07-02').valueOf());
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockSwaps);
      (TradeService.fetchDatabaseTrades as jest.Mock).mockResolvedValue([]);
      (StrategyService.fetchDatabaseStrategies as jest.Mock).mockResolvedValue([]);

      await handleMigrationSwaps();

      expect(TradeService.updateTradeById).not.toHaveBeenCalled();
      expect(StrategyService.updateStrategyById).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs correctement', async () => {
      const mockError = new Error('Test error');
      (MongodbService.getData as jest.Mock).mockRejectedValue(mockError);

      await handleMigrationSwaps();

      expect(handleServiceError).toHaveBeenCalledWith(mockError, 'handleMigrationSwaps', 'Error handling swaps');
    });
  });
});