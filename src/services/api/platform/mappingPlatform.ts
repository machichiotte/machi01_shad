// src/services/api/platform/mappingPlatform.ts
import { PLATFORM, PlatformBalance, PlatformBalances, PlatformMarket, PlatformOrder, PlatformTickers, PlatformTrade } from '@typ/platform'
import { MappedTrade } from '@typ/trade'
import { MappedTicker } from '@typ/ticker'
import { MappedBalance } from '@typ/balance'
import { MappedOrder } from '@typ/order'
import { MappedMarket } from '@typ/market'
import { QUOTE_CURRENCIES } from '@constants/coins'
import { getEqUSD } from '@utils/mappingUtil'

export class MappingPlatform {
  static mapBalance(platform: PLATFORM, balanceData: PlatformBalances): Omit<MappedBalance, '_id'>[] {

    // Vérification des données d'entrée
    if (typeof balanceData !== 'object' || balanceData === null) {
      throw new Error(`Données de balance invalides pour la plateforme : ${platform}`)
    }

    const balances = Object.entries(balanceData)
      .filter((entry): entry is [string, PlatformBalance] => {
        const [, data] = entry;

        return typeof data === 'object' && data !== null &&
          'free' in data && 'total' in data && typeof data.total === 'number' && data.total > 0;
      })
      .map(([base, data]) => ({
        base,
        balance: Number(data.total) || 0,
        available: Number(data.free) || 0,
        platform
      }));

    return balances;
  }

  private static mapTradeCommon(item: PlatformTrade, platform: PLATFORM, conversionRates: Record<string, number> = {}): Omit<MappedTrade, '_id'> {
    if (!item) {
      console.warn('Item est undefined');
      return {} as Omit<MappedTrade, '_id'>;
    }

    const [base, quote] = item.symbol?.toUpperCase().split('/') || []

    const eqUSD = getEqUSD(
      item.symbol?.toUpperCase() || '',
      item.cost || 0,
      conversionRates
    )?.toFixed(2)

    const feeCost = item.fee ? parseFloat(item.fee.cost?.toString() || '0') : 0
    const feeCurrency = item.fee
      ? item.fee.currency?.toUpperCase() || 'N/A'
      : 'N/A'

    const mappedTrade = {
      orderid: item.id,
      base: base,
      quote: quote,
      pair: item.symbol?.toUpperCase() || '',
      timestamp: item.timestamp || -1,
      side: item.side || '',
      price: parseFloat(item.price?.toString() || '0'),
      amount: parseFloat(item.amount?.toString() || '0'),
      total: parseFloat(item.cost?.toString() || '0'),
      fee: feeCost,
      feecoin: feeCurrency,
      platform,
      dateUTC: item.datetime || '',
      eqUSD: Number(eqUSD) || 0
    };

    return mappedTrade;
  }

  static mapTrades(platform: PLATFORM, data: PlatformTrade[], conversionRates: Record<string, number> = {}): MappedTrade[] {
    return data
      .map((item) => {
        const commonData = MappingPlatform.mapTradeCommon(item, platform, conversionRates)
        if (platform === 'okx' && item.info?.data?.[0]?.details) {
          return item.info.data[0].details.map((item: PlatformTrade) =>
            MappingPlatform.mapTradeCommon(item, 'okx', conversionRates)
          )
        }
        return commonData
      })
      .flat()
  }

  static mapOrders(platform: PLATFORM, data: PlatformOrder[]): Omit<MappedOrder, '_id'>[] {
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

  static mapTickers(platform: PLATFORM, data: PlatformTickers): Omit<MappedTicker, '_id'>[] {
    return Object.values(data).map((item) => ({
      symbol: item.symbol,
      timestamp: item.timestamp,
      last: item.last,
      platform
    }))
  }

  static mapMarkets(platform: PLATFORM, data: PlatformMarket[]): Omit<MappedMarket, '_id'>[] {
    return Object.values(data)
      .filter((item): item is PlatformMarket =>
        QUOTE_CURRENCIES.some((coin) => item?.quote === coin)
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