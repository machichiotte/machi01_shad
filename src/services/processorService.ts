// src/services/cron/processorService.ts
import { calculateAssetMetrics } from '@services/metrics/global'
import { MappingService } from '@src/services/api/platform/platformMapping'
import { TradeService } from '@services/api/platform/tradeService'
import { TickerService } from '@services/api/platform/tickerService'
import { CmcService } from '@services/api/cmcService'
import { OrderBalanceService, } from '@services/api/platform/orderBalanceService'
import { StrategyService } from '@src/services/api/database/strategyService'
import { handleServiceError } from '@utils/errorUtil'
import { areAllDataValid, isValidAssetMetrics } from '@utils/processorUtil'
import { QUOTE_CURRENCIES } from '@src/constants/coins'
import { BalanceService } from '@services/api/platform/balanceService'
import { MappedTrade } from '@typ/trade'
import { MappedTicker } from '@typ/ticker'
import { MappedBalance, BalanceWithDifference } from '@typ/balance'
import { MappedCmc } from '@typ/cmc'
import { MappedStrat } from '@typ/strat'
import { MappedOrder } from '@typ/order'
import { PLATFORM } from '@typ/platform'
import { RepoOrderBalance } from '@src/repo/repoOrderBalance'
import { Asset } from '@typ/metrics'
import { config } from '@config/index';
import { DatabaseService } from './api/database/databaseService'

const COLLECTION_NAME = config.databaseConfig.collection.machi;
const COLLECTION_CATEGORY = config.databaseConfig.category.machi;

export class ProcessorService {
  static async processBalanceChanges(platform: PLATFORM, differences: BalanceWithDifference[]): Promise<void> {
    try {
      await OrderBalanceService.updateOrdersFromServer(platform);
      const newTrades: MappedTrade[] = [];
      for (const difference of differences) {
        const trades = await this.checkNewTrades(difference);
        if (Array.isArray(trades) && trades.length > 0) {
          newTrades.push(...trades);
        }
      }

      if (newTrades.length > 0) {
        await TradeService.saveTradesToDatabase(newTrades)
      }
    } catch (error) {
      handleServiceError(error, 'processBalanceChanges', `Error processing balance changes for ${platform}`)
      throw error
    }
  }

  static async saveMachi(): Promise<void> {
    const data = await this.calculateAllMachi();
    await DatabaseService.saveDataAndTimestampToDatabase(data, COLLECTION_NAME, COLLECTION_CATEGORY);
  }

  /**
   * Calculates all metrics for assets.
   */
  static async calculateAllMachi(): Promise<Asset[]> {
    const [dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances] =
      await this.fetchAllDatabaseData()

    if (!areAllDataValid(dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances)) {
      return []
    }

    const allValues: Asset[] = []
    const ignoredBalances: string[] = []
    const notAddedAssets: string[] = []

    for (const item of dbBalances) {
      if (typeof item.balance === 'number' && item.balance > 0) {
        const assetMetrics = this.calculateMachiForBalance(item, dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers)



        if (assetMetrics && isValidAssetMetrics(assetMetrics)) {
          allValues.push(assetMetrics)
        } else {
          notAddedAssets.push(`${item.base}:${item.platform}`)
        }
      } else {
        ignoredBalances.push(`${item.base}:${item.platform}`)
      }
    }

    return allValues.sort((a, b) => a.cmc.rank - b.cmc.rank)
  }

  private static async checkNewTrades(difference: BalanceWithDifference): Promise<MappedTrade[]> {
    //logDifferenceType(difference) si besoin pour des evolutions futures
    try {
      const tradeList = await TradeService.fetchFromApi(difference.platform, difference.base)
      if (tradeList && tradeList.length > 0)
        return MappingService.mapTrades(difference.platform, tradeList, {})
    } catch (error) {
      console.warn(`Impossible de récupérer les trades pour ${difference.platform} - ${difference.base} : ${error}`);
    }

    return []
  }

  /**
    * Fetches all data from the database.
    */
  private static async fetchAllDatabaseData(): Promise<[MappedCmc[], MappedStrat[], MappedTrade[], MappedOrder[], MappedTicker[], MappedBalance[]]> {
    return await Promise.all([
      CmcService.fetchDatabaseCmc(),
      StrategyService.fetchDatabaseStrategies(),
      TradeService.fetchFromDb(),
      RepoOrderBalance.fetchAll(),
      TickerService.fetchDatabaseTickers(),
      BalanceService.fetchDatabaseBalance()
    ])
  }

  /**
   * Calculates asset metrics for a given balance.
   */
  private static calculateMachiForBalance(
    balance: MappedBalance,
    dbCmc: MappedCmc[],
    dbStrategies: MappedStrat[],
    dbTrades: MappedTrade[],
    dbOpenOrders: MappedOrder[],
    dbTickers: MappedTicker[]
  ): Asset | null {
    const assetBase = balance.base
    const assetPlatform = balance.platform
    const cmcMatches = dbCmc.filter((cmc) => cmc.symbol === assetBase);
    const closestCmc = cmcMatches.length > 0
      ? cmcMatches.reduce((prev, current) =>
        current.cmc_rank < prev.cmc_rank ? current : prev
      )
      : null;

    const assetTrades = dbTrades.filter((trade) => trade.base === assetBase)
    const assetOrders = dbOpenOrders.filter((order) =>
      QUOTE_CURRENCIES.some(quote => order.symbol === `${assetBase}/${quote}`)
    )
    const assetStrategy = dbStrategies.find(
      (strategy) => strategy.base === assetBase && strategy.strategies[assetPlatform]
    ) || { base: '', strategies: {}, maxExposure: {} } as MappedStrat

    const assetTicker = dbTickers.filter(
      (ticker) => ticker.symbol.startsWith(`${assetBase}/`) && ticker.platform === assetPlatform
    )

    if (
      closestCmc === null ||
      !assetTrades.length &&
      !assetOrders.length &&
      !assetStrategy
    ) {
      return null
    }

    return calculateAssetMetrics(
      assetBase,
      assetPlatform,
      balance,
      closestCmc,
      assetTrades,
      assetOrders,
      assetStrategy,
      assetTicker
    )
  }
}