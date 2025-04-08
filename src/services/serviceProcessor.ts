// src/services/serviceProcessor.ts
import { calculateAssetMetrics } from '@services/cryptoAnalytics/defaultAssets'
import { MappingPlatform } from '@services/api/platform/mappingPlatform'
import { ServiceTrade } from '@services/api/platform/serviceTrade'
import { ServiceTicker } from '@services/api/platform/serviceTicker'
import { ServiceCmc } from '@services/api/serviceCmc'
import { ServiceStrategy } from '@services/api/database/serviceStrategy'
import { handleServiceError } from '@utils/errorUtil'
import { areAllDataValid, isValidAssetMetrics } from '@utils/processorUtil'
import { QUOTE_CURRENCIES } from '@constants/coins'
import { ServiceBalance } from '@services/api/platform/serviceBalance'
import { MappedTrade } from '@typ/trade'
import { MappedTicker } from '@typ/ticker'
import { MappedBalance, BalanceWithDifference } from '@typ/balance'
import { MappedCmc } from '@typ/cmc'
import { MappedStrat } from '@typ/strat'
import { MappedOrder } from '@typ/order'
import { PLATFORM } from '@typ/platform'
import { RepoOrderBalance } from '@repo/repoOrderBalance'
import { Asset } from '@typ/cryptoAnalytics'
import { config } from '@config/index'
import { ServiceDatabase } from '@services/api/database/serviceDatabase'
import { ServiceOrderBalance } from '@services/api/platform/serviceOrderBalance'

const COLLECTION_NAME = config.databaseConfig.collection.machi
const COLLECTION_CATEGORY = config.databaseConfig.category.machi

export class ServiceProcessor {
  static async processBalanceChanges(platform: PLATFORM, differences: BalanceWithDifference[]): Promise<void> {
    console.info(`[ServiceProcessor] Début processBalanceChanges pour ${platform} avec ${differences.length} différence(s)`)
    try {
      await ServiceOrderBalance.updateOrdersFromServer(platform)
      const newTrades: MappedTrade[] = []
      for (const difference of differences) {
        console.info(`[ServiceProcessor] Vérification des nouveaux trades pour ${difference.platform} - ${difference.base}`)
        const trades = await this.checkNewTrades(difference)
        if (Array.isArray(trades) && trades.length > 0) {
          console.info(`[ServiceProcessor] ${trades.length} trade(s) détecté(s) pour ${difference.platform} - ${difference.base}`)
          newTrades.push(...trades)
        } else {
          console.info(`[ServiceProcessor] Aucun trade détecté pour ${difference.platform} - ${difference.base}`)
        }
      }
      if (newTrades.length > 0) {
        console.info(`[ServiceProcessor] Sauvegarde de ${newTrades.length} nouveau(x) trade(s) en base`)
        await ServiceTrade.saveTradesToDatabase(newTrades)
      }
      console.info(`[ServiceProcessor] Fin processBalanceChanges pour ${platform}`)
    } catch (error) {
      handleServiceError(error, 'processBalanceChanges', `Erreur lors du traitement des changements de balance pour ${platform}`)
      throw error
    }
  }

  static async saveMachi(): Promise<void> {
    console.info('[ServiceProcessor] Début saveMachi')
    try {
      const data = await this.calculateAllMachi()
      await ServiceDatabase.saveDocumentsWithTimestamp(data, COLLECTION_NAME, COLLECTION_CATEGORY)
      console.info('[ServiceProcessor] Fin saveMachi')
    } catch (error) {
      handleServiceError(error, 'saveMachi', 'Erreur lors de la sauvegarde de Machi')
      throw error
    }
  }

  // Calcule l'ensemble des métriques pour les assets
  static async calculateAllMachi(): Promise<Asset[]> {
    console.info('[ServiceProcessor] Début calculateAllMachi')
    const [dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances] = await this.fetchAllDatabaseData()
    if (!areAllDataValid(dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances)) {
      console.warn('[ServiceProcessor] Données invalides détectées, abandon du calcul')
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
          //console.info(`[ServiceProcessor] Asset ignoré (métriques invalides) pour ${item.base}:${item.platform}`)
        }
      } else {
        ignoredBalances.push(`${item.base}:${item.platform}`)
        // console.info(`[ServiceProcessor] Balance ignorée (valeur nulle ou négative) pour ${item.base}:${item.platform}`)
      }
    }
    console.info(`[ServiceProcessor] Fin calculateAllMachi - ${allValues.length} asset(s) traités`)
    return allValues.sort((a, b) => a.cmc.rank - b.cmc.rank)
  }

  private static async checkNewTrades(difference: BalanceWithDifference): Promise<MappedTrade[]> {
    console.info(`[ServiceProcessor] Début checkNewTrades pour ${difference.platform} - ${difference.base}`)
    try {
      const tradeList = await ServiceTrade.fetchFromApi(difference.platform, difference.base)
      if (tradeList && tradeList.length > 0) {
        console.info(`[ServiceProcessor] Trades récupérés via API pour ${difference.platform} - ${difference.base}`)
        return MappingPlatform.mapTrades(difference.platform, tradeList, {})
      }
    } catch (error) {
      console.warn(`[ServiceProcessor] Erreur lors de la récupération des trades pour ${difference.platform} - ${difference.base}: ${error}`)
    }
    console.info(`[ServiceProcessor] Fin checkNewTrades pour ${difference.platform} - ${difference.base}`)
    return []
  }

  // Récupère toutes les données de la base de données
  private static async fetchAllDatabaseData(): Promise<[MappedCmc[], MappedStrat[], MappedTrade[], MappedOrder[], MappedTicker[], MappedBalance[]]> {
    console.info('[ServiceProcessor] Récupération des données de la base')
    return await Promise.all([
      ServiceCmc.fetchDatabaseCmc(),
      ServiceStrategy.fetchDatabaseStrategies(),
      ServiceTrade.fetchFromDb(),
      RepoOrderBalance.fetchAll(),
      ServiceTicker.fetchDatabaseTickers(),
      ServiceBalance.fetchDatabaseBalance()
    ])
  }

  // Calcule les métriques d'un asset pour une balance donnée
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
    const cmcMatches = dbCmc.filter((cmc) => cmc.symbol === assetBase)
    const closestCmc = cmcMatches.length > 0
      ? cmcMatches.reduce((prev, current) => current.cmc_rank < prev.cmc_rank ? current : prev)
      : null
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
    if (closestCmc === null || (!assetTrades.length && !assetOrders.length && !assetStrategy)) {
      console.info(`[ServiceProcessor] Aucune donnée suffisante pour ${assetBase} sur ${assetPlatform}`)
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
