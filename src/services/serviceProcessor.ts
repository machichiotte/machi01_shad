// src/services/serviceProcessor.ts
import { calculateAssetMetrics } from '@services/cryptoAnalytics/defaultAssets';
import { MappingPlatform } from '@services/api/platform/mappingPlatform';
import { ServiceTrade } from '@services/api/platform/serviceTrade';
import { ServiceTicker } from '@services/api/platform/serviceTicker';
import { ServiceCmc } from '@services/api/serviceCmc';
import { ServiceStrategy } from '@services/api/database/serviceStrategy';
import { handleServiceError, formatErrorForLog } from '@utils/errorUtil';
import { areAllDataValid, isValidAssetMetrics } from '@utils/processorUtil';
import { QUOTE_CURRENCIES } from '@src/constants/assets';
import { ServiceBalance } from '@services/api/platform/serviceBalance';
import { MappedTrade } from '@typ/trade';
import { MappedTicker } from '@typ/ticker';
import { MappedBalance, BalanceWithDifference } from '@typ/balance';
import { MappedCmc } from '@typ/cmc';
import { MappedStrat } from '@typ/strat';
import { MappedOrder } from '@typ/order';
import { PLATFORM } from '@typ/platform';
import { RepoOrderBalance } from '@repo/repoOrderBalance';
import { Asset } from '@typ/cryptoAnalytics';
import { config } from '@config/index';
import { ServiceDatabase } from '@services/api/database/serviceDatabase';
import { ServiceOrderBalance } from '@services/api/platform/serviceOrderBalance';
import path from 'path'; import { logger } from '@utils/loggerUtil';

const COLLECTION_NAME = config.databaseConfig.collection.machi;
const COLLECTION_CATEGORY = config.databaseConfig.category.machi;

