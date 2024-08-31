// src/services/swapService.js

const { fetchDatabaseSwaps } = require("../controllers/swapController");
const {
  fetchDatabaseStrategies,
} = require("../controllers/strategyController");
const { fetchDatabaseTrades } = require("../controllers/tradesController");

/**
 * Function to handle asset swaps in trades and strategies.
 */
async function handleSwap() {
  try {
    // Récupération de tous les swaps
    const swaps = await fetchDatabaseSwaps();

    // Récupération des trades et des stratégies
    const trades = await fetchDatabaseTrades();
    const strategies = await fetchDatabaseStrategies();

    for (const swap of swaps) {
      const {
        oldAsset,
        newAsset,
        swapRate,
        platform,
        delistingDate,
        listingDate,
      } = swap;

      // Vérification des dates de delisting et de listing
      const now = new Date();
      const delisting = new Date(delistingDate);
      const listing = new Date(listingDate);

      // On attend que la date de delisting soit dépassée
      if (now < delisting) {
        console.log(
          `Waiting for delisting date (${delistingDate}) of ${oldAsset} to be exceeded.`
        );
        continue; // On continue si le delisting n'a pas encore eu lieu
      }

      // On vérifie que la date de listing est atteinte
      if (now < listing) {
        console.log(
          `Waiting for listing date (${listingDate}) of ${newAsset} to be reached.`
        );
        continue; // On continue si le listing n'a pas encore eu lieu
      }

      // Application des changements pour les trades
      for (const trade of trades) {
        if (trade.base === oldAsset && trade.platform === platform) {
          // Calcul du ratio de swap
          const [oldRatio, newRatio] = swapRate.split(":").map(Number);
          const swapMultiplier = newRatio / oldRatio;

          // Mettre à jour le trade avec les nouvelles valeurs
          trade.base = newAsset;
          trade.pair = trade.pair.replace(oldAsset, newAsset);

          // Ajuster le montant en fonction du taux de swap
          trade.amount = trade.amount * swapMultiplier;

          // Ajuster le prix pour maintenir le total constant
          trade.price = trade.total / trade.amount;

          // Ajuster la fee si elle est dans l'ancien asset
          if (trade.feecoin === oldAsset) {
            trade.fee = trade.fee * swapMultiplier;
            trade.feecoin = newAsset;
          }

          // Marquer le trade comme ayant subi un swap
          trade.swap = true;

          // Sauvegarder le trade mis à jour dans la base de données
          await trade.save();
        }
      }

      // Application des changements pour les stratégies
      for (const strategy of strategies) {
        if (strategy.asset === oldAsset && strategy.strategies[platform]) {
          // Changer l'asset de la stratégie pour la nouvelle
          strategy.asset = newAsset;

          // Sauvegarder la stratégie mise à jour dans la base de données
          await strategy.save();
        }
      }

      console.log(
        `Swap completed for ${oldAsset} to ${newAsset} on platform ${platform}.`
      );
    }
  } catch (error) {
    console.error("Error handling swaps:", error);
  }
}

module.exports = { handleSwap };
