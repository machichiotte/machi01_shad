import { Request, Response } from 'express';
import { getStrat, updateStrat, updateStrategyById } from '@controllers/strategyController';
import * as strategyService from '@services/strategyService';
import * as lastUpdateService from '@services/lastUpdateService';
import { handleErrorResponse } from '@utils/errorUtil';

jest.mock('@services/strategyService');
jest.mock('@services/lastUpdateService');
jest.mock('@utils/errorUtil');

describe('strategyController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockSend = jest.fn();
    mockResponse = {
      json: mockJson,
      status: mockStatus,
      send: mockSend,
    };
    mockRequest = {};
  });

  describe('getStrat', () => {
    it('devrait renvoyer les stratégies avec succès', async () => {
      const mockData = [{ id: 1, name: 'Stratégie 1' }];
      (strategyService.fetchDatabaseStrategies as jest.Mock).mockResolvedValue(mockData);

      await getStrat(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(mockData);
    });

    it('devrait gérer les erreurs', async () => {
      const mockError = new Error('Erreur de test');
      (strategyService.fetchDatabaseStrategies as jest.Mock).mockRejectedValue(mockError);

      await getStrat(mockRequest as Request, mockResponse as Response);

      expect(handleErrorResponse).toHaveBeenCalledWith(mockResponse, mockError, 'getStrat');
    });
  });

  describe('updateStrat', () => {
    it('devrait mettre à jour les stratégies avec succès', async () => {
      const mockStrat = { id: 1, name: 'Stratégie mise à jour' };
      mockRequest.body = mockStrat;
      const mockData = { success: true };
      (strategyService.updateStrategies as jest.Mock).mockResolvedValue(mockData);

      await updateStrat(mockRequest as Request, mockResponse as Response);

      expect(strategyService.updateStrategies).toHaveBeenCalledWith(mockStrat);
      expect(lastUpdateService.saveLastUpdateToDatabase).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockData);
    });

    it('devrait gérer les erreurs', async () => {
      const mockError = new Error('Erreur de mise à jour');
      (strategyService.updateStrategies as jest.Mock).mockRejectedValue(mockError);

      await updateStrat(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith({ error: 'Error: Erreur de mise à jour' });
    });
  });

  describe('updateStrategyById', () => {
    it('devrait mettre à jour une stratégie spécifique avec succès', async () => {
      const mockStrategyId = '1';
      const mockUpdatedStrategy = { name: 'Stratégie mise à jour' };
      mockRequest.params = { strategyId: mockStrategyId };
      mockRequest.body = mockUpdatedStrategy;
      const mockResult = { success: true };
      (strategyService.updateStrategyById as jest.Mock).mockResolvedValue(mockResult);

      await updateStrategyById(mockRequest as Request, mockResponse as Response);

      expect(strategyService.updateStrategyById).toHaveBeenCalledWith(mockStrategyId, mockUpdatedStrategy);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it('devrait gérer les erreurs', async () => {
      const mockError = new Error('Erreur de mise à jour');
      (strategyService.updateStrategyById as jest.Mock).mockRejectedValue(mockError);

      await updateStrategyById(mockRequest as Request, mockResponse as Response);

      expect(handleErrorResponse).toHaveBeenCalledWith(mockResponse, mockError, 'updateStrategyById');
    });
  });
});