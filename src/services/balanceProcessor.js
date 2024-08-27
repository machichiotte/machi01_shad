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
    const update = await updateOrdersFromServer(platform);
    const newTrades = [];

    // Récupération des tickers sauvegardés pour la plateforme spécifiée
    const tickers = await getSavedAllTickersByPlatform(platform);

    // Suppression des doublons dans le tableau des différences
    const uniqueDifferences = differences.filter(
      (v, i, a) =>
        a.findIndex(
          (t) =>
            t.base === v.base &&
            t.platform === v.platform
        ) === i
    );

    // Boucle sur les différences sans doublons
    for (const difference of uniqueDifferences) {
      for (const quote of quoteCurrencies) {
        const symbol = getSymbolForPlatform(platform, difference.base, quote);

        // Vérifie si le marché existe pour ce symbole
        const marketExists = tickers.find(
          (ticker) =>
            ticker.symbol === difference.base + "/" + quote &&
            ticker.platform === platform
        );

        if (marketExists) {
          console.log(
            `🚀 ~ file: balanceProcessor.js:46 ~ processBalanceChanges ~ marketExists: ${symbol}`
          );
          try {
            // Récupération et mappage des trades récents pour le symbole
            const tradeList = await fetchLastTrades(platform, symbol);
            const mappedTrades = mapTrades(platform, tradeList);
            console.log(
              `🚀 ~ file: balanceProcessor.js:53 ~ processBalanceChanges ~ mappedTrades:`,
              mappedTrades
            );
            newTrades.push(...mappedTrades);
          } catch (err) {
            console.error(
              `Error fetching trades for ${symbol}: ${err.message}`
            );
            continue;
          }
        } else {
          console.log(`Symbol not available: ${symbol}`);
        }
      }

      // Logique supplémentaire basée sur les types de différences
      if (difference.newSymbol) {
        console.log(`New symbol detected: ${difference.base}`);
      }

      if (difference.balanceDifference) {
        console.log(
          `Balance difference detected for symbol: ${difference.base}`
        );
      }

      if (difference.zeroBalance) {
        console.log(`Zero balance symbol detected: ${difference.base}`);
      }
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

      //console.log(`calculateAllMetrics values for ${assetSymbol}:`, values);
      allValues.push(values);
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

  // Récupérer toutes les plateformes possibles dans currentBalances
  const platformsSet = new Set(
    currentBalances.map((currentBalance) => currentBalance.platform)
  );

  console.log(
    `🚀 ~ file: balanceProcessor.js:272 ~ compareBalances ~ platformsSet:`,
    platformsSet
  );

  // Vérification des balances actuelles par rapport aux balances précédentes
  currentBalances.forEach((currentBalance) => {
    const { platform, base, balance: currentBalanceValue } = currentBalance;

    const matchedBalance = lastBalances.find(
      (item) => item.platform === platform && item.base === base
    );

    console.log(
      `🚀 ~ file: balanceProcessor.js:208 ~ lastBalances.forEach ~ balance:`,
      base + " " + currentBalanceValue + " " + platform + " " + matchedBalance
    );

    if (!matchedBalance) {
      // Nouveau symbole trouvé
      console.log(
        `🚀 ~ file: balanceProcessor.js:214 ~ currentBalances.forEach newSymbol ~ ${base}:`
      );
      differences.push({
        base,
        platform,
        newSymbol: true,
      });
    } else if (matchedBalance.balance !== currentBalanceValue) {
      // Différence de balance trouvée
      console.log(
        `🚀 ~ file: balanceProcessor.js:222 ~ currentBalances.forEach unmatchedBalance ~ ${base}:`
      );
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

    // Vérification si la plateforme existe dans platformsSet
    if (!platformsSet.has(platform)) {
      console.log(
        `🚀 ~ file: balanceProcessor.js ~ platform not found in currentBalances: ${platform}`
      );
      return;
    } else {
      const matchedBalance = currentBalances.find(
        (item) => item.platform === platform && item.base === base
      );

      console.log(
        `🚀 ~ file: balanceProcessor.js:244 ~ lastBalances.forEach ~ balance:`,
        base + " " + lastBalanceValue + " " + platform + " " + matchedBalance
      );

      if (!matchedBalance) {
        if (lastBalanceValue !== 0) {
          // Ancien symbole trouvé
          console.log(
            `🚀 ~ file: balanceProcessor.js:252 ~ lastBalances.forEach ~ oldSymbol: ${base}`
          );
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
        console.log(
          `🚀 ~ file: balanceProcessor.js:262 ~ lastBalances.forEach ~ unmatchedBalance: ${base}`
        );

        differences.push({
          base,
          platform,
          balanceDifference: true,
        });
      }
    }
  });

  return differences;
}

module.exports = {
  processBalanceChanges,
  calculateAllMetrics,
  compareBalances,
};
