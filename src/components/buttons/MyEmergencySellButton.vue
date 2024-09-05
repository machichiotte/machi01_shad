<!-- src/components/buttonsMyEmergencySellButton.vue -->
<template>
  <Button label="Emergency Sell" icon="pi pi-exclamation-triangle" severity="danger" class="mr-2" @click="emergencySellClicked"> </Button>
</template>

<script setup>
import { marketSellOrder, cancelAllSellOrders } from '../../js/orders.js'
import { loadingSpin, successSpinHtml, errorSpin } from '../../js/spinner.js'

const props = defineProps({
  selectedAssets: Object // Prop pour les assets sélectionnés
})

const emergencySellClicked = async () => {
  console.log(`🚀 ~ file: MyEmergencySellButton.vue:15 ~ emergencySellClicked ~ async:`)
  const selectedRows = props.selectedAssets;
  console.log(`🚀 ~ file: MyEmergencySellButton.vue:17 ~ emergencySellClicked ~ selectedRows:`, selectedRows)

  loadingSpin();

  const cancellationPromises = selectedRows.map(async (row) => {
    if (row.nbOpenSellOrders > 0) {
      const cancel = await cancelAllSellOrders(row.platform, row.asset);
      return cancel.status === 200 ? row.asset : null; // Retourne l'actif seulement si l'annulation a réussi
    }
    return row.asset; // Retourne l'actif même si aucune annulation n'était nécessaire
  });

  const cancellationResults = await Promise.all(cancellationPromises);

  console.log(`🚀 ~ file: MyEmergencySellButton.vue:15 ~ emergencySellClicked ~ cancel:`)

  // Filtre les annulations réussies et extrait les actifs
  const assetsToPlaceOrders = cancellationResults.filter(Boolean);

  if (assetsToPlaceOrders.length > 0) {
    const orderPlacementPromises = assetsToPlaceOrders.map(async (asset) => {
      const selectedRow = selectedRows.find((row) => row.asset === asset);
      console.log(`🚀 ~ file: MyEmergencySellButton.vue:39 ~ orderPlacementPromises ~ selectedRow:`, selectedRow)
      const balance = selectedRow.balance; // Montant total à vendre au prix du marché
      console.log(`🚀 ~ file: MyEmergencySellButton.vue:41 ~ orderPlacementPromises ~ balance:`, balance)

      const orderResult = await marketSellOrder(selectedRow.platform, asset, balance);
      console.log(`🚀 ~ file: MyEmergencySellButton.vue:44 ~ orderPlacementPromises ~ orderResult:`, orderResult)

      return `${asset}: ${orderResult}`; // Résultat pour le journal
    });

    const orderPlacementResults = await Promise.all(orderPlacementPromises);

    successSpinHtml('Emergency sell completed', orderPlacementResults.join('<br>'), true, true);
  } else {
    successSpinHtml('NOTHING', 'No cancellations/sells needed.', true, true);
  }
};
</script>
