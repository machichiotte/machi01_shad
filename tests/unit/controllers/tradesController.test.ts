import { Request, Response } from 'express'
import * as tradesService from '@services/tradesService'
import { handleErrorResponse } from '@utils/errorUtil'
import {
  getTrades,
  updateTradeById,
  addTradesManually,
  updateTrades,
  fetchLastTrades,
  saveTradesToDatabase,
  saveAllTradesToDatabase
} from '@controllers/tradesController'

jest.mock('@services/tradesService')
jest.mock('@utils/errorUtil')

describe('TradesController', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockJson: jest.Mock
  let mockStatus: jest.Mock

  beforeEach(() => {
    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnThis()
    mockResponse = {
      json: mockJson,
      status: mockStatus
    }
    mockRequest = {}
  })

  describe('getTrades', () => {
    it('devrait retourner tous les trades', async () => {
      const mockTrades = [
        {
          id: 1,
          base: 'EQX',
          quote: 'USDT',
          pair: 'EQX/USDT',
          timestamp: 1725396742065,
          type: 'buy',
          price: 0.002799,
          amount: 1532.9761,
          total: 4.2908001039,
          fee: 0.0128724003117,
          feecoin: 'USDT',
          platform: 'kucoin',
          totalUSDT: 4.2908001039
        },
        {
          id: 2,
          base: 'EQX',
          quote: 'USDT',
          pair: 'EQX/USDT',
          timestamp: 1725396742065,
          type: 'buy',
          price: 0.002799,
          amount: 1532.9761,
          total: 4.2908001039,
          fee: 0.0128724003117,
          feecoin: 'USDT',
          platform: 'kucoin',
          totalUSDT: 4.2908001039
        }
      ]
      ;(tradesService.fetchDatabaseTrades as jest.Mock).mockResolvedValue(
        mockTrades
      )

      await getTrades(mockRequest as Request, mockResponse as Response)

      expect(mockJson).toHaveBeenCalledWith(mockTrades)
    })

    it('devrait gérer les erreurs', async () => {
      const mockError = new Error('Erreur de test')
      ;(tradesService.fetchDatabaseTrades as jest.Mock).mockRejectedValue(
        mockError
      )

      await getTrades(mockRequest as Request, mockResponse as Response)

      expect(handleErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'getTrades'
      )
    })
  })

  describe('updateTradeById', () => {
    it('devrait mettre à jour un trade par son ID', async () => {
      const mockTradeId = '123'
      const mockUpdatedTrade = {
        base: 'EQX',
        quote: 'USDT',
        pair: 'EQX/USDT',
        timestamp: 1725396742065,
        type: 'buy',
        price: 0.002799,
        amount: 1532.9761,
        total: 4.2908001039,
        fee: 0.0128724003117,
        feecoin: 'USDT',
        platform: 'kucoin',
        totalUSDT: 4.2908001039
      }

      mockRequest.params = { tradeId: mockTradeId }
      mockRequest.body = mockUpdatedTrade

      ;(tradesService.updateTradeById as jest.Mock).mockResolvedValue(
        mockUpdatedTrade
      )

      await updateTradeById(mockRequest as Request, mockResponse as Response)

      expect(tradesService.updateTradeById).toHaveBeenCalledWith(
        mockTradeId,
        mockUpdatedTrade
      )
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedTrade)
    })

    it('devrait gérer les erreurs lors de la mise à jour', async () => {
      const mockError = new Error('Erreur de mise à jour')
      mockRequest.params = { id: '123' }
      mockRequest.body = { status: 'completed' }
      ;(tradesService.updateTradeById as jest.Mock).mockRejectedValue(mockError)

      await updateTradeById(mockRequest as Request, mockResponse as Response)

      expect(handleErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'updateTradeById'
      )
    })
  })

  describe('addTradesManually', () => {
    it('devrait ajouter des trades manuellement', async () => {
      const mockTrades = [
        {
          base: 'EQX',
          quote: 'USDT',
          pair: 'EQX/USDT',
          timestamp: 1725396742065,
          type: 'buy',
          price: 0.002799,
          amount: 1532.9761,
          total: 4.2908001039,
          fee: 0.0128724003117,
          feecoin: 'USDT',
          platform: 'kucoin',
          totalUSDT: 4.2908001039
        },
        {
          base: 'EQX',
          quote: 'USDT',
          pair: 'EQX/USDT',
          timestamp: 1725396685920,
          type: 'buy',
          price: 0.002799,
          amount: 9790.3127,
          total: 27.4030852473,
          fee: 0.0822092557419,
          feecoin: 'USDT',
          platform: 'kucoin',
          totalUSDT: 27.4030852473
        }
      ]
      mockRequest.body = { trades_data: mockTrades }
      const mockResult = { status: 200, message: 'Trades ajoutés avec succès' }
      ;(tradesService.addTradesManually as jest.Mock).mockResolvedValue(
        mockResult
      )

      await addTradesManually(mockRequest as Request, mockResponse as Response)

      expect(tradesService.addTradesManually).toHaveBeenCalledWith(mockTrades)
      expect(mockStatus).toHaveBeenCalledWith(mockResult.status)
      expect(mockJson).toHaveBeenCalledWith(mockResult)
    })

    it("devrait gérer les erreurs lors de l'ajout manuel", async () => {
      const mockError = new Error("Erreur d'ajout")
      mockRequest.body = [{ id: '1' }]
      ;(tradesService.addTradesManually as jest.Mock).mockRejectedValue(
        mockError
      )

      await addTradesManually(mockRequest as Request, mockResponse as Response)

      expect(handleErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'addTradesManually'
      )
    })
  })

  describe('updateTrades', () => {
    it('devrait mettre à jour plusieurs trades', async () => {
      const mockPlatform = 'testPlatform'
      const mockResult = {
        status: 200,
        message: 'Trades mis à jour avec succès'
      }

      mockRequest.params = { platform: mockPlatform }
      ;(tradesService.updateTrades as jest.Mock).mockResolvedValue(mockResult)

      await updateTrades(mockRequest as Request, mockResponse as Response)

      expect(tradesService.updateTrades).toHaveBeenCalledWith(mockPlatform)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith(mockResult)
    })

    it('devrait gérer les erreurs lors de la mise à jour multiple', async () => {
      const mockError = new Error('Erreur de mise à jour multiple')
      mockRequest.params = {}
      ;(tradesService.updateTrades as jest.Mock).mockRejectedValue(mockError)

      await updateTrades(mockRequest as Request, mockResponse as Response)

      expect(handleErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'updateTrades'
      )
    })
  })

  describe('fetchLastTrades', () => {
    it('devrait récupérer les derniers trades', async () => {
      const mockPlatform = 'binance'
      const mockSymbol = 'BTCUSDT'
      const mockTrades = [
        {
          base: 'EQX',
          quote: 'USDT',
          pair: 'EQX/USDT',
          timestamp: 1725396742065,
          type: 'buy',
          price: 0.002799,
          amount: 1532.9761,
          total: 4.2908001039,
          fee: 0.0128724003117,
          feecoin: 'USDT',
          platform: 'kucoin',
          totalUSDT: 4.2908001039
        },
        {
          base: 'EQX',
          quote: 'USDT',
          pair: 'EQX/USDT',
          timestamp: 1725396685920,
          type: 'buy',
          price: 0.002799,
          amount: 9790.3127,
          total: 27.4030852473,
          fee: 0.0822092557419,
          feecoin: 'USDT',
          platform: 'kucoin',
          totalUSDT: 27.4030852473
        }
      ]
      mockRequest.params = { platform: mockPlatform, symbol: mockSymbol }
      ;(tradesService.fetchLastTrades as jest.Mock).mockResolvedValue(
        mockTrades
      )

      await fetchLastTrades(mockRequest as Request, mockResponse as Response)

      expect(tradesService.fetchLastTrades).toHaveBeenCalledWith(
        mockPlatform,
        mockSymbol
      )
      expect(mockJson).toHaveBeenCalledWith(mockTrades)
    })

    it('devrait gérer les erreurs lors de la récupération des derniers trades', async () => {
      const mockError = new Error('Erreur de récupération')
      mockRequest.params = { platform: 'binance', symbol: 'BTCUSDT' }
      ;(tradesService.fetchLastTrades as jest.Mock).mockRejectedValue(mockError)

      await fetchLastTrades(mockRequest as Request, mockResponse as Response)

      expect(handleErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'fetchLastTrades'
      )
    })
  })

  describe('saveTradesToDatabase', () => {
    it('devrait sauvegarder les trades dans la base de données', async () => {
      const mockNewTrades = [
        {
          base: 'EQX',
          quote: 'USDT',
          pair: 'EQX/USDT',
          timestamp: 1725396742065,
          type: 'buy',
          price: 0.002799,
          amount: 1532.9761,
          total: 4.2908001039,
          fee: 0.0128724003117,
          feecoin: 'USDT',
          platform: 'kucoin',
          totalUSDT: 4.2908001039
        },
        {
          base: 'EQX',
          quote: 'USDT',
          pair: 'EQX/USDT',
          timestamp: 1725396685920,
          type: 'buy',
          price: 0.002799,
          amount: 9790.3127,
          total: 27.4030852473,
          fee: 0.0822092557419,
          feecoin: 'USDT',
          platform: 'kucoin',
          totalUSDT: 27.4030852473
        }
      ]
      mockRequest.body = { newTrades: mockNewTrades }
      ;(tradesService.saveTradesToDatabase as jest.Mock).mockResolvedValue(
        undefined
      )

      await saveTradesToDatabase(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(tradesService.saveTradesToDatabase).toHaveBeenCalledWith(
        mockNewTrades
      )
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Trades sauvegardés avec succès'
      })
    })

    it('devrait gérer les erreurs lors de la sauvegarde des trades', async () => {
      const mockError = new Error('Erreur de sauvegarde')
      mockRequest.body = { newTrades: [{ id: '1' }] }
      ;(tradesService.saveTradesToDatabase as jest.Mock).mockRejectedValue(
        mockError
      )

      await saveTradesToDatabase(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(handleErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'saveTradesToDatabase'
      )
    })
  })

  describe('saveAllTradesToDatabase', () => {
    it('devrait sauvegarder tous les trades dans la base de données', async () => {
      const mockNewTrades = [
        {
          base: 'EQX',
          quote: 'USDT',
          pair: 'EQX/USDT',
          timestamp: 1725396742065,
          type: 'buy',
          price: 0.002799,
          amount: 1532.9761,
          total: 4.2908001039,
          fee: 0.0128724003117,
          feecoin: 'USDT',
          platform: 'kucoin',
          totalUSDT: 4.2908001039
        },
        {
          base: 'EQX',
          quote: 'USDT',
          pair: 'EQX/USDT',
          timestamp: 1725396685920,
          type: 'buy',
          price: 0.002799,
          amount: 9790.3127,
          total: 27.4030852473,
          fee: 0.0822092557419,
          feecoin: 'USDT',
          platform: 'kucoin',
          totalUSDT: 27.4030852473
        }
      ]
      mockRequest.body = { newTrades: mockNewTrades }
      ;(tradesService.saveAllTradesToDatabase as jest.Mock).mockResolvedValue(
        undefined
      )

      await saveAllTradesToDatabase(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(tradesService.saveAllTradesToDatabase).toHaveBeenCalledWith(
        mockNewTrades
      )
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Tous les trades sauvegardés avec succès'
      })
    })

    it('devrait gérer les erreurs lors de la sauvegarde de tous les trades', async () => {
      const mockError = new Error('Erreur de sauvegarde')
      mockRequest.body = { newTrades: [{ id: '1' }] }
      ;(tradesService.saveAllTradesToDatabase as jest.Mock).mockRejectedValue(
        mockError
      )

      await saveAllTradesToDatabase(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(handleErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'saveAllTradesToDatabase'
      )
    })
  })
})
