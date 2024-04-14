// src/routes/cronTasks.js
const cron = require("node-cron");
const { cronMarkets } = require("../services/utils.js");
const { mapTrades } = require("../services/mapping.js");
const {
  getLastBalance,
  fetchCurrentBalance,
  saveBalanceInDatabase,
} = require("../controllers/balanceController.js");
const {
  updateOrdersFromServer,
} = require("../controllers/ordersController.js");
const {
  fetchLastTrades,
  saveTradesToDatabase,
} = require("../controllers/tradesController.js");
const exchangesToUpdate = ["binance", "kucoin", "htx", "okx", "gateio"];
//const exchangesToUpdate = ["binance"];
const CRON_MARKETS = "* */12 * * *";
const CRON_BALANCES = "*/2 * * * *";

async function updateMarketsForExchange(exchangeId) {
  try {
    await cronMarkets(exchangeId);
    console.log(`updateMarkets completed for ${exchangeId}`);
  } catch (error) {
    console.error(`Error updating markets for ${exchangeId}:`, error);
  }
}

function setupCronTasks() {
  //cron.schedule(CRON_TICKERS) a preparer afin de recuperer les prix actuels sur les differents exchanges

  cron.schedule(CRON_MARKETS, async () => {
    console.log("Running the cron job for updateMarkets...");

    for (const exchangeId of exchangesToUpdate) {
      await updateMarketsForExchange(exchangeId);
    }
  });

  cron.schedule(CRON_BALANCES, async () => {
    console.log("Running the cron job for updating balances...");

    for (const exchangeId of exchangesToUpdate) {
      try {
        // Récupérer la dernière balance enregistrée en base de données
        const lastBalance = await getLastBalance();

        // Récupérer la balance actuelle depuis l'exchange
        const currentBalance = await fetchCurrentBalance(exchangeId);

        // Comparer les deux balances
        const differences = compareBalances(lastBalance, currentBalance);
        console.log("differences", differences);

        // On remplace les anciennes balances par les nouvelles
        saveBalanceInDatabase(currentBalance, exchangeId);

        // Si des différences sont détectées
        if (differences.length > 0) {
          // Effectuer les actions nécessaires pour mettre à jour les données
          await handleBalanceDifferences(differences, exchangeId);
        }
      } catch (error) {
        console.error(`Error updating balances for ${exchangeId}:`, error);
      }
    }
  });
}

async function handleBalanceDifferences(differences, exchangeId) {
  try {
    console.log("Starting handleBalanceDifferences...");

    // Mettre à jour les ordres ouverts depuis le serveur
    console.log("Updating open orders from server...");
    await updateOrdersFromServer(exchangeId);
    console.log("Open orders updated.");

    const newTrades = [];

    // Parcourir les différences pour mettre à jour les trades
    for (const difference of differences) {
      console.log(`Processing balance difference for symbol: ${difference.symbol}`);

      // Ajouter "/USDT" au symbole pour obtenir la paire complète
      const symbol = difference.symbol + "/USDT";

      // Récupérer les derniers trades pour la paire de trading
      console.log(`Fetching last trades for symbol: ${symbol}...`);
      const tradeList = await fetchLastTrades(exchangeId, symbol);

      // Mapper les trades en fonction de la plateforme
      const mappedTrades = mapTrades(exchangeId, tradeList);
      console.log(`Mapped ${mappedTrades.length} trades for symbol: ${symbol}`);

      newTrades.push(...mappedTrades);

      // Vérifier si la différence concerne un nouveau symbole
      if (difference.newSymbol) {
        // Afficher un message pour indiquer qu'une nouvelle stratégie doit être choisie par l'utilisateur
        console.log("New symbol detected. Prompting user to choose strategy...");
      }
    }

    console.log(`Total new trades to be saved: ${newTrades.length}`);

    // Enregistrer les nouveaux trades dans la base de données MongoDB
    console.log("Saving new trades to database...");
    await saveTradesToDatabase(newTrades);
    console.log("New trades saved to database.");

    console.log("handleBalanceDifferences completed successfully.");

  } catch (error) {
    // Gérer les erreurs éventuelles
    console.error(`Error handling balance differences for ${exchangeId}:`, error);
    throw error;
  }
}


/**
 * Compares two balance arrays and returns the differences detected.
 * @param {Array} lastBalance - The array representing the last recorded balance.
 * @param {Array} currentBalance - The array representing the current balance.
 * @returns {Array} - An array containing the differences between the two balances.
 */
function compareBalances(lastBalance, currentBalance) {
  const differences = [];

  // Créer un objet pour stocker les balances précédentes par symbole pour une recherche plus efficace
  const lastBalancesBySymbol = {};
  for (const balance of lastBalance) {
    lastBalancesBySymbol[balance.symbol] = balance;
  }

  // Parcourir les balances actuelles pour comparer avec les balances précédentes
  for (const current of currentBalance) {
    // Vérifier si le symbole existe dans les balances précédentes
    if (lastBalancesBySymbol.hasOwnProperty(current.symbol)) {
      // Récupérer la balance précédente correspondante
      const last = lastBalancesBySymbol[current.symbol];

      // Comparer les balances
      if (
        last.balance !== current.balance &&
        last.platform == current.platform
      ) {
        // Si les balances sont différentes, ajouter à la liste des différences
        differences.push({ symbol: current.symbol, balanceDifference: true });
      }
    } else {
      // Si le symbole est nouveau, ajouter à la liste des différences
      differences.push({ symbol: current.symbol, newSymbol: true });
    }
  }

  return differences;
}

module.exports = { setupCronTasks };
