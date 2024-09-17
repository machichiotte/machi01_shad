import { Trade, Market, Order, Tickers } from 'ccxt'
import { getStableCoins, getTotalUSDT } from '@utils/mappingUtil'
import { MappedBalance, MappedTrade, MappedOrder, MappedTicker, MappedMarket } from 'src/models/dbTypes'


interface RawBalanceBinance {
  asset: string;
  free: string;
  locked: string;
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

type RawBalance = RawBalanceBinance | RawBalanceKucoin | RawBalanceHtx | RawBalanceOkx | RawBalanceGateio;

class Mapper {


  /**
   * Filtre les données de balance pour ne conserver que celles ayant un solde positif.
   * @param {Object[]} data - Le tableau brut des balances.
   * @returns {Object[]} Un tableau filtré avec les balances ayant un solde positif.
   */
  private static filterPositiveBalances(data: RawBalance[]): RawBalance[] {
    return data.filter((item) => {
      const balance = parseFloat(
        ('balance' in item && item.balance) ||
        ('free' in item && item.free) ||
        ('cashBal' in item && item.cashBal) ||
        ('available' in item && item.available) ||
        ('locked' in item && item.locked) ||
        (Array.isArray(item) && item[1]?.total) ||
        '0'
      );
      return balance > 0;
    });
  }

  /**
   * Mapping commun des balances, utilisable par toutes les plateformes.
   * @param {string} base - L'actif de base.
   * @param {number} balance - Le solde total.
   * @param {number} available - Le solde disponible.
   * @param {string} platform - La plateforme.
   * @returns {Object} Un objet avec les informations mappées.
   */
  private static mapBalanceCommon(base: string, balance: number, available: number, platform: string): MappedBalance {
    return {
      base,
      balance: parseFloat(balance.toString()),  // Conversion en float pour assurer le type
      available: parseFloat(available.toString()),
      platform,
    };
  }

  // Fonctions de mapping pour chaque plateforme
  private static mapBinanceBalance(item: RawBalanceBinance, platform: string): MappedBalance {
    return this.mapBalanceCommon(
      item.asset,
      parseFloat(item.free) + parseFloat(item.locked),
      parseFloat(item.free),
      platform
    );
  }

  private static mapKucoinBalance(item: RawBalanceKucoin, platform: string): MappedBalance {
    return this.mapBalanceCommon(item.currency, parseFloat(item.balance), parseFloat(item.available), platform);
  }

  /*private mapHtxBalance(item: RawBalanceHtx, platform: string): MappedBalance {
    return this.mapBalanceCommon(item.currency.toUpperCase(), parseFloat(item.total), parseFloat(item.free), platform);
  }*/

  private static mapOkxBalance(item: RawBalanceOkx, platform: string): MappedBalance {
    return this.mapBalanceCommon(item.ccy, parseFloat(item.cashBal), parseFloat(item.availBal), platform);
  }

  private static mapGateioBalance(item: RawBalanceGateio, platform: string): MappedBalance {
    return this.mapBalanceCommon(
      item.currency,
      parseFloat(item.available) + parseFloat(item.locked),
      parseFloat(item.available),
      platform
    );
  }

  /**
   * Méthode principale pour mapper les balances selon la plateforme.
   * @param {string} platform - La plateforme d'échange.
   * @param {Object} data - Les données brutes de balance.
   * @returns {Object[]} Un tableau contenant les balances mappées.
   */
  static mapBalance(platform: string, data: RawBalance[] | Record<string, unknown>): MappedBalance[] {
    const mappings: Record<string, (item: RawBalance, platform: string) => MappedBalance> = {
      binance: (item, platform) => this.mapBinanceBalance(item as RawBalanceBinance, platform),
      kucoin: (item, platform) => this.mapKucoinBalance(item as RawBalanceKucoin, platform),
      //htx: (item, platform) => this.mapHtxBalance(item as RawBalanceHtx, platform),
      okx: (item, platform) => this.mapOkxBalance(item as RawBalanceOkx, platform),
      gateio: (item, platform) => this.mapGateioBalance(item as RawBalanceGateio, platform),
    };

    const platformMapping = mappings[platform as keyof typeof mappings];
    if (!platformMapping) {
      console.warn(`Platform ${platform} not supported.`);
      return [];
    }

    const balanceData = Array.isArray(data)
      ? data as RawBalance[]
      : Object.entries(data).map(([key, value]) => ({ [key]: value } as RawBalance));

    return this.filterPositiveBalances(balanceData).map(item => platformMapping(item, platform));

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
  mapOrders,
  mapTickers,
  mapMarkets,
  mapTrades,
} = Mapper;