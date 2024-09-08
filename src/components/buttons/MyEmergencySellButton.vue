<!-- src/components/buttonsMyEmergencySellButton.vue -->
<template>
  <Button label="Emergency Sell" icon="pi pi-exclamation-triangle" severity="danger" class="mr-2" @click="emergencySellClicked"> </Button>
</template>

<script setup>
import { marketSellOrder, cancelAllSellOrders } from '../../js/orders.js'
import { loadingSpin, successSpinHtml } from '../../js/spinner.js'

const props = defineProps({
  selectedAssets: Object // Prop pour les assets sélectionnés
})

/**
 * @async
 * @function emergencySellClicked
 * @returns {Promise<void>}
 */
const emergencySellClicked = async () => {
  const selectedRows = props.selectedAssets;

  loadingSpin();

  const cancellationPromises = selectedRows.map(async (row) => {
    if (row.nbOpenSellOrders > 0) {
      const cancel = await cancelAllSellOrders(row.platform, row.asset);
      return cancel.status === 200 ? row.asset : null; // Retourne l'actif seulement si l'annulation a réussi
    }
    return row.asset; // Retourne l'actif même si aucune annulation n'était nécessaire
  });

  const cancellationResults = await Promise.all(cancellationPromises);

  // Filtre les annulations réussies et extrait les actifs
  const assetsToPlaceOrders = cancellationResults.filter(Boolean);

  if (assetsToPlaceOrders.length > 0) {
    const orderPlacementPromises = assetsToPlaceOrders.map(async (asset) => {
      const selectedRow = selectedRows.find((row) => row.asset === asset);
      const balance = selectedRow.balance; // Montant total à vendre au prix du marché
      const orderResult = await marketSellOrder(selectedRow.platform, asset, balance);

      return `${asset}: ${orderResult}`; // Résultat pour le journal
    });

    const orderPlacementResults = await Promise.all(orderPlacementPromises);

    successSpinHtml('Emergency sell completed', orderPlacementResults.join('<br>'), true, true);
  } else {
    successSpinHtml('NOTHING', 'No cancellations/sells needed.', true, true);
  }
};
</script>
