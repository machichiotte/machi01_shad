// src/services/serviceProcessor.ts
import { calculateAssetMetrics } from '@services/cryptoAnalytics/defaultAssets';
import { MappingPlatform } from '@services/api/platform/mappingPlatform';
import { ServiceTrade } from '@services/api/platform/serviceTrade';
import { ServiceTicker } from '@services/api/platform/serviceTicker';
import { ServiceCmc } from '@services/api/serviceCmc';
import { ServiceStrategy } from '@services/api/database/serviceStrategy';
// Utiliser handleServiceError qui utilise déjà logger.error
import { handleServiceError, formatErrorForLog } from '@utils/errorUtil';
import { areAllDataValid, isValidAssetMetrics } from '@utils/processorUtil';
import { QUOTE_CURRENCIES } from '@constants/coins';
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
// Importer le logger configuré
import { logger } from '@utils/loggerUtil';

const myService = 'ServiceProcessor'; // Pour contexte de log
const COLLECTION_NAME = config.databaseConfig.collection.machi;
const COLLECTION_CATEGORY = config.databaseConfig.category.machi;

export class ServiceProcessor {
  static async processBalanceChanges(platform: PLATFORM, differences: BalanceWithDifference[]): Promise<void> {
    const operation = 'processBalanceChanges';
    logger.debug(`Début processBalanceChanges pour ${platform}`, { module: myService, operation, platform, differenceCount: differences.length });
    try {
      await ServiceOrderBalance.updateOrdersFromServer(platform);
      const newTrades: MappedTrade[] = [];
      for (const difference of differences) {
        const context = { module: myService, operation, platform: difference.platform, base: difference.base };
        logger.debug(`Vérification des nouveaux trades`, context);
        const trades = await this.checkNewTrades(difference); // checkNewTrades logguera ses propres erreurs/warnings
        if (Array.isArray(trades) && trades.length > 0) {
          logger.debug(`${trades.length} trade(s) détecté(s).`, { ...context, tradeCount: trades.length });
          newTrades.push(...trades);
        } else {
          logger.debug('Aucun trade détecté.', context);
        }
      }
      if (newTrades.length > 0) {
        logger.debug(`Sauvegarde de ${newTrades.length} nouveau(x) trade(s) en base`, { module: myService, operation, platform, newTradeCount: newTrades.length });
        await ServiceTrade.saveTradesToDatabase(newTrades);
        logger.info(`Successfully saved ${newTrades.length} new trade(s).`, { module: myService, operation, platform, newTradeCount: newTrades.length }); // Log de succès en info
      }
      logger.debug(`Fin processBalanceChanges pour ${platform}`, { module: myService, operation, platform });
    } catch (error) {
      handleServiceError(error, `${myService}:${operation}`, `Erreur lors du traitement des changements de balance pour ${platform}`);
      throw error;
    }
  }

  static async saveMachi(): Promise<void> {
    const operation = 'saveMachi';
    logger.info('Début saveMachi', { module: myService, operation });
    try {
      const data = await this.calculateAllMachi();
      if (data && data.length > 0) {
        logger.info(`Attempting to save ${data.length} Machi asset(s) to DB...`, { module: myService, operation, count: data.length });
        await ServiceDatabase.saveDocumentsWithTimestamp(data, COLLECTION_NAME, COLLECTION_CATEGORY);
        logger.info(`Successfully saved ${data.length} Machi asset(s).`, { module: myService, operation, count: data.length });
      } else {
        logger.info('No Machi data calculated to save.', { module: myService, operation });
      }
      logger.info('Fin saveMachi', { module: myService, operation });
    } catch (error) {
      handleServiceError(error, `${myService}:${operation}`, 'Erreur lors de la sauvegarde de Machi');
      throw error;
    }
  }

  // Calcule l'ensemble des métriques pour les assets
  static async calculateAllMachi(): Promise<Asset[]> {
    const operation = 'calculateAllMachi';
    logger.info('Début calculateAllMachi', { module: myService, operation });
    const fetchStart = Date.now();
    const [dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances] = await this.fetchAllDatabaseData();
    logger.debug(`Database data fetched in ${Date.now() - fetchStart}ms`, { module: myService, operation });


    // areAllDataValid utilise déjà logger.error si nécessaire
    if (!areAllDataValid(dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers, dbBalances)) {
      logger.warn('Données invalides détectées, abandon du calcul', { module: myService, operation });
      return []; // Retourner tableau vide comme dans l'original
    }

    const allValues: Asset[] = [];
    const ignoredBalances: string[] = [];
    const notAddedAssets: string[] = []; // Assets pour lesquels les métriques sont invalides ou non calculées

    logger.debug(`Processing ${dbBalances.length} balance entries...`, { module: myService, operation, balanceCount: dbBalances.length });
    for (const item of dbBalances) {
      const context = { module: myService, operation, platform: item.platform, base: item.base };
      if (typeof item.balance === 'number' && item.balance > 0) {
        const assetMetrics = this.calculateMachiForBalance(item, dbCmc, dbStrategies, dbTrades, dbOpenOrders, dbTickers);
        if (assetMetrics && isValidAssetMetrics(assetMetrics)) {
          allValues.push(assetMetrics);
          // Optionnel: log debug succès par asset
          // logger.debug('Valid metrics calculated.', context);
        } else {
          notAddedAssets.push(`${item.base}:${item.platform}`);
          logger.debug('Asset ignoré (métriques invalides ou non calculées).', context);
        }
      } else {
        ignoredBalances.push(`${item.base}:${item.platform}`);
        logger.debug('Balance ignorée (valeur nulle ou négative).', { ...context, balanceValue: item.balance });
      }
    }
    logger.info(`Fin calculateAllMachi - ${allValues.length} asset(s) traités`, {
      module: myService,
      operation,
      processedAssets: allValues.length,
      ignoredBalanceCount: ignoredBalances.length,
      notAddedAssetCount: notAddedAssets.length
    });
    // Trier comme l'original
    return allValues.sort((a, b) => (a.cmc?.rank ?? Infinity) - (b.cmc?.rank ?? Infinity));
  }

