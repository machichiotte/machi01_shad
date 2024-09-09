// src/services/cron/processorService.ts
import { calculateAssetMetrics } from "./metrics/global";
import { mapTrades } from "./mapping";
import {
  saveTradesToDatabase, fetchLastTrades, fetchDatabaseTrades
} from "./tradesService";
import { getAllTickersByPlatform, fetchDatabaseTickers } from "../services/tickersService";
import { fetchDatabaseBalances } from "../services/balanceService";
import { fetchDatabaseCmc } from "../services/cmcService";
import { updateOrdersFromServer, fetchDatabaseOrders } from "../services/ordersService";
import { fetchDatabaseStrategies } from "./strategyService";
import { getSymbolForPlatform } from "../utils/platformUtil";

interface Difference {
  base: string;
  platform: string;
  newSymbol?: boolean;
  balanceDifference?: boolean;
  zeroBalance?: boolean;
}

interface Balance {
  platform: string;
  base: string;
  balance: number;
}

interface Ticker {
  symbol: string;
  platform: string;
}

/**
 * Processes detected balance differences between current and previous balances.
 * This function updates server orders, retrieves tickers, and processes trades for symbols
 * corresponding to the detected differences. It also handles new symbols, balance differences,
 * and zero balances.
 *
 * @param {Difference[]} differences - Array of objects representing detected balance differences.
 * @param {string} platform - Name of the platform for which differences should be processed.
 * @returns {Promise<void>} - This function is asynchronous and returns a promise.
 */
async function processBalanceChanges(differences: Difference[], platform: string): Promise<void> {
  const quoteCurrencies: string[] = ["USDT", "BTC", "ETH", "USDC"];

  try {
    // Mise à jour des ordres depuis le serveur
    await updateOrdersFromServer(platform);

    // Récupération des tickers sauvegardés pour la plateforme spécifiée
    const tickers: Ticker[] = await getAllTickersByPlatform(platform);

    // Suppression des doublons dans le tableau des différences
    const uniqueDifferences: Difference[] = removeDuplicateDifferences(differences);

    const newTrades: any[] = [];

    // Boucle sur les différences sans doublons
    for (const difference of uniqueDifferences) {
      await processDifference(
        difference,
        platform,
        tickers,
        quoteCurrencies,
        newTrades
      );
    }

    // Sauvegarde des nouveaux trades détectés
    if (newTrades.length > 0) {
      await saveTradesToDatabase(newTrades);
    }
  } catch (error) {
    console.error(`Error handling balance differences for ${platform}:`, error);
    throw error;
  }
}

/**
 * Removes duplicates from balance differences.
 * @param {Difference[]} differences - Array of balance differences.
 * @returns {Difference[]} - Array of unique differences.
 */
