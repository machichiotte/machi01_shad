import { Request, Response } from 'express'
import {
  getUniqueTimestamp,
  getTimestamp,
  updateTimestampByType
} from '../../../src/controllers/timestampController'
import { MongodbService } from '../../../src/services/mongodbService'
import {
  TimestampService
} from '../../../src/services/timestampService'

jest.mock('../../../src/services/mongodbService')
jest.mock('../../../src/services/timestampService')

describe('timestampController', () => {
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

  describe('getUniqueTimestamp', () => {
    it('devrait retourner la dernière mise à jour unique', async () => {
      mockRequest.params = { platform: 'testPlatfom', type: 'testType', timestamp: '2023-01-01' }
        ; (MongodbService.findData as jest.Mock).mockResolvedValue([
          { platform: 'testPlatfom', type: 'testType', timestamp: '2023-01-01' }
        ])

      await getUniqueTimestamp(
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

      await getUniqueTimestamp(
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

  describe('getTimestamp', () => {
    it('devrait retourner toutes les dernières mises à jour', async () => {
      const mockData = [
        { platform: 'test1', type: 'type1' },
        { platform: 'test2', type: 'type2' }
      ]

        ; (TimestampService.fetchDatabaseTimestamp as jest.Mock).mockResolvedValue(mockData)

      await getTimestamp(mockRequest as Request, mockResponse as Response)

      expect(mockJson).toHaveBeenCalledWith({

        message: 'Dernières mises à jour récupérées',
        data: mockData
      })
    })
  })

  describe('updateTimestampByType', () => {
    it('devrait mettre à jour la dernière mise à jour et retourner les détails', async () => {
      mockRequest.params = { platform: 'test', type: 'testType' }

      // Simuler la date actuelle
      const mockDate = new Date('2023-01-01T00:00:00.000Z')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate)

        ; (TimestampService.saveTimestampToDatabase as jest.Mock).mockResolvedValue({
          platform: 'test',
          type: 'testType',
          timestamp: mockDate.toISOString()
        })

      await updateTimestampByType(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(TimestampService.saveTimestampToDatabase).toHaveBeenCalledWith('testType', 'test')
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