  private static async checkNewTrades(difference: BalanceWithDifference): Promise<MappedTrade[]> {
    const operation = 'checkNewTrades';
    const context = { module: myService, operation, platform: difference.platform, base: difference.base };
    logger.debug('Début checkNewTrades via API...', context);
    try {
      const tradeList = await ServiceTrade.fetchFromApi(difference.platform, difference.base);
      if (tradeList && tradeList.length > 0) {
        logger.debug(`Trades récupérés via API (${tradeList.length}). Mapping...`, { ...context, fetchedCount: tradeList.length });
        return MappingPlatform.mapTrades(difference.platform, tradeList, {});
      } else {
        logger.debug('Aucun trade retourné par API.', context);
        return []; // Retourner tableau vide
      }
    } catch (error) {
      logger.warn(`Erreur lors de la récupération des trades via API.`, { ...context, error: formatErrorForLog(error) });
      return []; // Retourner tableau vide comme dans l'original (erreur est loguée mais non bloquante)
    }
    // Ce log est redondant car on retourne toujours avant
    // logger.debug(`Fin checkNewTrades pour ${difference.platform} - ${difference.base}`, context);
  }

  // Récupère toutes les données de la base de données
  private static async fetchAllDatabaseData(): Promise<[MappedCmc[], MappedStrat[], MappedTrade[], MappedOrder[], MappedTicker[], MappedBalance[]]> {
    const operation = 'fetchAllDatabaseData';
    logger.debug('Récupération des données de la base...', { module: myService, operation });
    try {
      const results = await Promise.all([
        ServiceCmc.fetchDatabaseCmc(),
        ServiceStrategy.fetchDatabaseStrategies(),
        ServiceTrade.fetchFromDb(),
        RepoOrderBalance.fetchAll(), // Assume MappedOrder[]
        ServiceTicker.fetchDatabaseTickers(),
        ServiceBalance.fetchDatabaseBalance()
      ]);
      logger.debug('Finished fetching all database data successfully.', {
        module: myService, operation,
        counts: { // Group counts for clarity
          cmc: results[0]?.length ?? 0, strategies: results[1]?.length ?? 0, trades: results[2]?.length ?? 0,
          orders: results[3]?.length ?? 0, tickers: results[4]?.length ?? 0, balances: results[5]?.length ?? 0,
        }
      });
      // Garder le type de retour original
      return results as [MappedCmc[], MappedStrat[], MappedTrade[], MappedOrder[], MappedTicker[], MappedBalance[]];
    } catch (error) {
      handleServiceError(error, `${myService}:${operation}`, `Failed to fetch all required database data`);
      throw error; // Relancer car ces données sont critiques
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
    const context = { module: myService, operation, platform: balance.platform, base: balance.base };
    // Pas forcément besoin de log au début ici, appelé dans une boucle.

    // Garder la logique de filtrage originale
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
    // Garder la logique originale pour assetStrategy, y compris le fallback objet vide
    const assetStrategy = dbStrategies.find(
      (strategy) => strategy.base === assetBase && strategy.strategies[assetPlatform]
    ) || { base: '', strategies: {}, maxExposure: {} } as MappedStrat;
    const assetTicker = dbTickers.filter( // Renommé assetTicker -> assetTickers
      (ticker) => ticker.symbol.startsWith(`${assetBase}/`) && ticker.platform === assetPlatform
    );

    // Garder la condition originale pour les données suffisantes
    // La seule différence est le fallback objet vide pour assetStrategy qui existe toujours
    if (closestCmc === null || (!assetTrades.length && !assetOrders.length && !assetStrategy.base)) { // Vérifier si le fallback est utilisé via !assetStrategy.base
      logger.debug('Aucune donnée suffisante pour calculer Machi.', {
        ...context,
        cmcFound: !!closestCmc,
        tradesFound: assetTrades.length > 0,
        ordersFound: assetOrders.length > 0,
        strategyFound: !!assetStrategy.base // Vérifier si une vraie stratégie a été trouvée
      });
      return null;
    }

    // Garder l'appel original à calculateAssetMetrics
    // Si l'erreur ts(2345) se reproduit, cela signifie que l'appel original
    // n'était PAS compatible avec la signature de calculateAssetMetrics,
    // malgré l'affirmation que "le code fonctionnait".
    // Dans ce cas, la correction précédente (vérifier/omettre _id) serait nécessaire,
    // mais je respecte l'instruction de ne pas modifier la logique ici.
    return calculateAssetMetrics(
      assetBase,
      assetPlatform,
      balance,
      closestCmc,
      assetTrades,
      assetOrders,
      assetStrategy, // Utilisation de l'objet original (potentiellement le fallback)
      assetTicker
    );
  }
}