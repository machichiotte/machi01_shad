<!-- src/components/buttons/MyEmergencySellButton.vue -->
<script setup lang="ts">
import { addMarketSellOrder, cancelAllSellOrders } from '../../js/server/order'
import { loadingSpin, successSpinHtml } from '../../js/utils/spinner'

interface selectedBase {
  platform: string;
  base: string;
  balance: number;
  nbOpenSellOrders: number;
}

const props = defineProps<{
  selectedBases: selectedBase[]; // Prop pour les actifs sélectionnés
}>();

/**
 * @async
 * @function cancelOpenSellOrders
 * @param {selectedBase[]} selectedRows - Tableau des actifs sélectionnés
 * @returns {Promise<string[]>} - Tableau des actifs avec des annulations réussies
 */
const cancelOpenSellOrders = async (selectedRows: selectedBase[]): Promise<string[]> => {
  const cancellationPromises = selectedRows.map(async (row) => {
    if (row.nbOpenSellOrders > 0) {
      try {
        await cancelAllSellOrders(row.platform, row.base);
        return row.base;
      } catch (error) {
        return null;
      }
    }
  });
  return (await Promise.all(cancellationPromises)).filter(Boolean) as string[];
};

/**
 * @async
 * @function placeMarketSellOrders
 * @param {string[]} bases - Tableau des actifs pour passer des ordres
 * @param {selectedBase[]} selectedRows - Tableau des actifs sélectionnés
 * @returns {Promise<string[]>} - Tableau des résultats de placement d'ordres
 */
const placeMarketSellOrders = async (bases: string[], selectedRows: selectedBase[]): Promise<string[]> => {
  return Promise.all(bases.map(async (base) => {
    const selectedRow = selectedRows.find((row) => row.base === base);

    if (!selectedRow) {
      throw new Error("selectedRow is undefined");
    }
    const balance = selectedRow?.balance || 0; // Utiliser 0 si selectedRow est undefined
    const orderResult = await addMarketSellOrder(selectedRow.platform, base, balance);
    return `${base}: ${orderResult}`;
  }));
};

/**
 * @async
 * @function emergencySellClicked
 * @returns {Promise<void>}
 */
const emergencySellClicked = async (): Promise<void> => {
  const selectedRows = props.selectedBases;
  loadingSpin();

  const assetsToPlaceOrders = await cancelOpenSellOrders(selectedRows);

  if (assetsToPlaceOrders.length > 0) {
    const orderPlacementResults = await placeMarketSellOrders(assetsToPlaceOrders, selectedRows);
    successSpinHtml('Emergency sell completed', orderPlacementResults.join('<br>'), true, true);
  } else {
    successSpinHtml('NOTHING', 'No cancellations/sells needed.', true, true);
  }
};
</script>

<template>
  <Button label="Emergency Sell" icon="pi pi-exclamation-triangle" severity="danger" class="mr-2"
    @click="emergencySellClicked"> </Button>
</template>