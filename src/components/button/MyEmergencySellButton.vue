<!-- src/components/buttons/MyEmergencySellButton.vue -->
<template>
  <Button label="Emergency Sell" icon="pi pi-exclamation-triangle" severity="danger" class="mr-2"
    @click="emergencySellClicked"> </Button>
</template>

<script setup lang="ts">
import { marketSellOrder, cancelAllSellOrders } from '../../js/server/orders'
import { loadingSpin, successSpinHtml } from '../../js/utils/spinner'

interface SelectedAsset {
  platform: string;
  asset: string;
  balance: number;
  nbOpenSellOrders: number;
}

const props = defineProps<{
  selectedAssets: SelectedAsset[]; // Prop pour les actifs sélectionnés
}>();

/**
 * @async
 * @function cancelOpenSellOrders
 * @param {SelectedAsset[]} selectedRows - Tableau des actifs sélectionnés
 * @returns {Promise<string[]>} - Tableau des actifs avec des annulations réussies
 */
const cancelOpenSellOrders = async (selectedRows: SelectedAsset[]): Promise<string[]> => {
  const cancellationPromises = selectedRows.map(async (row) => {
    if (row.nbOpenSellOrders > 0) {
      try {
        await cancelAllSellOrders(row.platform, row.asset);
        return row.asset;
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
 * @param {string[]} assetsToPlaceOrders - Tableau des actifs pour passer des ordres
 * @param {SelectedAsset[]} selectedRows - Tableau des actifs sélectionnés
 * @returns {Promise<string[]>} - Tableau des résultats de placement d'ordres
 */
const placeMarketSellOrders = async (assetsToPlaceOrders: string[], selectedRows: SelectedAsset[]): Promise<string[]> => {
  return Promise.all(assetsToPlaceOrders.map(async (asset) => {
    const selectedRow = selectedRows.find((row) => row.asset === asset);

    if (!selectedRow) {
      throw new Error("selectedRow is undefined");
    }
    const balance = selectedRow?.balance || 0; // Utiliser 0 si selectedRow est undefined
    const orderResult = await marketSellOrder(selectedRow.platform, asset, balance);
    return `${asset}: ${orderResult}`;
  }));
};

/**
 * @async
 * @function emergencySellClicked
 * @returns {Promise<void>}
 */
const emergencySellClicked = async (): Promise<void> => {
  const selectedRows = props.selectedAssets;
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