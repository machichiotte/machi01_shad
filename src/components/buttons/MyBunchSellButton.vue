<!-- src/components/MyBunchSellButton.vue -->
<template>
  <Button label="Add Sell Orders" icon="pi pi-cart-plus" severity="info" class="mr-2" @click="iAmClicked"></Button>
</template>

<script setup lang="ts">
import { bunchLimitSellOrders, cancelAllSellOrders } from '@js/orders.js'
import { loadingSpin, successSpinHtml, errorSpin } from '@js/spinner.js'

// Définir les types pour les props
interface SelectedAsset {
  asset: string;
  platform: string;
  nbOpenSellOrders: number;
  amountTp1: number;
  amountTp2: number;
  amountTp3: number;
  amountTp4: number;
  amountTp5: number;
  priceTp1: number;
  priceTp2: number;
  priceTp3: number;
  priceTp4: number;
  priceTp5: number;
}

const props = defineProps<{
  selectedAssets: SelectedAsset[]; // Changement du type de prop pour un tableau d'objets SelectedAsset
}>();

/**
 * @async
 * @function cancelExistingSellOrders
 * @param {SelectedAsset[]} selectedRows - Tableau d'actifs sélectionnés
 * @returns {Promise<string[]>} - Tableau d'actifs avec des annulations réussies
 */
const cancelExistingSellOrders = async (selectedRows: SelectedAsset[]): Promise<string[]> => {
  const cancellationResults = await Promise.all(selectedRows.map(async (row) => {
    try {
      if (row.nbOpenSellOrders > 0) {
        const cancel = await cancelAllSellOrders(row.platform, row.asset);
        if (cancel.status !== 200) throw new Error(`Failed to cancel sell orders for ${row.asset}`);
      }
      return row.asset;
    } catch (error) {
      console.error(error);
      return null;
    }
  }));
  return cancellationResults.filter(Boolean) as string[];
}

/**
 * @async
 * @function placeSellOrders
 * @param {string[]} assetsToPlaceOrders - Tableau d'actifs pour passer des commandes
 * @param {SelectedAsset[]} selectedRows - Tableau d'actifs sélectionnés
 * @returns {Promise<string[]>} - Tableau des résultats de placement de commandes
 */
const placeSellOrders = async (assetsToPlaceOrders: string[], selectedRows: SelectedAsset[]): Promise<string[]> => {
  return await Promise.all(assetsToPlaceOrders.map(async (asset) => {
    const selectedRow = selectedRows.find(row => row.asset === asset);
    const amounts = [selectedRow.amountTp1, selectedRow.amountTp2, selectedRow.amountTp3, selectedRow.amountTp4, selectedRow.amountTp5];
    const prices = [selectedRow.priceTp1, selectedRow.priceTp2, selectedRow.priceTp3, selectedRow.priceTp4, selectedRow.priceTp5];

    try {
      const orderResults = await Promise.all(
        amounts.map(async (amount, index) => {
          try {
            const result = await bunchLimitSellOrders(selectedRow.platform, asset, amount, prices[index]);
            console.log('result', result);
            return result.status;
          } catch (error) {
            return error.response ? error.response.status : 500;
          }
        })
      );
      return `${asset}: ${orderResults.join(', ')}`;
    } catch (error) {
      console.error(`Failed to place orders for ${asset}: ${error}`);
      return `Error placing orders for ${asset}`;
    }
  }));
}

/**
 * @async
 * @function iAmClicked
 * @returns {Promise<void>}
 */
const iAmClicked = async (): Promise<void> => {
  const selectedRows = props.selectedAssets;
  loadingSpin();

  const assetsToPlaceOrders = await cancelExistingSellOrders(selectedRows);
  const orderPlacementResults = await placeSellOrders(assetsToPlaceOrders, selectedRows);

  successSpinHtml('Save completed', orderPlacementResults.join('<br>'), true, true);
}
</script>
