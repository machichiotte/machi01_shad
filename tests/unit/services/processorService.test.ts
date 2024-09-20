import { ProcessorService } from '@services/processorService'
import { TradeService } from '@services/tradeService'
import { TickerService } from '@services/tickerService'
import { OrderBalanceService } from '@services/orderBalanceService'
import * as processorUtil from '@utils/processorUtil'
import * as errorUtil from '@utils/errorUtil'
import { QUOTE_CURRENCIES } from '@src/constants'
import { MappedTicker, MappedTrade } from '@src/models/dbTypes'

jest.mock('@services/tradeService')
jest.mock('@services/tickerService')
jest.mock('@services/orderBalanceService')
jest.mock('@services/cmcService')
jest.mock('@services/strategyService')
jest.mock('@services/balanceService')
jest.mock('@utils/processorUtil')
jest.mock('@utils/platformUtil')
jest.mock('@utils/errorUtil')

describe('ProcessorService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('processBalanceChanges', () => {
    it('should process balance changes correctly', async () => {
      const mockDifferences = [{ base: 'BTC', platform: 'binance', newSymbol: true }]
      const mockPlatform = 'binance'
      const mockTickers = [{ symbol: 'BTC/USDT', platform: 'binance' }] as MappedTicker[]
      const mockTrades = [{ _id: '1', base: 'BTC', platform: 'binance' }] as MappedTrade[]

      jest.spyOn(OrderBalanceService, 'updateOrdersFromServer').mockResolvedValue(mockTrades)
      jest.spyOn(TickerService, 'getAllTickersByPlatform').mockResolvedValue(mockTickers)
      jest.spyOn(processorUtil, 'removeDuplicateDifferences').mockReturnValue(mockDifferences)
      jest.spyOn(ProcessorService, 'processDifference').mockResolvedValue()
      jest.spyOn(TradeService, 'saveTradesToDatabase').mockResolvedValue()

      await ProcessorService.processBalanceChanges(mockDifferences, mockPlatform)

      expect(OrderBalanceService.updateOrdersFromServer).toHaveBeenCalledWith(mockPlatform)
      expect(TickerService.getAllTickersByPlatform).toHaveBeenCalledWith(mockPlatform)
      expect(processorUtil.removeDuplicateDifferences).toHaveBeenCalledWith(mockDifferences)
      expect(ProcessorService['processDifference']).toHaveBeenCalledWith(
        mockDifferences[0],
        mockPlatform,
        mockTickers,
        QUOTE_CURRENCIES,
        expect.any(Array)
      )
      expect(TradeService.saveTradesToDatabase).toHaveBeenCalled()
    })

    it('should handle errors correctly', async () => {
      const mockError = new Error('Test error')
      jest.spyOn(OrderBalanceService, 'updateOrdersFromServer').mockRejectedValue(mockError)
      jest.spyOn(errorUtil, 'handleServiceError').mockImplementation()

      await expect(ProcessorService.processBalanceChanges([], 'binance')).rejects.toThrow(mockError)
      expect(errorUtil.handleServiceError).toHaveBeenCalledWith(mockError, 'processBalanceChanges', expect.any(String))
    })
  })

  describe('calculateAllMetrics', () => {
    it('should calculate all metrics correctly', async () => {
      const mockDbData = [
        [{ symbol: 'BTC', quote: { USD: { price: 50000 } } }],
        [{ asset: 'BTC', strategies: { binance: true }, maxExposure: {} }],
        [{ base: 'BTC', platform: 'binance' }],
        [{ symbol: 'BTC/USDT', platform: 'binance' }],
        [{ symbol: 'BTC/USDT', platform: 'binance' }],
        [{ base: 'BTC', platform: 'binance', balance: 1 }]
      ]
      jest.spyOn(ProcessorService, 'fetchAllDatabaseData').mockResolvedValue(mockDbData)
      jest.spyOn(processorUtil, 'areAllDataValid').mockReturnValue(true)
      jest.spyOn(ProcessorService, 'calculateAssetMetricsForBalance').mockReturnValue({ asset: 'BTC', platform: 'binance' })
      jest.spyOn(processorUtil, 'isValidAssetMetrics').mockReturnValue(true)

      const result = await ProcessorService.calculateAllMetrics()

      expect(result).toEqual([{ asset: 'BTC', platform: 'binance' }])
      expect(ProcessorService['fetchAllDatabaseData']).toHaveBeenCalled()
      expect(processorUtil.areAllDataValid).toHaveBeenCalledWith(...mockDbData)
      expect(ProcessorService['calculateAssetMetricsForBalance']).toHaveBeenCalled()
      expect(processorUtil.isValidAssetMetrics).toHaveBeenCalled()
    })

    it('should return empty array if data is not valid', async () => {
      jest.spyOn(ProcessorService, 'fetchAllDatabaseData').mockResolvedValue([])
      jest.spyOn(processorUtil, 'areAllDataValid').mockReturnValue(false)

      const result = await ProcessorService.calculateAllMetrics()

      expect(result).toEqual([])
    })
  })

  describe('compareBalances', () => {
    it('should compare balances correctly', () => {
      const lastBalances = [
        { platform: 'binance', base: 'BTC', balance: 1 },
        { platform: 'binance', base: 'ETH', balance: 2 }
      ]
      const currentBalances = [
        { platform: 'binance', base: 'BTC', balance: 1.5 },
        { platform: 'binance', base: 'XRP', balance: 100 }
      ]
      const expectedDifferences = [
        { base: 'BTC', platform: 'binance', balanceDifference: true },
        { base: 'XRP', platform: 'binance', newSymbol: true },
        { base: 'ETH', platform: 'binance', zeroBalance: true }
      ]

      jest.spyOn(processorUtil, 'removeDuplicatesAndStablecoins').mockReturnValue(expectedDifferences)

      const result = ProcessorService.compareBalances(lastBalances, currentBalances)

      expect(result).toEqual(expectedDifferences)
      expect(processorUtil.removeDuplicatesAndStablecoins).toHaveBeenCalledWith(expect.any(Array))
    })
  })
})