function removeDuplicateDifferences(differences: Difference[]): Difference[] {
  const uniqueMap = new Map<string, Difference>();
  differences.forEach(v => {
    const key = `${v.base}-${v.platform}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, v);
    }
  });
  return Array.from(uniqueMap.values());
}

/**
 * Processes a specific difference, retrieves trades, and updates the list of new trades.
 * @param {Difference} difference - Object representing a balance difference.
 * @param {string} platform - Name of the platform.
 * @param {Ticker[]} tickers - Array of tickers for the platform.
 * @param {string[]} quoteCurrencies - List of quote currencies.
 * @param {any[]} newTrades - Array of newly detected trades.
 * @returns {Promise<void>}
 */
async function processDifference(
  difference: Difference,
  platform: string,
  tickers: Ticker[],
  quoteCurrencies: string[],
  newTrades: any[]
): Promise<void> {
  for (const quote of quoteCurrencies) {
    const symbol = getSymbolForPlatform(platform, difference.base, quote);

    const marketExists = tickers.some(
      (ticker) =>
        ticker.symbol === difference.base + "/" + quote &&
        ticker.platform === platform
    );

    if (marketExists) {
      try {
        const tradeList = await fetchLastTrades(platform, symbol);
        const mappedTrades = mapTrades(platform, tradeList, {});
        newTrades.push(...mappedTrades);
      } catch (error: any) {
        console.error(`Error fetching trades for ${symbol}: ${error.message}`);
      }
    } else {
      console.log(`Symbol not available: ${symbol}`);
    }
  }

  logDifferenceType(difference);
}

/**
 * Logs information based on the type of detected difference.
 * @param {Difference} difference - Object representing a balance difference.
 */
function logDifferenceType(difference: Difference): void {
  if (difference.newSymbol) {
    console.log(`New symbol detected: ${difference.base}`);
  }

  if (difference.balanceDifference) {
    console.log(`Balance difference detected for symbol: ${difference.base}`);
  }

  if (difference.zeroBalance) {
    console.log(`Zero balance symbol detected: ${difference.base}`);
  }
}

/**
 * Calculates all metrics for assets.
 * @returns {Promise<any[]>} - Returns a promise that resolves to an array of calculated asset metrics.
 */
async function calculateAllMetrics(): Promise<any[]> {
  const [
    dbCmc,
    dbStrategies,
    dbTrades,
    dbOpenOrders,
    dbTickers,
    dbBalances,
  ] = await Promise.all([
    fetchDatabaseCmc(),
    fetchDatabaseStrategies(),
    fetchDatabaseTrades(),
    fetchDatabaseOrders(),
    fetchDatabaseTickers(),
    fetchDatabaseBalances(),
  ]);
  if (
    !dbCmc ||
    !dbStrategies ||
    !dbTrades ||
    !dbOpenOrders ||
    !dbTickers ||
    !dbBalances
  ) {
    console.error(
      "Error: One or more data retrieval functions returned invalid data."
    );
    return [];
  }
  const allValues: any[] = [];

  for (const bal of dbBalances) {
    if (bal.balance !== undefined && bal.balance > 0) {
      const assetBase = bal.base;
      const assetPlatform = bal.platform;

      const filteredCmc = dbCmc.find((cmc) => cmc.symbol === assetBase) || {};
      const filteredTrades =
        dbTrades.filter((trade) => trade.base === assetBase) || [];
      const filteredOpenOrders =
        dbOpenOrders.filter(
          (order) =>
            order.symbol === assetBase + "/USDT" ||
            order.symbol === assetBase + "/USDC" ||
            order.symbol === assetBase + "/BTC"
        ) || [];
      const filteredStrategy =
        dbStrategies.find(
          (strategy) =>
            strategy.asset === assetBase && strategy.strategies[assetPlatform]
        ) || {};

      const filteredTickers =
        dbTickers.filter(
          (ticker) =>
            ticker.symbol.startsWith(`${assetBase}/`) &&
            ticker.platform === assetPlatform
        ) || [];

      let values;
      //TODO verifier quoi exactement on doit verifier pour filteredStrategy
      if (
        !filteredCmc.length &&
        !filteredTrades.length &&
        !filteredOpenOrders.length &&
        !filteredTickers.length &&
        !filteredStrategy 
      ) {
        if (assetBase === "USDT" || assetBase === "USDC") {
          values = calculateAssetMetrics(
            assetBase,
            assetPlatform,
            bal,
            [],
            [],
            [],
            [],
            filteredTickers
          );
        } else {
          console.warn(`Skipping ${assetBase} due to insufficient data.`);
          continue;
        }
      }

      values = calculateAssetMetrics(
        assetBase,
        assetPlatform,
        bal,
        filteredCmc,
        filteredTrades,
        filteredOpenOrders,
        filteredStrategy,
        filteredTickers
      );

      if (values && values.rank > 0 && values.currentPossession) {
        allValues.push(values);
      }
    }
  }

  return allValues;
}

/**
 * Compares current balances with those from the previous database.
 * @param {Balance[]} lastBalances - Array of objects representing previous balances.
 * @param {Balance[]} currentBalances - Array of objects representing current balances.
 * @returns {Difference[]} - Returns an array of objects representing the differences found.
 */
function compareBalances(lastBalances: Balance[], currentBalances: Balance[]): Difference[] {
  const differences: Difference[] = [];

  // Vérification des balances actuelles par rapport aux balances précédentes
  currentBalances.forEach((currentBalance) => {
    const { platform, base, balance: currentBalanceValue } = currentBalance;

    const matchedBalance = lastBalances.find(
      (item) => item.platform === platform && item.base === base
    );

    if (!matchedBalance) {
      // Nouveau symbole trouvé
      differences.push({
        base,
        platform,
        newSymbol: true,
      });
    } else if (matchedBalance.balance !== currentBalanceValue) {
      // Différence de balance trouvée
      differences.push({
        base,
        platform,
        balanceDifference: true,
      });
    }
  });

  // Vérification des balances précédentes pour détecter celles qui ne sont plus présentes
  lastBalances.forEach((lastBalance) => {
    const { platform, base, balance: lastBalanceValue } = lastBalance;

    const matchedBalance = currentBalances.find(
      (item) => item.platform === platform && item.base === base
    );

    if (!matchedBalance) {
      if (lastBalanceValue !== 0) {
        // Ancien symbole trouvé
        differences.push({
          base,
          platform,
          zeroBalance: true,
        });
      } else {
        console.log(
          `🚀 ~ file: processorService.ts:256 ~ lastBalances.forEach ~ already deleted?: ${base}`
        );
      }
    } else if (matchedBalance.balance !== lastBalanceValue) {
      // Différence de balance trouvée
      differences.push({
        base,
        platform,
        balanceDifference: true,
      });
    }
  });

  return removeDuplicatesAndStablecoins(differences);
}

// Liste des stablecoins que nous voulons filtrer
const stablecoins: string[] = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'PAX', 'GUSD', 'HUSD', 'USDN']; // Ajoutez d'autres stablecoins si nécessaire

// Fonction pour supprimer les doublons basés sur 'base' et 'platform'
/**
 * Removes duplicates and stablecoins from the differences array.
 * @param {Difference[]} differences - Array of difference objects.
 * @returns {Difference[]} - Array of unique differences, excluding stablecoins.
 */
function removeDuplicatesAndStablecoins(differences: Difference[]): Difference[] {
  // Utiliser un Map pour supprimer les doublons
  const uniqueDifferences = new Map<string, Difference>();

  differences.forEach(difference => {
    const key = `${difference.base}-${difference.platform}`; // Créez une clé unique en combinant 'base' et 'platform'

    // Vérifiez que 'base' n'est pas un stablecoin et ajoutez-le au Map s'il n'est pas encore présent
    if (!stablecoins.includes(difference.base) && !uniqueDifferences.has(key)) {
      uniqueDifferences.set(key, difference);
    }
  });

  // Convertissez le Map en tableau
  return Array.from(uniqueDifferences.values());
}

export {
  processBalanceChanges,
  calculateAllMetrics,
  compareBalances,
};
