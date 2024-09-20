import { CmcService } from '@services/cmcService';
import { getData } from '@utils/dataUtil';
import { LastUpdateService } from '@services/lastUpdateService';
import { deleteAllDataMDB, saveData } from '@services/mongodbService';
import { handleServiceError } from '@utils/errorUtil';
import { MappedCmc } from '@models/dbTypes';

jest.mock('@utils/dataUtil');
jest.mock('@services/lastUpdateService');
jest.mock('@services/mongodbService');
jest.mock('@utils/errorUtil');

describe('cmcService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCurrentCmc', () => {
    it('should fetch and return CMC data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: [{ id: 1, name: 'Bitcoin' }],
          status: { total_count: 1 }
        })
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await CmcService.fetchCurrentCmc();

      expect(result).toEqual([{ id: 1, name: 'Bitcoin' }]);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, statusText: 'Not Found' });

      await expect(CmcService.fetchCurrentCmc()).rejects.toThrow('Échec de la récupération des données CoinMarketCap: Not Found');
      expect(handleServiceError).toHaveBeenCalled();
    });
  });

  describe('fetchDatabaseCmc', () => {
    it('should fetch CMC data from the database', async () => {
      const mockData = [{ id: 1, name: 'Bitcoin' }];
      (getData as jest.Mock).mockResolvedValue(mockData);

      const result = await CmcService.fetchDatabaseCmc();

      expect(result).toEqual(mockData);
      expect(getData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_CMC);
    });
  });

  describe('updateDatabaseCmcData', () => {
    it('should update CMC data in the database', async () => {
      const mockData = [{ id: 1, name: 'Bitcoin' }];
      (deleteAllDataMDB as jest.Mock).mockResolvedValue({ deletedCount: 1 });
      (saveData as jest.Mock).mockResolvedValue({ insertedCount: 1 });

      const result = await CmcService.updateDatabaseCmcData(mockData as MappedCmc[]);

      expect(result).toEqual(expect.objectContaining({
        status: true,
        message: 'Données CMC mises à jour avec succès',
        data: mockData
      }));
      expect(deleteAllDataMDB).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_CMC);
      expect(saveData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_CMC, mockData);
      expect(LastUpdateService.saveLastUpdateToDatabase).toHaveBeenCalled();
    });

    it('should handle database update errors', async () => {
      (deleteAllDataMDB as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(CmcService.updateDatabaseCmcData([])).rejects.toThrow('Database error');
      expect(handleServiceError).toHaveBeenCalled();
    });
  });

  describe('updateCmcData', () => {
    it('should fetch new CMC data and update the database', async () => {
      const mockData = [{ id: 1, name: 'Bitcoin' }];
      jest.spyOn(CmcService, 'fetchCurrentCmc').mockResolvedValue(mockData as MappedCmc[]);
      jest.spyOn(CmcService, 'updateDatabaseCmcData').mockResolvedValue({ status: true });

      const result = await CmcService.updateCmcData();

      expect(result).toEqual({ status: true });
      expect(CmcService.fetchCurrentCmc).toHaveBeenCalled();
      expect(CmcService.updateDatabaseCmcData).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors during CMC data update', async () => {
      jest.spyOn(CmcService, 'fetchCurrentCmc').mockRejectedValue(new Error('API error'));

      await expect(CmcService.updateCmcData()).rejects.toThrow('API error');
      expect(handleServiceError).toHaveBeenCalled();
    });
  });
});