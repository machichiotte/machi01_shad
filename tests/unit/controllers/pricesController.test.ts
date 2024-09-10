import { Request, Response } from 'express'
import { getPriceBtc, getPriceEth } from '@controllers/pricesController'
import { getData } from '@utils/dataUtil'

jest.mock('@utils/dataUtil')

describe('pricesController', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    }
    process.env.MONGODB_COLLECTION_PRICE_BTC = 'btc_collection'
    process.env.MONGODB_COLLECTION_PRICE_ETH = 'eth_collection'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getPriceBtc', () => {
    it('devrait appeler getData avec la collection BTC', async () => {
      await getPriceBtc(mockRequest as Request, mockResponse as Response)
      expect(getData).toHaveBeenCalledWith('btc_collection')
    })
  })

  describe('getPriceEth', () => {
    it('devrait appeler getData avec la collection ETH', async () => {
      await getPriceEth(mockRequest as Request, mockResponse as Response)
      expect(getData).toHaveBeenCalledWith('eth_collection')
    })
  })

  describe('getPrice', () => {
    it("devrait lancer une erreur si la collection n'est pas définie", async () => {
      delete process.env.MONGODB_COLLECTION_PRICE_BTC
      await expect(
        getPriceBtc(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(
        "La collection MONGODB_COLLECTION_PRICE_BTC n'est pas définie dans les variables d'environnement."
      )
    })
  })
})