export class ServiceProcessor {
  static async processBalanceChanges(platform: PLATFORM, differences: BalanceWithDifference[]): Promise<void> {
    const operation = 'processBalanceChanges';
    //logger.debug(`Début processBalanceChanges pour ${platform}`, { module: path.parse(__filename).name, operation, platform, differenceCount: differences.length });
    try {
      await ServiceOrderBalance.updateOrdersFromServer(platform);
      const newTrades: MappedTrade[] = [];
      for (const difference of differences) {
        //const context = { module: path.parse(__filename).name, operation, platform: difference.platform, base: difference.base };
        //logger.debug(`Vérification des nouveaux trades`, context);
        const trades = await this.checkNewTrades(difference); // checkNewTrades logguera ses propres erreurs/warnings
        if (Array.isArray(trades) && trades.length > 0) {
          //logger.debug(`${trades.length} trade(s) détecté(s).`, { ...context, tradeCount: trades.length });
          newTrades.push(...trades);
        } else {
          //logger.debug('Aucun trade détecté.', context);
        }
      }
      if (newTrades.length > 0) {
        //logger.debug(`Sauvegarde de ${newTrades.length} nouveau(x) trade(s) en base`, { module: path.parse(__filename).name, operation, platform, newTradeCount: newTrades.length });
        await ServiceTrade.saveTradesToDatabase(newTrades);
        //logger.debug(`Successfully saved ${newTrades.length} new trade(s).`, { module: path.parse(__filename).name, operation, platform, newTradeCount: newTrades.length }); // Log de succès en info
      }
      //logger.debug(`Fin processBalanceChanges pour ${platform}`, { module: path.parse(__filename).name, operation, platform });
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}}`, `Erreur lors du traitement des changements de balance pour ${platform}`);
      throw error;
    }
  }

  static async saveMachi(): Promise<void> {
    const operation = 'saveMachi';
    logger.info('Début saveMachi', { module: path.parse(__filename).name, operation });
    try {
      const data = await this.calculateAllMachi();
      if (data && data.length > 0) {
        logger.info(`Attempting to save ${data.length} Machi asset(s) to DB...`, { module: path.parse(__filename).name, operation, count: data.length });
        await ServiceDatabase.saveDocumentsWithTimestamp(data, COLLECTION_NAME, COLLECTION_CATEGORY);
        logger.info(`Successfully saved ${data.length} Machi asset(s).`, { module: path.parse(__filename).name, operation, count: data.length });
      } else {
        logger.info('No Machi data calculated to save.', { module: path.parse(__filename).name, operation });
      }
      logger.info('Fin saveMachi', { module: path.parse(__filename).name, operation });
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}}`, 'Erreur lors de la sauvegarde de Machi');
      throw error;
    }
  }

  // Calcule l'ensemble des métriques pour les assets
  static async calculateAllMachi(): Promise<Asset[]> {
    const operation = 'calculateAllMachi';
    logger.info('Début calculateAllMachi', { module: path.parse(__filename).name, operation });
    const [dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances] = await this.fetchAllDatabaseData();

    //const fetchStart = Date.now();
    //logger.debug(`Database data fetched in ${Date.now() - fetchStart}ms`, { module: path.parse(__filename).name, operation });

    if (!areAllDataValid(dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances)) {
      logger.warn('Données invalides détectées, abandon du calcul', { module: path.parse(__filename).name, operation });
      return [];
    }

    const allValues: Asset[] = [];
    const ignoredBalances: string[] = [];
    const notAddedAssets: string[] = []; // Assets pour lesquels les métriques sont invalides ou non calculées

    //logger.debug(`Processing ${dbBalances.length} balance entries...`, { module: path.parse(__filename).name, operation, balanceCount: dbBalances.length });
    for (const item of dbBalances) {
      //const context = { module: path.parse(__filename).name, operation, platform: item.platform, base: item.base };
      if (typeof item.balance === 'number' && item.balance > 0) {
        const assetMetrics = this.calculateMachiForBalance(item, dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers);
        if (assetMetrics && isValidAssetMetrics(assetMetrics)) {
          allValues.push(assetMetrics);
          // Optionnel: log debug succès par asset
          // //logger.debug('Valid metrics calculated.', context);
        } else {
          notAddedAssets.push(`${item.base}:${item.platform}`);
          //logger.debug('Asset ignoré (métriques invalides ou non calculées).', context);
        }
      } else {
        ignoredBalances.push(`${item.base}:${item.platform}`);
        //logger.debug('Balance ignorée (valeur nulle ou négative).', { ...context, balanceValue: item.balance });
      }
    }
    logger.info(`Fin calculateAllMachi - ${allValues.length} asset(s) traités`, {
      module: path.parse(__filename).name,
      operation,
      processedAssets: allValues.length,
      ignoredBalanceCount: ignoredBalances.length,
      notAddedAssetCount: notAddedAssets.length
    });

    return allValues.sort((a, b) => (a.cmc?.rank ?? Infinity) - (b.cmc?.rank ?? Infinity));
  }

  private static async checkNewTrades(difference: BalanceWithDifference): Promise<MappedTrade[]> {
    const operation = 'checkNewTrades';
    const context = { module: path.parse(__filename).name, operation, platform: difference.platform, base: difference.base };
    //logger.debug('Début checkNewTrades via API...', context);
    try {
      const tradeList = await ServiceTrade.fetchFromApi(difference.platform, difference.base);
      if (tradeList && tradeList.length > 0) {
        //logger.debug(`Trades récupérés via API (${tradeList.length}). Mapping...`, { ...context, fetchedCount: tradeList.length });
        return MappingPlatform.mapTrades(difference.platform, tradeList, {});
      } else {
        //logger.debug('Aucun trade retourné par API.', context);
        return [];
      }
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}}`, 'Erreur lors de la récupération des trades via API.');

      logger.warn(`Erreur lors de la récupération des trades via API.`, { ...context, error: formatErrorForLog(error) });
      return [];
    }
    // Ce log est redondant car on retourne toujours avant
    // //logger.debug(`Fin checkNewTrades pour ${difference.platform} - ${difference.base}`, context);
  }

  // Récupère toutes les données de la base de données
  private static async fetchAllDatabaseData(): Promise<[MappedCmc[], MappedStrat[], MappedTrade[], MappedOrder[], MappedTicker[], MappedBalance[]]> {
    const operation = 'fetchAllDatabaseData';
    //logger.debug('Récupération des données de la base...', { module: path.parse(__filename).name, operation: 'fetchAllDatabaseData' });
    try {
      const results = await Promise.all([
        ServiceCmc.fetchDatabaseCmc(),
        ServiceStrategy.fetchDatabaseStrategies(),
        ServiceTrade.fetchFromDb(),
        RepoOrderBalance.fetchAll(), // Assume MappedOrder[]
        ServiceTicker.fetchDatabaseTickers(),
        ServiceBalance.fetchDatabaseBalance()
      ]);
      /*
      logger.debug('Finished fetching all database data successfully.', {
        module: path.parse(__filename).name, operation: 'fetchAllDatabaseData',
        counts: {
          cmc: results[0]?.length ?? 0, strategies: results[1]?.length ?? 0, trades: results[2]?.length ?? 0,
          orders: results[3]?.length ?? 0, tickers: results[4]?.length ?? 0, balances: results[5]?.length ?? 0,
        }
      });
*/
      return results as [MappedCmc[], MappedStrat[], MappedTrade[], MappedOrder[], MappedTicker[], MappedBalance[]];
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Failed to fetch all required database data`);
      throw error;
    }
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
    const operation = 'calculateMachiForBalance';
    const context = { module: path.parse(__filename).name, operation, platform: balance.platform, base: balance.base };
    const assetBase = balance.base;
    const assetPlatform = balance.platform;
    const cmcMatches = dbCmc.filter((cmc) => cmc.symbol === assetBase);
    const closestCmc = cmcMatches.length > 0
      ? cmcMatches.reduce((prev, current) => (current.cmc_rank ?? Infinity) < (prev.cmc_rank ?? Infinity) ? current : prev)
      : null;
    const assetTrades = dbTrades.filter((trade) => trade.base === assetBase && trade.platform === assetPlatform); // Ajout filtre plateforme
    const assetOrders = dbOpenOrders.filter((order) =>
      order.symbol && QUOTE_CURRENCIES.some(quote => order.symbol === `${assetBase}/${quote}`) && order.platform === assetPlatform // Ajout filtre plateforme
    );
    const assetStrategy = dbStrategies.find(
      (strategy) => strategy.base === assetBase && strategy.strategies[assetPlatform]
    ) || { base: '', strategies: {}, maxExposure: {} } as MappedStrat;
    const assetTicker = dbTickers.filter( // Renommé assetTicker -> assetTickers
      (ticker) => ticker.symbol.startsWith(`${assetBase}/`) && ticker.platform === assetPlatform
    );

    if (closestCmc === null || (!assetTrades.length && !assetOrders.length && !assetStrategy.base)) { // Vérifier si le fallback est utilisé via !assetStrategy.base
      logger.warn('Aucune donnée suffisante pour calculer Machi.', {
        ...context,
        cmcFound: !!closestCmc,
        tradesFound: assetTrades.length > 0,
        ordersFound: assetOrders.length > 0,
        strategyFound: !!assetStrategy.base // Vérifier si une vraie stratégie a été trouvée
      });

      return null;
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
    );
  }
}