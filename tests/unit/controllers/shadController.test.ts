import { Request, Response } from 'express'
import { getShad, handleTrailingStopHedge } from '../../../src/controllers/shadController'
import { ShadService } from '../../../src/services/shadService'
import { TrailingStopService } from '../../../src/services/trailingStopService';
import { handleControllerError } from '../../../src/utils/errorUtil'

// Mock des dépendances
jest.mock('../../../src/services/shadService')
jest.mock('../../../src/utils/errorUtil')
jest.mock('../../../src/services/trailingStopService');

describe('shadController', () => {
  describe('getShad', () => {
    let mockRequest: Partial<Request>
    let mockResponse: Partial<Response>
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
      mockRequest = {}
      mockResponse = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis()
      }
      jest.clearAllMocks()
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('devrait renvoyer les données Shad avec succès', async () => {
      const mockData = [{ id: 1, name: 'Test' }]
        ; (ShadService.fetchShadInDatabase as jest.Mock).mockResolvedValue(mockData)

      await getShad(mockRequest as Request, mockResponse as Response)

      expect(ShadService.fetchShadInDatabase).toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Données Shad récupérées', data: mockData })
    })

    it('devrait gérer les erreurs correctement', async () => {
      const mockError = new Error('Erreur de test')
        ; (ShadService.fetchShadInDatabase as jest.Mock).mockRejectedValue(mockError)

      await getShad(mockRequest as Request, mockResponse as Response)

      expect(ShadService.fetchShadInDatabase).toHaveBeenCalled()
      expect(handleControllerError).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'getShad'
      )
    })
  })

  describe('handleTrailingStopHedge', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;

    beforeEach(() => {
      mockJson = jest.fn();
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: mockJson,
      };
    });

    it('devrait gérer les actifs sélectionnés correctement', async () => {
      const mockSelectedAssets = [{ base: 'BTC', platform: 'binance' }];
      mockRequest = {
        params: {
          simplifiedSelectedAssets: JSON.stringify(mockSelectedAssets),
        },
      };

      const mockData = { success: true };
      (TrailingStopService.handleTrailingStopHedge as jest.Mock).mockResolvedValue(mockData);

      await handleTrailingStopHedge(mockRequest as Request, mockResponse as Response);

      expect(TrailingStopService.handleTrailingStopHedge).toHaveBeenCalledWith(mockSelectedAssets);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Mise à jour des ordres de trailing stop terminée',
        data: mockData,
      });
    });

    it('devrait gérer le cas où aucun actif sélectionné n\'est fourni', async () => {
      mockRequest = { params: {} };

      const mockData = { success: true };
      (TrailingStopService.handleTrailingStopHedge as jest.Mock).mockResolvedValue(mockData);

      await handleTrailingStopHedge(mockRequest as Request, mockResponse as Response);

      expect(TrailingStopService.handleTrailingStopHedge).toHaveBeenCalledWith(undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Mise à jour des ordres de trailing stop terminée',
        data: mockData,
      });
    });

    it('devrait gérer les erreurs correctement', async () => {
      mockRequest = { params: {} };

      const mockError = new Error('Erreur test');
      (TrailingStopService.handleTrailingStopHedge as jest.Mock).mockRejectedValue(mockError);

      await handleTrailingStopHedge(mockRequest as Request, mockResponse as Response);

      expect(handleControllerError).toHaveBeenCalledWith(mockResponse, mockError, 'handleTrailingStopHedge');
    });
  });
});