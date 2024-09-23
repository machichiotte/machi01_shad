// src/services/cron/processorService.ts
import { calculateAssetMetrics } from '@services/metrics/global'
import { MappingService } from '@services/mappingService'
import { MappedStrategy, MappedTicker, AssetMetrics, MappedCmc, MappedOrder, MappedBalance } from '@typ/database'
import { TradeService } from '@services/tradeService'
import { TickerService } from '@services/tickerService'
import { CmcService } from '@services/cmcService'
import { OrderBalanceService, } from '@services/orderBalanceService'
import { StrategyService } from '@services/strategyService'
import { getSymbolForPlatform } from '@utils/platformUtil'
import { handleServiceError } from '@utils/errorUtil'
import { removeDuplicateDifferences, logDifferenceType, areAllDataValid, isValidAssetMetrics, removeDuplicatesAndStablecoins } from '@utils/processorUtil'

import { Difference, Balance, Ticker } from '@typ/processor'
import { STABLECOINS, QUOTE_CURRENCIES } from '@src/constants'
import { BalanceService } from './balanceService'
import { MappedTrade } from '@typ/trade'

export class ProcessorService {
  /**
   * Processes detected balance differences between current and previous balances.
   * This function updates server orders, retrieves tickers, and processes trades for symbols
   * corresponding to the detected differences. It also handles new symbols, balance differences,
   * and zero balances.
   */
  static async processBalanceChanges(differences: Difference[], platform: string): Promise<void> {
    try {
      // Mise à jour des ordres depuis le serveur
      await OrderBalanceService.updateOrdersFromServer(platform)

      // Récupération des tickers sauvegardés pour la plateforme spécifiée
      const tickers: MappedTicker[] = await TickerService.getAllTickersByPlatform(platform)

      // Suppression des doublons dans le tableau des différences
      const uniqueDifferences: Difference[] =
        removeDuplicateDifferences(differences)

      const newTrades: MappedTrade[] = []

      // Boucle sur les différences sans doublons
      for (const difference of uniqueDifferences) {
        await this.processDifference(
          difference,
          platform,
          tickers,
          QUOTE_CURRENCIES,
          newTrades
        )
      }

      // Sauvegarde des nouveaux trades détectés
      if (newTrades.length > 0) {
        await TradeService.saveTradesToDatabase(newTrades)
      }
    } catch (error) {
      handleServiceError(error, 'processBalanceChanges', `Error processing balance changes for ${platform}`)
      throw error
    }
  }

  /**
   * Calculates all metrics for assets.
   */
  static async calculateAllMetrics(): Promise<AssetMetrics[]> {
    const [dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances] =
      await this.fetchAllDatabaseData()

    if (!areAllDataValid(dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances)) {
      return []
    }

    const allValues: AssetMetrics[] = []
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
   * Compares current balances with those from the previous database.
   */
  static compareBalances(lastBalances: Balance[], currentBalances: Balance[]): Difference[] {
    const differences: Difference[] = []

    // Vérification des balances actuelles par rapport aux balances précédentes
    currentBalances.forEach((currentBalance) => {
      const { platform, base, balance: currentBalanceValue } = currentBalance

      const matchedBalance = lastBalances.find(
        (item) => item.platform === platform && item.base === base
      )

      if (!matchedBalance) {
        // Nouveau symbole trouvé
        differences.push({
          base,
          platform,
          newSymbol: true
        })
      } else if (matchedBalance.balance !== currentBalanceValue) {
        // Différence de balance trouvée
        differences.push({
          base,
          platform,
          balanceDifference: true
        })
      }
    })

    // Vérification des balances précédentes pour détecter celles qui ne sont plus présentes
    lastBalances.forEach((lastBalance) => {
      const { platform, base, balance: lastBalanceValue } = lastBalance

      const matchedBalance = currentBalances.find(
        (item) => item.platform === platform && item.base === base
      )

      if (!matchedBalance) {
        if (lastBalanceValue !== 0) {
          // Ancien symbole trouvé
          differences.push({
            base,
            platform,
            zeroBalance: true
          })
        }
      } else if (matchedBalance.balance !== lastBalanceValue) {
        // Différence de balance trouvée
        differences.push({
          base,
          platform,
          balanceDifference: true
        })
      }
    })

    return removeDuplicatesAndStablecoins(differences)
  }


  /**
    * Fetches all data from the database.
    */
  private static async fetchAllDatabaseData(): Promise<[MappedCmc[], MappedStrategy[], MappedTrade[], MappedOrder[], MappedTicker[], MappedBalance[]]> {
    return await Promise.all([
      CmcService.fetchDatabaseCmc(),
      StrategyService.fetchDatabaseStrategies(),
      TradeService.fetchDatabaseTrades(),
      OrderBalanceService.fetchDatabaseOrders(),
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
    dbStrategies: MappedStrategy[],
    dbTrades: MappedTrade[],
    dbOpenOrders: MappedOrder[],
    dbTickers: MappedTicker[]
  ): AssetMetrics | null {
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
      (strategy) => strategy.asset === assetBase && strategy.strategies[assetPlatform]
    ) || { asset: '', strategies: {}, maxExposure: {} } as MappedStrategy
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
          { asset: '', strategies: {}, maxExposure: {} },
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

  /**
  * Processes a specific difference, retrieves trades, and updates the list of new trades.
  */
  private static async processDifference(difference: Difference, platform: string, tickers: Ticker[], quoteCurrencies: string[], newTrades: MappedTrade[]): Promise<void> {
    for (const quote of quoteCurrencies) {
      const symbol = getSymbolForPlatform(platform, difference.base, quote)

      const marketExists = tickers.some(
        (ticker) =>
          ticker.symbol === difference.base + '/' + quote &&
          ticker.platform === platform
      )

      if (marketExists) {
        try {
          const tradeList = await TradeService.fetchLastTrades(platform, symbol)
          const mappedTrades = MappingService.mapTrades(platform, tradeList, {})
          newTrades.push(...mappedTrades)
        } catch (error) {
          handleServiceError(error, 'fetchLastTrades', `Error fetching trades for ${symbol}`)
        }
      }
    }

    logDifferenceType(difference)
  }
}