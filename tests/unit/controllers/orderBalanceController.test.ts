import { Request, Response } from 'express'
import { getOrders } from '../../../src/controllers/orderBalanceController'
import { OrderBalanceService } from '../../../src/services/orderBalanceService'
import { handleControllerError } from '../../../src/utils/errorUtil'

jest.mock('../../../src/services/orderBalanceService')
jest.mock('../../../src/utils/errorUtil')

describe('orderBalanceController', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    }
  })

  describe('getOrders', () => {
    it('devrait renvoyer les commandes avec un statut 200', async () => {
      const mockOrders = [{ id: 1 }, { id: 2 }];
      (OrderBalanceService.fetchDatabaseOrders as jest.Mock).mockResolvedValue(
        mockOrders
      )

      await getOrders(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Ordres récupérés',
        data: mockOrders
      })
    })

    it('devrait gérer les erreurs', async () => {
      const mockError = new Error('Erreur de test')
        ; (OrderBalanceService.fetchDatabaseOrders as jest.Mock).mockRejectedValue(
          mockError
        )

      await getOrders(mockRequest as Request, mockResponse as Response)

      expect(handleControllerError).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'getOrders'
      )
    })
  })

  // Ajoutez des tests similaires pour les autres fonctions du contrôleur
})
