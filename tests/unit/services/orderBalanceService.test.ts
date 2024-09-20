import { OrderBalanceService } from '@services/orderBalanceService'
import { DatabaseService } from '@services/databaseService'
import { MongodbService } from '@services/mongodbService'
import { MappingService } from '@services/mappingService'
import * as errorUtil from '@utils/errorUtil'
import { MappedOrder } from '@models/dbTypes'
import { Order } from 'ccxt'

jest.mock('@utils/platformUtil')
jest.mock('@services/mongodbService')
jest.mock('@services/databaseService')
jest.mock('@services/mappingService')
jest.mock('@utils/errorUtil')

describe('OrderBalanceService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchDatabaseOrders', () => {
    it('should fetch orders from the database', async () => {
      const mockOrders: Partial<MappedOrder>[] = [{ _id: '1', symbol: 'BTC/USDT' }]
      jest.spyOn(MongodbService, 'getData').mockResolvedValue(mockOrders)

      const result = await OrderBalanceService.fetchDatabaseOrders()

      expect(MongodbService.getData).toHaveBeenCalledWith(process.env.MONGODB_COLLECTION_ACTIVE_ORDERS)
      expect(result).toEqual(mockOrders)
    })
  })

  describe('fetchAndMapOrders', () => {
    it('should fetch and map orders for a given platform', async () => {
      const platform = 'binance'
      const mockOrders: Partial<Order>[] = [{ id: '1', symbol: 'BTC/USDT' }]
      const mockMappedOrders: Partial<MappedOrder>[] = [{ _id: '1', symbol: 'BTC/USDT', platform: 'binance' }]

      jest.spyOn(OrderBalanceService, 'fetchOpenOrdersByPlatform').mockResolvedValue(mockOrders as Order[])
      jest.spyOn(MappingService, 'mapOrders').mockReturnValue(mockMappedOrders as MappedOrder[])

      const result = await OrderBalanceService.fetchAndMapOrders(platform)

      expect(OrderBalanceService.fetchOpenOrdersByPlatform).toHaveBeenCalledWith(platform)
      expect(MappingService.mapOrders).toHaveBeenCalledWith(platform, mockOrders)
      expect(result).toEqual(mockMappedOrders)
    })

    it('should handle errors', async () => {
      const platform = 'binance'
      const error = new Error('Test error')

      jest.spyOn(OrderBalanceService, 'fetchOpenOrdersByPlatform').mockRejectedValue(error)
      jest.spyOn(errorUtil, 'handleServiceError')

      await expect(OrderBalanceService.fetchAndMapOrders(platform)).rejects.toThrow(error)
      expect(errorUtil.handleServiceError).toHaveBeenCalledWith(error, 'fetchAndMapOrders', `Error fetching and mapping orders for ${platform}`)
    })
  })

  describe('updateOrdersFromServer', () => {
    it('should update orders from the server for a given platform', async () => {
      const platform = 'binance'
      const mockMappedOrders: Partial<MappedOrder>[] = [{ _id: '1', symbol: 'BTC/USDT', platform: 'binance' }]

      jest.spyOn(OrderBalanceService, 'fetchAndMapOrders').mockResolvedValue(mockMappedOrders as MappedOrder[])
      jest.spyOn(DatabaseService, 'saveDataToDatabase').mockResolvedValue()

      const result = await OrderBalanceService.updateOrdersFromServer(platform)

      expect(OrderBalanceService.fetchAndMapOrders).toHaveBeenCalledWith(platform)
      expect(DatabaseService.saveDataToDatabase).toHaveBeenCalledWith(mockMappedOrders, process.env.MONGODB_COLLECTION_ACTIVE_ORDERS, platform, process.env.TYPE_ACTIVE_ORDERS)
      expect(result).toEqual(mockMappedOrders)
    })

    it('should handle errors', async () => {
      const platform = 'binance'
      const error = new Error('Test error')

      jest.spyOn(OrderBalanceService, 'fetchAndMapOrders').mockRejectedValue(error)
      jest.spyOn(errorUtil, 'handleServiceError')

      await expect(OrderBalanceService.updateOrdersFromServer(platform)).rejects.toThrow(error)
      expect(errorUtil.handleServiceError).toHaveBeenCalledWith(error, 'updateOrdersFromServer', `Error updating orders from server for ${platform}`)
    })
  })

  describe('fetchOpenOrdersByPlatform', () => {

  })

  describe('fetchOpenOrdersForKucoin', () => {

  })
})