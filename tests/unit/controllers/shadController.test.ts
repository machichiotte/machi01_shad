import { Request, Response } from 'express';
import { getShad } from '@controllers/shadController';
import * as shadService from '@services/shadService';
import { handleErrorResponse } from '@utils/errorUtil';

jest.mock('@services/shadService');
jest.mock('@utils/errorUtil');

describe('getShad', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockJson = jest.fn();
    mockResponse = {
      json: mockJson,
    };
    jest.clearAllMocks();
  });

  it('devrait renvoyer les données Shad avec succès', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    (shadService.fetchShadInDatabase as jest.Mock).mockResolvedValue(mockData);

    await getShad(mockRequest as Request, mockResponse as Response);

    expect(shadService.fetchShadInDatabase).toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith(mockData);
  });

  it('devrait gérer les erreurs correctement', async () => {
    const mockError = new Error('Erreur de test');
    (shadService.fetchShadInDatabase as jest.Mock).mockRejectedValue(mockError);

    await getShad(mockRequest as Request, mockResponse as Response);

    expect(shadService.fetchShadInDatabase).toHaveBeenCalled();
    expect(handleErrorResponse).toHaveBeenCalledWith(mockResponse, mockError, 'getShad');
  });
});