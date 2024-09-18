import { Trade, Market, Order, Tickers } from 'ccxt'
import { getStableCoins, getTotalUSDT } from '@utils/mappingUtil'
import { MappedBalance, MappedTrade, MappedOrder, MappedTicker, MappedMarket } from 'src/models/dbTypes'
import { Balance, Balances } from 'ccxt'
class Mapper {

  /**
   * Méthode principale pour mapper les balances selon la plateforme.
   * @param {string} platform - La plateforme d'échange.
   * @param {Object} data - Les données brutes de balance.
   * @returns {Object[]} Un tableau contenant les balances mappées.
   */
  static mapBalance(platform: string, balanceData: Balances): MappedBalance[] {
    // Vérification des données d'entrée
    if (typeof balanceData !== 'object' || balanceData === null) {
      console.error(`Données de balance invalides pour la plateforme : ${platform}`);
      return [];
    }

    const balances = Object.entries(balanceData)
      .filter((entry): entry is [string, Balance] => {
        const [_, data] = entry;
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

  /**
   * Maps common trade data across all platforms.
   */
  private static mapTradeCommon(
    item: Trade,
    platform: string,
    conversionRates: Record<string, number> = {}
  ): Omit<MappedTrade, '_id'> {
    console.log('Début de mapTradeCommon pour la plateforme:', platform);
    console.log('Item reçu:', JSON.stringify(item));

    if (!item) {
      console.error('Item est undefined');
      return {} as Omit<MappedTrade, '_id'>;
    }

    const [baseAsset, quoteAsset] = item.symbol?.toUpperCase().split('/') || []
    console.log('Base asset:', baseAsset, 'Quote asset:', quoteAsset);

    const totalUSDT = getTotalUSDT(
      item.symbol?.toUpperCase() || '',
      item.cost || 0,
      conversionRates
    )
    console.log('Total USDT calculé:', totalUSDT);

    const feeCost = item.fee ? parseFloat(item.fee.cost?.toString() || '0') : 0
    const feeCurrency = item.fee
      ? item.fee.currency?.toUpperCase() || 'N/A'
      : 'N/A'
    console.log('Frais:', feeCost, 'Devise des frais:', feeCurrency);

    const mappedTrade = {
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
    };

    console.log('Trade mappé:', JSON.stringify(mappedTrade));
    return mappedTrade;
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