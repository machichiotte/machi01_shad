// src/routes/cronTasks.js
const cron = require("node-cron");
const { cronMarkets } = require("../services/utils.js");
const {
  getLastBalance,
  fetchCurrentBalance,
} = require("../controllers/balanceController.js");
const {
  updateOrdersFromServer,
} = require("../controllers/ordersController.js");

const exchangesToUpdate = ["binance", "kucoin", "htx", "okx", "gateio"];
//const exchangesToUpdate = ["binance"];
const CRON_MARKETS = "08 14 * * *";
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
  console.log("handleBalanceDifferences");

  try {
    // Faire appel à une fonction pour mettre à jour les ordres ouverts
    await updateOrdersFromServer(exchangeId);

    // Parcourir les différences pour mettre à jour les trades
    for (const difference of differences) {
      // Vérifier si la différence concerne un nouveau symbol
      if (difference.newSymbol) {
        // Faire appel à une fonction pour mettre à jour les trades

        // await updateTrade(difference.symbol, exchangeId);
        console.log("updateTrade");
      }
    }
  } catch (error) {
    // Gérer les erreurs éventuelles
    console.error(
      `Error handling balance differences for ${exchangeId}:`,
      error
    );
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
        differences.push({ symbol: current.symbol });
      }
    } else {
      // Si le symbole est nouveau, ajouter à la liste des différences
      differences.push({ symbol: current.symbol });
    }
  }

  return differences;
}

module.exports = { setupCronTasks };
