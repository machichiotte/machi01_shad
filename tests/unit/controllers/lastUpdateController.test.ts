import { Request, Response } from 'express';
import { getUniqueLastUpdate, getLastUpdate, updateLastUpdateByType } from '@controllers/lastUpdateController';
import { getDataMDB } from '@services/mongodbService';
import { fetchDatabaseLastUpdate, saveLastUpdateToDatabase } from '@services/lastUpdateService';

jest.mock('@services/mongodbService');
jest.mock('@services/lastUpdateService');

describe('lastUpdateController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getUniqueLastUpdate', () => {
    it('devrait retourner la dernière mise à jour unique', async () => {
      mockRequest.params = { platform: 'test', type: 'testType' };
      (getDataMDB as jest.Mock).mockResolvedValue([{ platform: 'test', type: 'testType', timestamp: '2023-01-01' }]);

      await getUniqueLastUpdate(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ platform: 'test', type: 'testType', timestamp: '2023-01-01' });
    });

    it('devrait retourner un horodatage nul si aucune mise à jour n\'est trouvée', async () => {
      mockRequest.params = { platform: 'test', type: 'testType' };
      (getDataMDB as jest.Mock).mockResolvedValue([]);

      await getUniqueLastUpdate(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ platform: 'test', type: 'testType', timestamp: null });
    });
  });

  describe('getLastUpdate', () => {
    it('devrait retourner toutes les dernières mises à jour', async () => {
      const mockData = [{ platform: 'test1', type: 'type1' }, { platform: 'test2', type: 'type2' }];
      (fetchDatabaseLastUpdate as jest.Mock).mockResolvedValue(mockData);

      await getLastUpdate(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(mockData);
    });
  });

  describe('updateLastUpdateByType', () => {
    it('devrait mettre à jour la dernière mise à jour et retourner les détails', async () => {
      mockRequest.params = { platform: 'test', type: 'testType' };
      jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-01-01T00:00:00.000Z').valueOf());

      await updateLastUpdateByType(mockRequest as Request, mockResponse as Response);

      expect(saveLastUpdateToDatabase).toHaveBeenCalledWith('testType', 'test');
      expect(mockJson).toHaveBeenCalledWith({
        platform: 'test',
        type: 'testType',
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });
  });
});