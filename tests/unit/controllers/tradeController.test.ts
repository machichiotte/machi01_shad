import { Request, Response } from 'express';
import { TradeService } from '../../../src/services/tradeService';
import { handleControllerError } from '../../../src/utils/errorUtil';
import { isValidPlatform } from '../../../src/utils/platformUtil';
import {
  updateTradeById,
  getTrades,
  addTradesManually,
  updateTrades,
  fetchLastTrades,
  saveTradesToDatabase,
  saveAllTradesToDatabase
} from '../../../src/controllers/tradeController';

jest.mock('../../../src/services/tradeService');
jest.mock('../../../src/utils/errorUtil');
jest.mock('../../../src/utils/platformUtil');

describe('Trade Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    mockRequest = {};
  });

  describe('getTrades', () => {
    it('should return trades successfully', async () => {
      const mockTrades = [{ id: '1', symbol: 'BTC/USD' }];
      (TradeService.fetchDatabaseTrades as jest.Mock).mockResolvedValue(mockTrades);

      await getTrades(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Trades récupérés', data: mockTrades });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      (TradeService.fetchDatabaseTrades as jest.Mock).mockRejectedValue(mockError);

      await getTrades(mockRequest as Request, mockResponse as Response);

      expect(handleControllerError).toHaveBeenCalledWith(mockResponse, mockError, 'getTrades');
    });
  });

  describe('updateTradeById', () => {
    it('should update trade successfully', async () => {
      const mockUpdatedTrade = { id: '1', symbol: 'ETH/USD' };
      mockRequest.params = { tradeId: '1' };
      mockRequest.body = mockUpdatedTrade;
      (TradeService.updateTradeById as jest.Mock).mockResolvedValue(mockUpdatedTrade);

      await updateTradeById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Trade 1 mis à jour', data: mockUpdatedTrade });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Update error');
      mockRequest.params = { tradeId: '1' };
      mockRequest.body = { symbol: 'ETH/USD' };
      (TradeService.updateTradeById as jest.Mock).mockRejectedValue(mockError);

      await updateTradeById(mockRequest as Request, mockResponse as Response);

      expect(handleControllerError).toHaveBeenCalledWith(mockResponse, mockError, 'updateTradeById');
    });
  });

  describe('addTradesManually', () => {
    it('should add trades successfully', async () => {
      const mockTradesData = [{ symbol: 'BTC/USD' }, { symbol: 'ETH/USD' }];
      mockRequest.body = { trades_data: mockTradesData };
      (TradeService.addTradesManually as jest.Mock).mockResolvedValue(mockTradesData);

      await addTradesManually(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Trades ajoutés', data: mockTradesData });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Add trades error');
      mockRequest.body = { trades_data: [] };
      (TradeService.addTradesManually as jest.Mock).mockRejectedValue(mockError);

      await addTradesManually(mockRequest as Request, mockResponse as Response);

      expect(handleControllerError).toHaveBeenCalledWith(mockResponse, mockError, 'addTradesManually');
    });
  });

  describe('updateTrades', () => {
    it('should update trades successfully', async () => {
      const mockUpdatedTrades = [{ id: '1', symbol: 'BTC/USDT' }];
      mockRequest.params = { platform: 'binance' };
      (isValidPlatform as jest.MockedFunction<typeof isValidPlatform>).mockReturnValue(true);
      (TradeService.updateTrades as jest.Mock).mockResolvedValue(mockUpdatedTrades);

      await updateTrades(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Trades mis à jour', data: mockUpdatedTrades });
    });

    it('should return 400 for invalid platform', async () => {
      mockRequest.params = { platform: 'invalid' };
      (isValidPlatform as jest.MockedFunction<typeof isValidPlatform>).mockReturnValue(true);

      await updateTrades(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: "La plateforme 'invalid' n'est pas valide." });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Update trades error');
      mockRequest.params = { platform: 'binance' };
      (isValidPlatform as jest.MockedFunction<typeof isValidPlatform>).mockReturnValue(true);
      (TradeService.updateTrades as jest.Mock).mockRejectedValue(mockError);

      await updateTrades(mockRequest as Request, mockResponse as Response);

      expect(handleControllerError).toHaveBeenCalledWith(mockResponse, mockError, 'updateTrades');
    });
  });

  describe('fetchLastTrades', () => {
    it('should fetch last trades successfully', async () => {
      const mockLastTrades = [{ id: '1', symbol: 'BTC/USD' }];
      mockRequest.params = { platform: 'binance', symbol: 'BTC/USD' };
      (isValidPlatform as jest.MockedFunction<typeof isValidPlatform>).mockReturnValue(true);
      (TradeService.fetchLastTrades as jest.Mock).mockResolvedValue(mockLastTrades);

      await fetchLastTrades(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Derniers trades récupérés', data: mockLastTrades });
    });

    it('should return 400 for invalid platform', async () => {
      mockRequest.params = { platform: 'invalid', symbol: 'BTC/USD' };
      (isValidPlatform as jest.MockedFunction<typeof isValidPlatform>).mockReturnValue(true);

      await fetchLastTrades(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: "La plateforme 'invalid' n'est pas valide." });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Fetch last trades error');
      mockRequest.params = { platform: 'binance', symbol: 'BTC/USD' };
      (isValidPlatform as jest.MockedFunction<typeof isValidPlatform>).mockReturnValue(true);
      (TradeService.fetchLastTrades as jest.Mock).mockRejectedValue(mockError);

      await fetchLastTrades(mockRequest as Request, mockResponse as Response);

      expect(handleControllerError).toHaveBeenCalledWith(mockResponse, mockError, 'fetchLastTrades');
    });
  });

  describe('saveTradesToDatabase', () => {
    it('should save trades successfully', async () => {
      const mockNewTrades = [{ symbol: 'BTC/USD' }, { symbol: 'ETH/USD' }];
      mockRequest.body = { newTrades: mockNewTrades };
      (TradeService.saveTradesToDatabase as jest.Mock).mockResolvedValue(undefined);

      await saveTradesToDatabase(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Trades sauvegardés avec succès' });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Save trades error');
      mockRequest.body = { newTrades: [] };
      (TradeService.saveTradesToDatabase as jest.Mock).mockRejectedValue(mockError);

      await saveTradesToDatabase(mockRequest as Request, mockResponse as Response);

      expect(handleControllerError).toHaveBeenCalledWith(mockResponse, mockError, 'saveTradesToDatabase');
    });
  });

  describe('saveAllTradesToDatabase', () => {
    it('should save all trades successfully', async () => {
      const mockNewTrades = [{ symbol: 'BTC/USD' }, { symbol: 'ETH/USD' }];
      mockRequest.body = { newTrades: mockNewTrades };
      (TradeService.saveTradesToDatabase as jest.Mock).mockResolvedValue(undefined);

      await saveAllTradesToDatabase(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Tous les trades sauvegardés avec succès' });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Save all trades error');
      mockRequest.body = { newTrades: [] };
      (TradeService.saveTradesToDatabase as jest.Mock).mockRejectedValue(mockError);

      await saveAllTradesToDatabase(mockRequest as Request, mockResponse as Response);

      expect(handleControllerError).toHaveBeenCalledWith(mockResponse, mockError, 'saveAllTradesToDatabase');
    });
  });
});