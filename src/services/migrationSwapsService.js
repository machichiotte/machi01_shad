// src/services/migrationSwapsService.js

const {
  fetchDatabaseMigrationSwaps,
} = require("../controllers/swapController");
const {
  fetchDatabaseStrategies,
  updateStrategyById,
} = require("../controllers/strategyController");
const {
  fetchDatabaseTrades,
  updateTradeById,
} = require("../controllers/tradesController");

/**
 * Function to handle asset swaps in trades and strategies.
 */
async function handleMigrationSwaps() {
  try {
    // Récupération de tous les swaps
    const swaps = await fetchDatabaseMigrationSwaps();

    // Récupération des trades et des stratégies
    const trades = await fetchDatabaseTrades();
    const strategies = await fetchDatabaseStrategies();

    for (const swap of swaps) {
      const { oldAsset, newAsset, swapRate, platform, delistingDate } = swap;

      // Vérification des dates de delisting et de listing
      const now = new Date();
      const delisting = new Date(delistingDate);

      // On attend que la date de delisting soit dépassée
      if (now < delisting) {
        console.log(
          `Waiting for delisting date (${delistingDate}) of ${oldAsset} to be exceeded.`
        );
        continue; // On continue si le delisting n'a pas encore eu lieu
      }

      // Application des changements pour les trades
      for (const trade of trades) {
        if (trade.base === oldAsset && trade.platform === platform) {
          // Calcul du ratio de swap
          const [oldRatio, newRatio] = swapRate.split(":").map(Number);
          const swapMultiplier = newRatio / oldRatio;

          // Préparer les données mises à jour
          const updatedTrade = {
            base: newAsset,
            pair: trade.pair.replace(oldAsset, newAsset),
            amount: trade.amount * swapMultiplier,
            price: trade.total / (trade.amount * swapMultiplier),
            fee:
              trade.feecoin === oldAsset
                ? trade.fee * swapMultiplier
                : trade.fee,
            feecoin: trade.feecoin === oldAsset ? newAsset : trade.feecoin,
            swap: true,
          };

          // Mettre à jour le document dans la collection
          await updateTradeById(trade._id, updatedTrade);

          console.log(
            `Trades Swap completed for ${oldAsset} to ${newAsset} on platform ${platform}.`
          );
        }
      }

      // Application des changements pour les stratégies
      for (const strategy of strategies) {
        if (strategy.asset === oldAsset && strategy.strategies[platform]) {
          // Préparer les données mises à jour
          const updatedStrategy = { asset: newAsset };

          // Mettre à jour la stratégie dans la collection
          await updateStrategyById(strategy._id, updatedStrategy);

          console.log(
            `Strategy Swap completed for ${oldAsset} to ${newAsset} on platform ${platform}.`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error handling swaps:", error);
  }
}

module.exports = { handleMigrationSwaps };
