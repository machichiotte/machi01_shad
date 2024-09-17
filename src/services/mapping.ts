import { Trade, Balances, Market, Order, Tickers } from 'ccxt'
import { getStableCoins, getTotalUSDT } from '@utils/mappingUtil'
import { MappedBalance, MappedTrade, MappedOrder, MappedTicker, MappedMarket } from 'src/models/dbTypes'


interface RawBalanceBinance {
  asset: string;
  free: string;
  lock: string;
}

interface RawBalanceKucoin {
  currency: string;
  balance: string;
  available: string;
}

interface RawBalanceHtx {
  [key: string]: { total: string; free: string };
}

interface RawBalanceOkx {
  ccy: string;
  cashBal: string;
  availBal: string;
}

interface RawBalanceGateio {
  currency: string;
  available: string;
  locked: string;
}

type RawBalance =
  | { platform: 'binance'; data: RawBalanceBinance }
  | { platform: 'kucoin'; data: RawBalanceKucoin }
  | { platform: 'htx'; data: [string, RawBalanceHtx] }
  | { platform: 'okx'; data: RawBalanceOkx }
  | { platform: 'gateio'; data: RawBalanceGateio };

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
    type BalanceItem = RawBalanceBinance | RawBalanceKucoin | RawBalanceOkx | RawBalanceGateio;

    const mappings: Record<string, (item: BalanceItem) => MappedBalance> = {
      binance: (item) => {
        const binanceItem = item as RawBalanceBinance;
        return this.mapBalanceCommon(
          binanceItem.asset,
          parseFloat(binanceItem.free) + parseFloat(binanceItem.lock),
          parseFloat(binanceItem.free),
          platform
        );
      },
      kucoin: (item) => {
        const kucoinItem = item as RawBalanceKucoin;
        return this.mapBalanceCommon(
          kucoinItem.currency,
          parseFloat(kucoinItem.balance),
          parseFloat(kucoinItem.available),
          platform
        );
      },
      /*htx: (item) => {
        const [key, value] = item.data as [string, RawBalanceHtx];
        if (item.platform !== 'htx') throw new Error('Invalid platform');
        return this.mapBalanceCommon(
          key,
          parseFloat(value.total),
          parseFloat(value.free),
          platform
        );
      },*/
      okx: (item) => {
        const okxItem = item as RawBalanceOkx;
        return this.mapBalanceCommon(
          okxItem.ccy,
          parseFloat(okxItem.cashBal),
          parseFloat(okxItem.availBal),
          platform
        );
      },
      gateio: (item) => {
        const gateioItem = item as RawBalanceGateio;
        return this.mapBalanceCommon(
          gateioItem.currency,
          parseFloat(gateioItem.available) + parseFloat(gateioItem.locked),
          parseFloat(gateioItem.available),
          platform
        );
      }
    };

    const platformMapping = mappings[platform];
    if (!platformMapping) {
      console.warn(`Platform ${platform} not supported.`);
      return [];
    }

    let balanceData: BalanceItem[] = [];
    if (Array.isArray(data.info?.balances)) {
      balanceData = data.info.balances as BalanceItem[];
    } else if (Array.isArray(data.info?.data)) {
      balanceData = data.info.data as BalanceItem[];
    } else if (typeof data === 'object') {
      balanceData = Object.entries(data)
        .filter(([key, value]) =>
          !['info', 'free', 'used', 'total'].includes(key) &&
          typeof value === 'object' && 'total' in value && (value as { total: number }).total > 0
        )
        .map(([key, value]) => ({ ...(value as { total: number }), currency: key } as BalanceItem));
    }

    return balanceData
      .filter((item: BalanceItem) => {
        const balance = parseFloat(
          'free' in item ? item.free :
            'available' in item ? item.available :
              'cashBal' in item ? item.cashBal :
                'balance' in item ? item.balance :
                  '0'
        );
        return balance > 0;
      })
      .map(platformMapping);
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