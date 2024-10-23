// src/services/cron/processorService.ts
import { calculateAssetMetrics } from '@services/metrics/global'
import { MappingService } from '@services/mappingService'
import { TradeService } from '@services/tradeService'
import { TickerService } from '@services/tickerService'
import { CmcService } from '@services/cmcService'
import { OrderBalanceService, } from '@services/orderBalanceService'
import { StrategyService } from '@services/strategyService'
import { handleServiceError } from '@utils/errorUtil'
import { areAllDataValid, isValidAssetMetrics } from '@utils/processorUtil'
import { STABLECOINS, QUOTE_CURRENCIES } from '@src/constants'
import { BalanceService } from '@services/balanceService'
import { MappedTrade } from '@typ/trade'
import { MappedTicker } from '@typ/ticker'
import { MappedBalance, BalanceWithDifference } from '@typ/balance'
import { MappedCmc } from '@typ/cmc'
import { MappedStrat } from '@typ/strat'
import { MappedOrder } from '@typ/order'
import { PLATFORM } from '@typ/platform'
import { OrderBalanceRepository } from '@repositories/orderBalanceRepository'

import { Asset } from '@typ/metrics'

export class ProcessorService {
  /**
   * Processes detected balance differences between current and previous balances.
   * This function updates server orders, retrieves tickers, and processes trades for symbols
   * corresponding to the detected differences. It also handles new symbols, balance differences,
   * and zero balances.
   */
  static async processBalanceChanges(platform: PLATFORM, differences: BalanceWithDifference[]): Promise<void> {
    try {
      await OrderBalanceService.updateOrdersFromServer(platform);
      const newTrades: MappedTrade[] = [];
      for (const difference of differences) {
        const trades = await this.processDifference(difference);
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

  /**
 * Processes a specific difference, retrieves trades, and updates the list of new trades.
 */
  private static async processDifference(difference: BalanceWithDifference): Promise<MappedTrade[]> {
    //logDifferenceType(difference) si besoin pour des evolutions futures
    try {
      const tradeList = await TradeService.fetchLastTrades(difference.platform, difference.base)
      if (tradeList && tradeList.length > 0)
        return MappingService.mapTrades(difference.platform, tradeList, {})
    } catch (error) {
      console.warn(`Impossible de récupérer les trades pour ${difference.platform} - ${difference.base} : ${error}`);
    }

    return []
  }

  /**
   * Calculates all metrics for assets.
   */
  static async calculateAllMetrics(): Promise<Asset[]> {
    const [dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances] =
      await this.fetchAllDatabaseData()

    if (!areAllDataValid(dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances)) {
      return []
    }

    const allValues: Asset[] = []
    const ignoredBalances: string[] = []
    const notAddedAssets: string[] = []

    for (const bal of dbBalances) {
      if (typeof bal.balance === 'number' && bal.balance > 0) {
        const assetMetrics = this.calculateAssetMetricsForBalance(bal, dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers)
        if (isValidAssetMetrics(assetMetrics)) {
          allValues.push(assetMetrics)
        } else {
          notAddedAssets.push(`${bal.base}:${bal.platform}`)
        }
      } else {
        ignoredBalances.push(`${bal.base}:${bal.platform}`)
      }
    }

    return allValues
  }



  /**
    * Fetches all data from the database.
    */
  private static async fetchAllDatabaseData(): Promise<[MappedCmc[], MappedStrat[], MappedTrade[], MappedOrder[], MappedTicker[], MappedBalance[]]> {
    return await Promise.all([
      CmcService.fetchDatabaseCmc(),
      StrategyService.fetchDatabaseStrategies(),
      TradeService.fetchDatabaseTrades(),
      OrderBalanceRepository.fetchAll(),
      TickerService.fetchDatabaseTickers(),
      BalanceService.fetchDatabaseBalance()
    ])
  }

  /**
   * Calculates asset metrics for a given balance.
   */
  private static calculateAssetMetricsForBalance(
    bal: MappedBalance,
    dbCmc: MappedCmc[],
    dbStrategies: MappedStrat[],
    dbTrades: MappedTrade[],
    dbOpenOrders: MappedOrder[],
    dbTickers: MappedTicker[]
  ): Asset | null {
    const assetBase = bal.base
    const assetPlatform = bal.platform

    const cmcMatches = dbCmc.filter((cmc) => cmc.symbol === assetBase);
    const closestCmc = cmcMatches.length > 0
      ? cmcMatches.reduce((prev, current) =>
        Math.abs(current.quote?.USD?.price - bal.balance) < Math.abs(prev.quote?.USD?.price - bal.balance)
          ? current
          : prev
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
      !assetTicker.length &&
      !assetStrategy
    ) {
      if (STABLECOINS.includes(assetBase)) {
        return calculateAssetMetrics(
          assetBase,
          assetPlatform,
          bal,
          closestCmc,
          [],
          [],
          { base: '', strategies: {}, maxExposure: {} },
          assetTicker
        )
      } else {
        return null
      }
    }

    return calculateAssetMetrics(
      assetBase,
      assetPlatform,
      bal,
      closestCmc,
      assetTrades,
      assetOrders,
      assetStrategy,
      assetTicker
    )
  }


}