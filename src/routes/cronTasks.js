// src/routes/cronTasks.js
const cron = require("node-cron");
const { cronMarkets } = require("../services/utils.js");

const exchangesToUpdate = ["binance", "kucoin", "htx", "okx", "gateio"];
const CRON_MARKETS = "08 14 * * *";
const CRON_BALANCES = "*/10 * * * *";

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

/**
 * Compares two balance arrays and returns the differences detected.
 * @param {Array} lastBalance - The array representing the last recorded balance.
 * @param {Array} currentBalance - The array representing the current balance.
 * @returns {Array} - An array containing the differences between the two balances.
 */
function compareBalances(lastBalance, currentBalance) {
  const differences = [];

  // Iterate through the symbols in the current balance
  currentBalance.forEach((current) => {
    // Check if the symbol in the current balance exists in the last balance
    const found = lastBalance.find((last) => last.symbol === current.symbol);

    // If the symbol does not exist in the last balance, it's a new symbol
    if (!found) {
      differences.push({ symbol: current.symbol, newSymbol: true });
    } else {
      // Check if there's a balance difference for this symbol
      if (found.balance !== current.balance) {
        differences.push({ symbol: current.symbol, balanceDifference: true });
      }
    }
  });

  return differences;
}

module.exports = { setupCronTasks };
