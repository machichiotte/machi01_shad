// src/services/cron/balanceProcessor.js
const { calculateAssetMetrics } = require("./metrics/global.js");

const { mapTrades } = require("./mapping.js");
const { fetchDatabaseCmc } = require("../controllers/cmcController.js");
const {
  fetchDatabaseStrategies,
} = require("../controllers/strategyController.js");
const {
  fetchDatabaseTrades,
  saveTradesToDatabase,
  fetchLastTrades,
} = require("../controllers/tradesController.js");
const {
  fetchDatabaseOrders,
  updateOrdersFromServer,
} = require("../controllers/ordersController.js");
const {
  fetchDatabaseTickers,
  getSavedAllTickersByPlatform,
} = require("../controllers/tickersController.js");
const {
  fetchDatabaseBalances,
} = require("../controllers/balanceController.js");
const { getSymbolForPlatform } = require("../utils/platformUtil.js");

/**
 * Traite les différences de balances détectées entre les balances actuelles et les balances précédentes.
 * Cette fonction met à jour les ordres du serveur, récupère les tickers et traite les trades pour les symboles
 * correspondant aux différences détectées. Elle gère également les nouveaux symboles, les différences de balance,
 * et les balances nulles (zéro).
 *
 * @param {Object[]} differences - Tableau d'objets représentant les différences de balances détectées.
 * @param {string} platform - Nom de la plateforme pour laquelle les différences doivent être traitées.
 * @returns {Promise<void>} - Cette fonction est asynchrone et retourne une promesse.
 */
async function processBalanceChanges(differences, platform) {
  const quoteCurrencies = ["USDT", "BTC", "ETH", "USDC"];

  try {
    // Mise à jour des ordres depuis le serveur
    await updateOrdersFromServer(platform);

    // Récupération des tickers sauvegardés pour la plateforme spécifiée
    const tickers = await getSavedAllTickersByPlatform(platform);

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
      await saveTradesToDatabase(newTrades);
    }
  } catch (error) {
    console.error(`Error handling balance differences for ${platform}:`, error);
    throw error;
  }
}

/**
 * Supprime les doublons dans les différences de balance.
 * @param {Object[]} differences - Tableau des différences de balance.
 * @returns {Object[]} - Tableau des différences sans doublons.
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
 * Traite une différence spécifique, récupère les trades, et met à jour la liste des nouveaux trades.
 * @param {Object} difference - Objet représentant une différence de balance.
 * @param {string} platform - Nom de la plateforme.
 * @param {Object[]} tickers - Tableau des tickers pour la plateforme.
 * @param {string[]} quoteCurrencies - Liste des devises de référence.
 * @param {Object[]} newTrades - Tableau des nouveaux trades détectés.
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
        const tradeList = await fetchLastTrades(platform, symbol);
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
 * Log des informations basées sur le type de différence détectée.
 * @param {Object} difference - Objet représentant une différence de balance.
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

async function calculateAllMetrics() {
  const [
    lastCmc,
    lastStrategies,
    lastTrades,
    lastOpenOrders,
    lastTickers,
    lastBalances,
  ] = await Promise.all([
    fetchDatabaseCmc(),
    fetchDatabaseStrategies(),
    fetchDatabaseTrades(),
    fetchDatabaseOrders(),
    fetchDatabaseTickers(),
    fetchDatabaseBalances(),
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
 * Compare les balances actuelles avec celles de la base de données précédente.
 * @param {Object[]} lastBalances - Tableau d'objets représentant les balances précédentes.
 * @param {Object[]} currentBalances - Tableau d'objets représentant les balances actuelles.
 * @returns {Object[]} - Retourne un tableau d'objets représentant les différences trouvées.
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
          `🚀 ~ file: balanceProcessor.js:256 ~ lastBalances.forEach ~ already deleted?: ${base}`
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
