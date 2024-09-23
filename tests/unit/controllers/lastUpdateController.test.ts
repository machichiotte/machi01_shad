import { Request, Response } from 'express'
import {
  getUniqueLastUpdate,
  getLastUpdate,
  updateLastUpdateByType
} from '@controllers/lastUpdateController'
import { MongodbService } from '@services/mongodbService'
import {
  LastUpdateService
} from '@services/lastUpdateService'

jest.mock('@services/mongodbService')
jest.mock('@services/lastUpdateService')

describe('lastUpdateController', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockJson: jest.Mock

  beforeEach(() => {
    mockJson = jest.fn()
    mockRequest = {}
    mockResponse = {
      json: mockJson,
      status: jest.fn().mockReturnThis()
    }
  })

  describe('getUniqueLastUpdate', () => {
    it('devrait retourner la dernière mise à jour unique', async () => {
      mockRequest.params = { platform: 'testPlatfom', type: 'testType', timestamp: '2023-01-01' }
        ; (MongodbService.findData as jest.Mock).mockResolvedValue([
          { platform: 'testPlatfom', type: 'testType', timestamp: '2023-01-01' }
        ])

      await getUniqueLastUpdate(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockJson).toHaveBeenCalledWith({
        platform: 'testPlatfom',
        type: 'testType',
        timestamp: '2023-01-01'
      })
    })

    it("devrait retourner un horodatage nul si aucune mise à jour n'est trouvée", async () => {
      mockRequest.params = { platform: 'test', type: 'testType' }
        ; (MongodbService.findData as jest.Mock).mockResolvedValue([])

      await getUniqueLastUpdate(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockJson).toHaveBeenCalledWith({
        platform: 'test',
        type: 'testType',
        timestamp: null
      })
    })
  })

  describe('getLastUpdate', () => {
    it('devrait retourner toutes les dernières mises à jour', async () => {
      const mockData = [
        { platform: 'test1', type: 'type1' },
        { platform: 'test2', type: 'type2' }
      ]

        ; (LastUpdateService.fetchDatabaseLastUpdate as jest.Mock).mockResolvedValue(mockData)

      await getLastUpdate(mockRequest as Request, mockResponse as Response)

      expect(mockJson).toHaveBeenCalledWith({

        message: 'Dernières mises à jour récupérées',
        data: mockData
      })
    })
  })

  describe('updateLastUpdateByType', () => {
    it('devrait mettre à jour la dernière mise à jour et retourner les détails', async () => {
      mockRequest.params = { platform: 'test', type: 'testType' }

      // Simuler la date actuelle
      const mockDate = new Date('2023-01-01T00:00:00.000Z')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate)

        ; (LastUpdateService.saveLastUpdateToDatabase as jest.Mock).mockResolvedValue({
          platform: 'test',
          type: 'testType',
          timestamp: mockDate.toISOString()
        })

      await updateLastUpdateByType(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(LastUpdateService.saveLastUpdateToDatabase).toHaveBeenCalledWith('testType', 'test')
      expect(mockJson).toHaveBeenCalledWith({
        message: "Dernière mise à jour mise à jour",
        data: {
          platform: 'test',
          type: 'testType',
          timestamp: mockDate.toISOString()
        }
      })

      // Restaurer l'implémentation originale de Date
      jest.spyOn(global, 'Date').mockRestore()
    })
  })
})
