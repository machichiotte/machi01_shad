import { Request, Response } from 'express'
import { getBalances, updateCurrentBalance } from '@controllers/balanceController'
import { BalanceService } from '@src/services/balanceService'
import { handleControllerError } from '@utils/errorUtil'

jest.mock('@services/balanceService')
jest.mock('@utils/errorUtil')

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
    it('devrait renvoyer les soldes avec succès', async () => {
      const mockBalances = [{ platform: 'test', balance: 100 }]
        ; (BalanceService.fetchDatabaseBalances as jest.Mock).mockResolvedValue(
          mockBalances
        )

      await getBalances(mockRequest as Request, mockResponse as Response)

      expect(responseObject.json).toHaveBeenCalledWith({
        data: mockBalances,
        message: 'Le solde en base de données a été récupéré avec succès.'
      })
    })

    it('devrait gérer les erreurs correctement', async () => {
      const mockError = new Error('Erreur de test')
        ; (BalanceService.fetchDatabaseBalances as jest.Mock).mockRejectedValue(
          mockError
        )

      await getBalances(mockRequest as Request, mockResponse as Response)

      expect(handleControllerError).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'getBalances'
      )
    })
  })

  describe('updateCurrentBalance', () => {
    it('devrait mettre à jour le solde avec succès', async () => {
      mockRequest.params = { platform: 'testPlatform' }
      const mockUpdatedBalance = { platform: 'testPlatform', balance: 200 }
        ; (BalanceService.updateBalanceForPlatform as jest.Mock).mockResolvedValue(
          mockUpdatedBalance
        )

      await updateCurrentBalance(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Le solde actuel a été mis à jour avec succès.',
        data: mockUpdatedBalance
      })
    })

    it('devrait gérer les erreurs correctement', async () => {
      mockRequest.params = { platform: 'testPlatform' }
      const mockError = new Error('Erreur de test')
        ; (BalanceService.updateBalanceForPlatform as jest.Mock).mockRejectedValue(
          mockError
        )

      await updateCurrentBalance(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(handleControllerError).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'updateCurrentBalance'
      )
    })
  })
})