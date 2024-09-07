<!-- src/components/MyBunchSellButton.vue -->
<template>
  <Button label="Add Sell Orders" icon="pi pi-cart-plus" severity="info" class="mr-2" @click="iAmClicked"></Button>
</template>

<script setup>
import { bunchLimitSellOrders, cancelAllSellOrders } from '../../js/orders.js'
import { loadingSpin, successSpinHtml, errorSpin } from '../../js/spinner.js'

const props = defineProps({
  selectedAssets: Array // Change prop type to Array as it should be an array
})

const iAmClicked = async () => {
  // Access selectedAssets directly
  const selectedRows = props.selectedAssets;

  loadingSpin();

  // Track results for cancellation and order placement
  const cancellationResults = await Promise.all(selectedRows.map(async (row) => {
    try {
      if (row.nbOpenSellOrders > 0) {
        const cancel = await cancelAllSellOrders(row.platform, row.asset);
        if (cancel.status !== 200) throw new Error(`Failed to cancel sell orders for ${row.asset}`);
      }
      return row.asset; // Return asset if no errors
    } catch (error) {
      console.error(error); // Log the error
      return null; // Return null to indicate failure
    }
  }));

  // Filter out failed cancellations
  const assetsToPlaceOrders = cancellationResults.filter(Boolean);

  const orderPlacementResults = await Promise.all(assetsToPlaceOrders.map(async (asset) => {
    const selectedRow = selectedRows.find(row => row.asset === asset);
    const amounts = [
      selectedRow.amountTp1,
      selectedRow.amountTp2,
      selectedRow.amountTp3,
      selectedRow.amountTp4,
      selectedRow.amountTp5,
    ];
    const prices = [
      selectedRow.priceTp1,
      selectedRow.priceTp2,
      selectedRow.priceTp3,
      selectedRow.priceTp4,
      selectedRow.priceTp5,
    ];

    try {
      // Nested Promise.all for parallel bunchLimitSellOrders
      const orderResults = await Promise.all(
        amounts.map(async (amount, index) => {
          try {
            const result = await bunchLimitSellOrders(selectedRow.platform, asset, amount, prices[index]);
            console.log('résultat', result);
            return result.status;
          } catch (error) {
            //console.error(`Échec de placement d'ordre pour ${asset}`);
            return error.response ? error.response.status : 500;
          }
        })
      );

      return `${asset}: ${orderResults.join(', ')}`; // Combine results for logging
    } catch (error) {
      console.error(`Failed to place orders for ${asset}: ${error}`);
      return `Error placing orders for ${asset}`;
    }
  }));

  // Determine if any errors occurred
  successSpinHtml('Save completed', orderPlacementResults.join('<br>'), true, true);
}
</script>
