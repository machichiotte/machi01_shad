import { Trade, Market, Order, Tickers } from 'ccxt'
import { getTotalUSDT } from '@utils/mappingUtil'
import { Balances, Ticker } from 'ccxt'
import { MappingService } from '@services/mappingService'

jest.mock('@utils/mappingUtil')

describe('Mapper', () => {
  describe('mapBalance', () => {
    it('devrait mapper correctement les balances', () => {
      const mockBalanceData: Partial<Balances> = {
        BTC: { free: 1, used: 0, total: 1 },
        ETH: { free: 2, used: 1, total: 3 },
        USDT: { free: 1000, used: 0, total: 1000 }
      }
      const result = MappingService.mapBalance('binance', mockBalanceData as Balances)
      expect(result).toEqual([
        { base: 'BTC', balance: 1, available: 1, platform: 'binance' },
        { base: 'ETH', balance: 3, available: 2, platform: 'binance' },
        { base: 'USDT', balance: 1000, available: 1000, platform: 'binance' }
      ])
    })

    it('devrait retourner un tableau vide pour des données invalides', () => {
      const result = MappingService.mapBalance('binance', null as unknown as Balances)
      expect(result).toEqual([])
    })
  })

  describe('mapTrades', () => {
    it('devrait mapper correctement les trades', () => {
      const mockTrade: Partial<Trade> = {
        symbol: 'BTC/USDT',
        timestamp: 1625097600000,
        id: '123456',
        order: '789012',
        type: 'buy',
        side: 'buy',
        price: 50000,
        amount: 1,
        cost: 50000,
        fee: { cost: 10, currency: 'USDT' },
      }
        ; (getTotalUSDT as jest.Mock).mockReturnValue(50000)
      const result = MappingService.mapTrades('binance', [mockTrade as Trade])
      expect(result).toEqual([{
        amount: 1,
        base: 'BTC',
        fee: 10,
        feecoin: 'USDT',
        pair: 'BTC/USDT',
        platform: 'binance',
        price: 50000,
        quote: 'USDT',
        timestamp: 1625097600000,
        total: 50000,
        totalUSDT: 50000,
        type: 'buy'
      }])
    })
  })

  describe('mapOrders', () => {
    it('devrait mapper correctement les ordres', () => {
      const mockOrder: Partial<Order> = {
        id: '123',
        clientOrderId: '456',
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'buy',
        amount: 1,
        price: 50000
      }
      const result = MappingService.mapOrders('binance', [mockOrder as Order])
      expect(result).toEqual([{
        oId: '123',
        cId: '456',
        platform: 'binance',
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'buy',
        amount: 1,
        price: 50000
      }])
    })
  })

  describe('mapTickers', () => {
    it('devrait mapper correctement les tickers', () => {
      const mockTickers: Partial<Record<string, Partial<Ticker>>> = {
        'BTC/USDT': {
          symbol: 'BTC/USDT',
          timestamp: 1625097600000,
          last: 50000
        }
      }
      const result = MappingService.mapTickers('binance', mockTickers as Tickers)
      expect(result).toEqual([{
        symbol: 'BTC/USDT',
        timestamp: 1625097600000,
        last: 50000,
        platform: 'binance'
      }])
    })
  })

  describe('mapMarkets', () => {
    it('devrait mapper correctement les marchés', () => {
      const mockMarket: Partial<Market> = {
        id: 'BTC/USDT',
        symbol: 'BTC/USDT',
        base: 'BTC',
        quote: 'USDT',
        active: true,
        type: 'spot',
        limits: {
          amount: { min: 0.0001, max: 1000 },
          price: { min: 0.01, max: 1000000 }
        },
        precision: { amount: 8, price: 2 }
      }
      const result = MappingService.mapMarkets('binance', [mockMarket as Market])
      expect(result).toEqual([{
        symbol: 'BTC/USDT',
        base: 'BTC',
        quote: 'USDT',
        active: true,
        type: 'spot',
        amountMin: 0.0001,
        amountMax: 1000,
        priceMin: 0.01,
        priceMax: 1000000,
        precisionAmount: 8,
        precisionPrice: 2,
        platform: 'binance'
      }])
    })
  })
})