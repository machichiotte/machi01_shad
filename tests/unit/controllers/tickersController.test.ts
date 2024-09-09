import { Request, Response } from 'express';
import * as tickersService from '@services/tickersService';
import { handleErrorResponse } from "@utils/errorUtil";
import { getAllTickers, getAllTickersByPlatform, getAllTickersBySymbolFromPlatform, updateAllTickers } from '@controllers/tickersController';

jest.mock('@services/tickersService');
jest.mock('@utils/errorUtil');

describe('Tickers Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
  });

  describe('getAllTickers', () => {
    it('devrait renvoyer tous les tickers', async () => {
      const mockData = [{ id: 1, name: 'BTC' }];
      (tickersService.fetchDatabaseTickers as jest.Mock).mockResolvedValue(mockData);

      await getAllTickers(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(mockData);
    });

    it('devrait gérer les erreurs', async () => {
      const mockError = new Error('Erreur de test');
      (tickersService.fetchDatabaseTickers as jest.Mock).mockRejectedValue(mockError);

      await getAllTickers(mockRequest as Request, mockResponse as Response);

      expect(handleErrorResponse).toHaveBeenCalledWith(mockResponse, mockError, "getAllTickers");
    });
  });

  describe('getAllTickersByPlatform', () => {
    it('devrait renvoyer les tickers pour une plateforme spécifique', async () => {
      const mockData = [{ id: 1, name: 'BTC', platform: 'binance' }];
      (tickersService.getAllTickersByPlatform as jest.Mock).mockResolvedValue(mockData);

      await getAllTickersByPlatform(mockRequest as Request, mockResponse as Response, 'binance');

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockData);
    });

    // ... Ajoutez un test d'erreur similaire à celui de getAllTickers
  });

  describe('getAllTickersBySymbolFromPlatform', () => {
    it('devrait renvoyer les tickers filtrés par symbole et plateforme', async () => {
      const mockData = [{ id: 1, name: 'BTC', platform: 'binance', symbol: 'BTCUSDT' }];
      (tickersService.getAllTickersBySymbolFromPlatform as jest.Mock).mockResolvedValue(mockData);

      await getAllTickersBySymbolFromPlatform(mockRequest as Request, mockResponse as Response, 'binance', 'BTCUSDT');

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockData);
    });

    // ... Ajoutez un test d'erreur
  });

  describe('updateAllTickers', () => {
    it('devrait mettre à jour tous les tickers', async () => {
      const mockData = [{ id: 1, name: 'BTC', updated: true }];
      (tickersService.updateAllTickers as jest.Mock).mockResolvedValue(mockData);

      await updateAllTickers(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockData);
    });

    // ... Ajoutez un test d'erreur
  });
});