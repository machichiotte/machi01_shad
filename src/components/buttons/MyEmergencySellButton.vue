<!-- src/components/buttonsMyEmergencySellButton.vue -->
<template>
  <Button label="Emergency Sell" icon="pi pi-exclamation-triangle" severity="danger" class="mr-2" @click="emergencySellClicked"> </Button>
</template>

<script setup>
import { marketSellOrder, cancelAllSellOrders } from '../../js/orders.js'
import { loadingSpin, successSpinHtml } from '../../js/spinner.js'

const props = defineProps({
  selectedAssets: Object // Prop for selected assets
})

/**
 * @async
 * @function cancelOpenSellOrders
 * @param {Array} selectedRows - Array of selected assets
 * @returns {Promise<Array>} - Array of assets with successful cancellations
 */
const cancelOpenSellOrders = async (selectedRows) => {
  const cancellationPromises = selectedRows.map(async (row) => {
    if (row.nbOpenSellOrders > 0) {
      const cancel = await cancelAllSellOrders(row.platform, row.asset);
      return cancel.status === 200 ? row.asset : null;
    }
    return row.asset;
  });
  return (await Promise.all(cancellationPromises)).filter(Boolean);
};

/**
 * @async
 * @function placeMarketSellOrders
 * @param {Array} assetsToPlaceOrders - Array of assets to place orders for
 * @param {Array} selectedRows - Array of selected assets
 * @returns {Promise<Array>} - Array of order placement results
 */
const placeMarketSellOrders = async (assetsToPlaceOrders, selectedRows) => {
  return Promise.all(assetsToPlaceOrders.map(async (asset) => {
    const selectedRow = selectedRows.find((row) => row.asset === asset);
    const balance = selectedRow.balance;
    const orderResult = await marketSellOrder(selectedRow.platform, asset, balance);
    return `${asset}: ${orderResult}`;
  }));
};

/**
 * @async
 * @function emergencySellClicked
 * @returns {Promise<void>}
 */
const emergencySellClicked = async () => {
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
