// src/services/cron/processorService.js
const { calculateAssetMetrics } = require("./metrics/global.js");

const { mapTrades } = require("./mapping.js");

const tradesService = require("../services/tradesService.js");
const tickersService = require("../services/tickersService.js");
const balanceService = require("../services/balanceService.js");
const cmcService = require("../services/cmcService.js");
const ordersService = require("../services/ordersService.js");
const strategyService = require("../services/strategyService.js");

const { getSymbolForPlatform } = require("../utils/platformUtil.js");

/**
 * Processes detected balance differences between current and previous balances.
 * This function updates server orders, retrieves tickers, and processes trades for symbols
 * corresponding to the detected differences. It also handles new symbols, balance differences,
 * and zero balances.
 *
 * @param {Object[]} differences - Array of objects representing detected balance differences.
 * @param {string} platform - Name of the platform for which differences should be processed.
 * @returns {Promise<void>} - This function is asynchronous and returns a promise.
 */
async function processBalanceChanges(differences, platform) {
  const quoteCurrencies = ["USDT", "BTC", "ETH", "USDC"];

  try {
    // Mise à jour des ordres depuis le serveur
    await ordersService.updateOrdersFromServer(platform);

    // Récupération des tickers sauvegardés pour la plateforme spécifiée
    const tickers = await tickersService.getAllTickersByPlatform(platform);

    // Suppression des doublons dans le tableau des différences
    const uniqueDifferences = removeDuplicateDifferences(differences);

    const newTrades = [];

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
      await tradesService.saveTradesToDatabase(newTrades);
    }
  } catch (error) {
    console.error(`Error handling balance differences for ${platform}:`, error);
    throw error;
  }
}

/**
 * Removes duplicates from balance differences.
 * @param {Object[]} differences - Array of balance differences.
 * @returns {Object[]} - Array of unique differences.
 */
function removeDuplicateDifferences(differences) {
  const uniqueMap = new Map();
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
 * @param {Object} difference - Object representing a balance difference.
 * @param {string} platform - Name of the platform.
 * @param {Object[]} tickers - Array of tickers for the platform.
 * @param {string[]} quoteCurrencies - List of quote currencies.
 * @param {Object[]} newTrades - Array of newly detected trades.
 * @returns {Promise<void>}
 */
async function processDifference(
  difference,
  platform,
  tickers,
  quoteCurrencies,
  newTrades
) {
  for (const quote of quoteCurrencies) {
    const symbol = getSymbolForPlatform(platform, difference.base, quote);

    const marketExists = tickers.some(
      (ticker) =>
        ticker.symbol === difference.base + "/" + quote &&
        ticker.platform === platform
    );

    if (marketExists) {
      try {
        const tradeList = await tradesService.fetchLastTrades(platform, symbol);
        const mappedTrades = mapTrades(platform, tradeList);
        newTrades.push(...mappedTrades);
      } catch (err) {
        console.error(`Error fetching trades for ${symbol}: ${err.message}`);
      }
    } else {
      console.log(`Symbol not available: ${symbol}`);
    }
  }

  logDifferenceType(difference);
}

/**
 * Logs information based on the type of detected difference.
 * @param {Object} difference - Object representing a balance difference.
 */
function logDifferenceType(difference) {
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
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of calculated asset metrics.
 */
async function calculateAllMetrics() {
  const [
    lastCmc,
    lastStrategies,
    lastTrades,
    lastOpenOrders,
    lastTickers,
    lastBalances,
  ] = await Promise.all([
    cmcService.fetchDatabaseCmc(),
    strategyService.fetchDatabaseStrategies(),
    tradesService.fetchDatabaseTrades(),
    ordersService.fetchDatabaseOrders(),
    tickersService.fetchDatabaseTickers(),
    balanceService.fetchDatabaseBalances(),
  ]);

  if (
    !lastCmc ||
    !lastStrategies ||
    !lastTrades ||
    !lastOpenOrders ||
    !lastTickers ||
    !lastBalances
  ) {
    console.error(
      "Error: One or more data retrieval functions returned invalid data."
    );
    return [];
  }
  const allValues = [];

  for (const balance of lastBalances) {
    if (balance.balance != "" && balance.balance > 0) {
      const assetBase = balance.base;
      const assetPlatform = balance.platform;

      const filteredCmc = lastCmc.find((cmc) => cmc.symbol === assetBase) || {};
      const filteredTrades =
        lastTrades.filter((trade) => trade.base === assetBase) || [];
      const filteredOpenOrders =
        lastOpenOrders.filter(
          (order) =>
            order.symbol === assetBase + "/USDT" ||
            order.symbol === assetBase + "/USDC" ||
            order.symbol === assetBase + "/BTC"
        ) || [];
      const filteredStrategy =
        lastStrategies.find(
          (strategy) =>
            strategy.asset === assetBase && strategy.strategies[assetPlatform]
        ) || {};

      const filteredTickers =
        lastTickers.filter(
          (ticker) =>
            ticker.symbol.startsWith(`${assetBase}/`) &&
            ticker.platform === assetPlatform
        ) || [];

      let values;
      if (
        !filteredCmc.length &&
        !filteredTrades.length &&
        !filteredOpenOrders.length &&
        !filteredStrategy.length &&
        !filteredTickers.length
      ) {
        if (assetBase === "USDT" || assetBase === "USDC") {
          values = calculateAssetMetrics(
            assetBase,
            assetPlatform,
            balance,
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
        balance,
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
 * @param {Object[]} lastBalances - Array of objects representing previous balances.
 * @param {Object[]} currentBalances - Array of objects representing current balances.
 * @returns {Object[]} - Returns an array of objects representing the differences found.
 */
function compareBalances(lastBalances, currentBalances) {
  const differences = [];

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
          `🚀 ~ file: processorService.js:256 ~ lastBalances.forEach ~ already deleted?: ${base}`
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
const stablecoins = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'PAX', 'GUSD', 'HUSD', 'USDN']; // Ajoutez d'autres stablecoins si nécessaire

// Fonction pour supprimer les doublons basés sur 'base' et 'platform'
/**
 * Removes duplicates and stablecoins from the differences array.
 * @param {Object[]} differences - Array of difference objects.
 * @returns {Object[]} - Array of unique differences, excluding stablecoins.
 */
function removeDuplicatesAndStablecoins(differences) {
  // Utiliser un Map pour supprimer les doublons
  const uniqueDifferences = new Map();
  
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

module.exports = {
  processBalanceChanges,
  calculateAllMetrics,
  compareBalances,
};
