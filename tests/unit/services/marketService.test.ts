import { MarketService } from '@services/marketService';
import { createPlatformInstance } from '@utils/platformUtil';
import { LastUpdateService } from '@services/lastUpdateService';
import { MongodbService } from '@services/mongodbService';
import { MappingService } from '@services/mapping';
import { MappedMarket } from '@models/dbTypes';
import { handleServiceError } from '@utils/errorUtil';

jest.mock('@services/mongodb');
jest.mock('@utils/platformUtil');
jest.mock('@services/lastUpdateService');
jest.mock('@services/mongodbService');
jest.mock('@services/mapping');
jest.mock('@services/databaseService');
jest.mock('@utils/errorUtil');

describe('MarketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCurrentMarkets', () => {
    it('devrait récupérer et mapper les marchés actuels', async () => {
      const mockPlatformInstance = {
        fetchMarkets: jest.fn().mockResolvedValue([{ id: 'BTC/USDT' }])
      };
      (createPlatformInstance as jest.Mock).mockReturnValue(mockPlatformInstance);
      (MappingService.mapMarkets as jest.Mock).mockReturnValue([{ symbol: 'BTC/USDT', platform: 'binance' }]);

      const result = await MarketService.fetchCurrentMarkets('binance');

      expect(createPlatformInstance).toHaveBeenCalledWith('binance');
      expect(mockPlatformInstance.fetchMarkets).toHaveBeenCalled();
      expect(MappingService.mapMarkets).toHaveBeenCalledWith('binance', [{ id: 'BTC/USDT' }]);
      expect(result).toEqual([{ symbol: 'BTC/USDT', platform: 'binance' }]);
    });
  });

  describe('updateMarketsForPlatform', () => {
    it('devrait mettre à jour les marchés pour une plateforme spécifiée', async () => {
      const mockCurrentMarkets: Partial<MappedMarket>[] = [{ symbol: 'BTC/USDT', platform: 'binance' }];
      jest.spyOn(MarketService, 'fetchCurrentMarkets').mockResolvedValue(mockCurrentMarkets as MappedMarket[]);
      (MongodbService.deleteAndSaveData as jest.Mock).mockResolvedValue(undefined);
      (LastUpdateService.saveLastUpdateToDatabase as jest.Mock).mockResolvedValue(undefined);

      await MarketService.updateMarketsForPlatform('binance');

      expect(MarketService.fetchCurrentMarkets).toHaveBeenCalledWith('binance');
      expect(MongodbService.deleteAndSaveData).toHaveBeenCalledWith(expect.any(String), mockCurrentMarkets, 'binance');
      expect(LastUpdateService.saveLastUpdateToDatabase).toHaveBeenCalledWith(expect.any(String), 'binance');
    });

    it('devrait gérer les erreurs correctement', async () => {
      const mockError = new Error('Test error');
      jest.spyOn(MarketService, 'fetchCurrentMarkets').mockRejectedValue(mockError);

      await MarketService.updateMarketsForPlatform('binance');

      expect(handleServiceError).toHaveBeenCalledWith(mockError, 'updateMarketsForPlatform', expect.any(String));
    });
  });

  describe('getSavedMarkets', () => {
    it('devrait récupérer les dernières données de marché de la base de données', async () => {
      const mockMarkets: Partial<MappedMarket>[] = [{ symbol: 'BTC/USDT', platform: 'binance' }];
      (MongodbService.getData as jest.Mock).mockResolvedValue(mockMarkets as MappedMarket[]);

      const result = await MarketService.getSavedMarkets();

      expect(MongodbService.getData).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual(mockMarkets);
    });
  });
});