import { Request, Response } from 'express'
import { getMarkets } from '@controllers/marketsController'
import { MarketsService } from '@services/marketsService'
import { handleControllerError } from '@utils/errorUtil'

jest.mock('@services/marketsService')
jest.mock('@utils/errorUtil')
jest.mock('@utils/loggerUtil')

describe('getMarkets', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    }
  })

  it('devrait renvoyer les données de marché sauvegardées', async () => {
    const mockData = [{ id: 1, name: 'Market 1' }];
    (MarketsService.getSavedMarkets as jest.Mock).mockResolvedValue(mockData)

    await getMarkets(mockRequest as Request, mockResponse as Response)

    expect(MarketsService.getSavedMarkets).toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Données de marché récupérées',
      data: mockData
    })
  })

  it('devrait gérer les erreurs correctement', async () => {
    const mockError = new Error('Erreur test')
      ; (MarketsService.getSavedMarkets as jest.Mock).mockRejectedValue(mockError)

    await getMarkets(mockRequest as Request, mockResponse as Response)

    expect(handleControllerError).toHaveBeenCalledWith(
      mockResponse,
      mockError,
      'getMarkets'
    )
  })
})
