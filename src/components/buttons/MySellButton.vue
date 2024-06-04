<!-- src/components/MySellButton.vue -->
<template>
  <Button label="Add Sell Orders" icon="pi pi-cart-plus" severity="info" class="mr-2" @click="iAmClicked"> </Button>
</template>

<script setup>
import { bunchLimitSellOrders, cancelAllOrders, cancelAllSellOrders } from '../../js/orders.js'
import { loadingSpin, successSpinHtml, errorSpin } from '../../js/spinner.js'

const props = defineProps({
  selectedAssets: Object // Define the prop type as object
})

const iAmClicked = async () => {
  // Now you can access selectedAssets.selectedRows
  const selectedRows = props.selectedAssets

  loadingSpin()
    
  const cancellationPromises = selectedRows.map(async (row) => {
    if (row.nbOpenSellOrders > 0) {
      const cancel = await cancelAllSellOrders(row.exchangeId, row.asset );
      return cancel.status === 200 ? row.asset : null; // Return asset only if cancellation successful
    }
    return row.asset; // Return asset even if no cancellation was needed
  });

  const cancellationResults = await Promise.all(cancellationPromises);

  // Filter successful cancellations and extract assets
  const assetsToPlaceOrders = cancellationResults.filter(Boolean); // Remove nulls

  console.log(assetsToPlaceOrders)

  // Promise.all for parallel order placements (if cancellations were successful)
  if (assetsToPlaceOrders.length > 0) {
    const orderPlacementPromises = assetsToPlaceOrders.map(async (asset) => {
      const selectedRow = selectedRows.find((row) => row.asset === asset);
      console.log(selectedRow)
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

      // Nested Promise.all for parallel bunchLimitSellOrders
      const orderResults = await Promise.all(
        amounts.map(async (amount, index) => {
          return await bunchLimitSellOrders(selectedRow.exchangeId, asset, amount, prices[index]);
        })
      );

      return `${asset}: ${orderResults.join(', ')}`; // Combine results for logging
    });

    const orderPlacementResults = await Promise.all(orderPlacementPromises);

    successSpinHtml('Save completed', orderPlacementResults.join('<br>'), true, true);
  } else {
    // Handle scenario where no cancellations were necessary
    successSpinHtml('NOTHING', 'No cancellations/sells needed.', true, true);
  }
}
</script>
../../js/orders.js../../js/spinner.js