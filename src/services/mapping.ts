import { Trade, Balances, Market, Order, Tickers } from 'ccxt'
import { getStableCoins, getTotalUSDT } from '@utils/mappingUtil'
import { MappedBalance, MappedTrade, MappedOrder, MappedTicker, MappedMarket } from 'src/models/dbTypes'

class Mapper {
  /**
   * Maps common balance data across all platforms.
   */
  private static mapBalanceCommon(
    base: string,
    balance: number,
    available: number,
    platform: string
  ): MappedBalance {
    return {
      base,
      balance: parseFloat(balance.toString()),
      available: parseFloat(available.toString()),
      platform
    }
  }

  /**
   * Maps balance data for a specific platform.
   */
  static mapBalance(platform: string, data: Balances): MappedBalance[] {
    const mappings: Record<string, (item: any) => MappedBalance> = {
      binance: (item) =>
        this.mapBalanceCommon(
          item.asset,
          parseFloat(item.free) + parseFloat(item.locked),
          item.free,
          platform
        ),
      kucoin: (item) =>
        this.mapBalanceCommon(item.currency, item.balance, item.available, platform),
      htx: ([key, value]) =>
        this.mapBalanceCommon(key.toUpperCase(), value.total, value.free, platform),
      okx: (item) =>
        this.mapBalanceCommon(item.ccy, item.cashBal, item.availBal, platform),
      gateio: (item) =>
        this.mapBalanceCommon(
          item.currency,
          parseFloat(item.available) + parseFloat(item.locked),
          item.available,
          platform
        )
    }

    const platformMapping = mappings[platform]
    if (!platformMapping) {
      console.warn(`Platform ${platform} not supported.`)
      return []
    }

    const balanceData = Array.isArray(
      data.info?.balances || data.info?.data || data
    )
      ? data.info?.balances || data.info?.data || data
      : Object.entries(data).filter(
        ([key, value]) =>
          !['info', 'free', 'used', 'total'].includes(key) &&
          (value as any).total > 0
      )

    return balanceData
      .filter((item: any) => {
        const balance = parseFloat(
          item.balance ||
          item.free ||
          item.cashBal ||
          item.available ||
          item.locked ||
          item[1]?.total ||
          '0'
        )
        return balance > 0
      })
      .map(platformMapping)
  }

  /**
   * Maps common trade data across all platforms.
   */
  private static mapTradeCommon(
    item: Trade,
    platform: string,
    conversionRates: Record<string, number> = {}
  ): Omit<MappedTrade, '_id'> {
    const [baseAsset, quoteAsset] = item?.symbol?.toUpperCase().split('/') || []
    const totalUSDT = getTotalUSDT(
      item.symbol?.toUpperCase() || '',
      item.cost || 0,
      conversionRates
    )

    const feeCost = item.fee ? parseFloat(item.fee.cost?.toString() || '0') : 0
    const feeCurrency = item.fee
      ? item.fee.currency?.toUpperCase() || 'N/A'
      : 'N/A'

    return {
      base: baseAsset,
      quote: quoteAsset,
      pair: item.symbol?.toUpperCase() || '',
      timestamp: item.timestamp || -1,
      type: item.side || '',
      price: parseFloat(item.price?.toString() || '0'),
      amount: parseFloat(item.amount?.toString() || '0'),
      total: parseFloat(item.cost?.toString() || '0'),
      fee: feeCost,
      feecoin: feeCurrency,
      platform,
      totalUSDT: totalUSDT || 0
    }
  }

  /**
   * Maps trade data for a specific platform.
   */
  static mapTrades(
    platform: string,
    data: Trade[],
    conversionRates: Record<string, number> = {}
  ): Omit<MappedTrade, '_id'>[] {
    return data
      .map((item) => {
        const commonData = this.mapTradeCommon(item, platform, conversionRates)
        if (platform === 'okx' && item.info?.data?.[0]?.details) {
          return item.info.data[0].details.map((item: Trade) =>
            this.mapTradeCommon(item, 'okx', conversionRates)
          )
        }
        return commonData
      })
      .flat()
  }

  /**
   * Maps order data for a specific platform.
   */
  static mapOrders(platform: string, data: Order[]): MappedOrder[] {
    return data.map((item) => ({
      oId: item.id,
      cId: item?.clientOrderId,
      platform,
      symbol: item.symbol,
      type: item?.type,
      side: item?.side,
      amount: item.amount,
      price: item.price
    }))
  }

  /**
   * Maps ticker data for a specific platform.
   */
  static mapTickers(platform: string, data: Tickers): MappedTicker[] {
    return Object.values(data).map((item) => ({
      symbol: item.symbol,
      timestamp: item.timestamp,
      last: item.last,
      platform
    }))
  }

  /**
   * Maps market data for a specific platform.
   */
  static mapMarkets(platform: string, data: Market[]): MappedMarket[] {
    return Object.values(data)
      .filter((item): item is Market =>
        getStableCoins().some((coin) => item?.quote === coin)
      )
      .map((item) => ({
        symbol: item?.id ?? '',
        base: item?.base ?? '',
        quote: item?.quote ?? '',
        active: item?.active ?? false,
        type: item?.type ?? '',
        amountMin: item?.limits.amount?.min || 0,
        amountMax: item?.limits.amount?.max || 0,
        priceMin: item?.limits.price?.min || 0,
        priceMax: item?.limits.price?.max || 0,
        precisionAmount: item?.precision?.amount ?? 0,
        precisionPrice: item?.precision?.price ?? 0,
        platform
      }))
  }
}

export const {
  mapBalance,
  mapOrders,
  mapTickers,
  mapMarkets,
  mapTrades,
} = Mapper;