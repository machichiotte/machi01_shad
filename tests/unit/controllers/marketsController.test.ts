import { Request, Response } from 'express';
import { getMarkets } from '@controllers/marketsController';
import { getSavedMarkets } from '@services/marketsService';
import { handleErrorResponse } from '@utils/errorUtil';
import { errorLogger } from '@utils/loggerUtil';

jest.mock('@services/marketsService');
jest.mock('@utils/errorUtil');
jest.mock('@utils/loggerUtil');

describe('getMarkets', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockJson = jest.fn();
    mockResponse = {
      json: mockJson,
    };
  });

  it('devrait renvoyer les données de marché sauvegardées', async () => {
    const mockData = [{ id: 1, name: 'Market 1' }];
    (getSavedMarkets as jest.Mock).mockResolvedValue(mockData);

    await getMarkets(mockRequest as Request, mockResponse as Response);

    expect(getSavedMarkets).toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith(mockData);
  });

  it('devrait gérer les erreurs correctement', async () => {
    const mockError = new Error('Erreur test');
    (getSavedMarkets as jest.Mock).mockRejectedValue(mockError);

    await getMarkets(mockRequest as Request, mockResponse as Response);

    expect(errorLogger.error).toHaveBeenCalledWith(
      "Échec de la récupération des données de marché.",
      { error: mockError.message }
    );
    expect(handleErrorResponse).toHaveBeenCalledWith(mockResponse, mockError, "getMarkets");
  });
});