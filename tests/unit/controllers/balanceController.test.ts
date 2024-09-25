import { Request, Response } from 'express'
import { getBalances, updateCurrentBalance } from '../../../src/controllers/balanceController';
import { BalanceService } from '../../../src/services/balanceService'
import { handleControllerError } from '../../../src/utils/errorUtil';
import { PLATFORM } from '../../../src/types/platform';

jest.mock('../../../src/services/balanceService')
jest.mock('../../../src/utils/errorUtil')

describe('balanceController', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseObject: { json: jest.Mock; status: jest.Mock }

  beforeEach(() => {
    mockRequest = {}
    responseObject = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    }
    mockResponse = responseObject
  })

  describe('getBalances', () => {
    it('should return balance data with status 200 on success', async () => {
      const mockData = { balance: 1000 };
      (BalanceService.fetchDatabaseBalance as jest.Mock).mockResolvedValue(mockData);

      await getBalances(mockRequest as Request, mockResponse as Response);

      expect(BalanceService.fetchDatabaseBalance).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Le solde en base de données a été récupéré avec succès.',
        data: mockData
      });
    });

    it('should handle error and call handleControllerError on failure', async () => {
      const mockError = new Error('Database error');
      (BalanceService.fetchDatabaseBalance as jest.Mock).mockRejectedValue(mockError);

      await getBalances(mockRequest as Request, mockResponse as Response);

      expect(handleControllerError).toHaveBeenCalledWith(mockResponse, mockError, 'getBalances');
    });
  });

  describe('updateCurrentBalance', () => {
    it('should return 400 if platform is not supported', async () => {
      mockRequest.params = { platform: 'unsupported_platform' };

      await updateCurrentBalance(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'La plateforme unsupported_platform n\'est pas supportée. Veuillez spécifier une plateforme valide.',
      });
    });

    it('should update balance and return status 200 on success', async () => {
      const mockPlatform = 'binance' as PLATFORM;
      const mockData = { balance: 1500 };
      mockRequest.params = { platform: mockPlatform };
      (BalanceService.updateBalanceForPlatform as jest.Mock).mockResolvedValue(mockData);

      await updateCurrentBalance(mockRequest as Request, mockResponse as Response);

      expect(BalanceService.updateBalanceForPlatform).toHaveBeenCalledWith(mockPlatform);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Le solde actuel a été mis à jour avec succès.',
        data: mockData
      });
    });

    it('should handle error and call handleControllerError on failure', async () => {
      const mockPlatform = 'binance' as PLATFORM;
      const mockError = new Error('API error');
      mockRequest.params = { platform: mockPlatform };
      (BalanceService.updateBalanceForPlatform as jest.Mock).mockRejectedValue(mockError);

      await updateCurrentBalance(mockRequest as Request, mockResponse as Response);

      expect(handleControllerError).toHaveBeenCalledWith(mockResponse, mockError, 'updateCurrentBalance');
    });
  });
});