import { Request, Response } from 'express'
import { OrdersService } from '@services/ordersService'
import { handleErrorResponse } from '@utils/errorUtil'
import { getOrders } from '@controllers/ordersController'

jest.mock('@services/ordersService')
jest.mock('@utils/errorUtil')

describe('ordersController', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockJson: jest.Mock
  let mockStatus: jest.Mock

  beforeEach(() => {
    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnValue({ json: mockJson })
    mockRequest = {}
    mockResponse = {
      status: mockStatus,
      json: mockJson
    }
  })

  describe('getOrders', () => {
    it('devrait renvoyer les commandes avec un statut 200', async () => {
      const mockOrders = [{ id: 1 }, { id: 2 }]
        ; (OrdersService.fetchDatabaseOrders as jest.Mock).mockResolvedValue(
          mockOrders
        )

      await getOrders(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith(mockOrders)
    })

    it('devrait gérer les erreurs', async () => {
      const mockError = new Error('Erreur de test')
        ; (OrdersService.fetchDatabaseOrders as jest.Mock).mockRejectedValue(
          mockError
        )

      await getOrders(mockRequest as Request, mockResponse as Response)

      expect(handleErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'getOrders'
      )
    })
  })

  // Ajoutez des tests similaires pour les autres fonctions du contrôleur
})
