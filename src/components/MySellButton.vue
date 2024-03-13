<!-- src/components/MySellButton.vue -->
<template>
  <Button label="Add Sell Orders" icon="pi pi-cart-plus" severity="info" class="mr-2" @click="iAmClicked"> </Button>
</template>

<script setup>
import { ref } from 'vue'
import { bunchOrders, cancelAllOrders } from '../js/orders.js'
import { loadingSpin, successSpinHtml, errorSpin } from '../js/spinner.js'

const model = ref(null)

const props = defineProps({
  selectedAssets: Object // Define the prop type as object
})

const iAmClicked = async () => {
  // Now you can access selectedAssets.selectedRows
  const selectedRows = props.selectedAssets

  loadingSpin()

  // Promise.all for parallel cancellations
  /*const cancellationPromises = selectedRows.map(async (row) => {
      if (row.nbOpenSellOrders > 0) {
        const cancel = await cancelAllOrders(row.exchangeId, row.asset);
        return `Cancel ${row.asset}: ${cancel.status}`; // Combine results for logging
      }
      return null; // Return null for rows without cancellation
    });*/

  const cancellationPromises = selectedRows.map(async (row) => {
    if (row.nbOpenSellOrders > 0) {
      console.log('cancelasset', row.asset)
      const cancel = await cancelAllOrders(row.exchangeId, row.asset);
      console.log('cancan', cancel);
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

      /*
      const results = [];
      for (let i = 0; i < 5; i++) {
        results[i] = await bunchOrders(selectedRow.exchangeId, asset, amounts[i], prices[i]);
      }
      return `Asset ${asset}: ${results.join(', ')}`; // Combine results for logging
    });

    const orderPlacementResults = await Promise.all(orderPlacementPromises);*/
      // Nested Promise.all for parallel bunchOrders
      const orderResults = await Promise.all(
        amounts.map(async (amount, index) => {
          return await bunchOrders(selectedRow.exchangeId, asset, amount, prices[index]);
        })
      );

      return `Asset ${asset}: ${orderResults.join(', ')}`; // Combine results for logging
    });

    const orderPlacementResults = await Promise.all(orderPlacementPromises);

    successSpinHtml('Save completed', orderPlacementResults.join('<br>'), true, true);
  } else {
    // Handle scenario where no cancellations were necessary
    successSpinHtml('Save completed', 'No cancellations needed.', true, true);
  }

  console.log(selectedRows[0]);

  /*
    for (let rows in selectedRows) {
      const asset = selectedRows[rows].asset
      const exchangeId = selectedRows[rows].exchangeId
  
      let resultText = `${asset}<br>`
  
      let isNeedCancel = false
      let cancel
  
      //TODO check pour ne suppr que les sell orders
      console.log('selectedRows[rows]', selectedRows[rows])
      console.log('selectedRows[asset]', selectedRows[rows].asset)
      console.log('selectedRows[nbOpenSellOrders]', selectedRows[rows].nbOpenSellOrders)
      console.log('selectedRows[rows].openSellOrders > 0', selectedRows[rows].nbOpenSellOrders > 0)
      if (selectedRows[rows].nbOpenSellOrders > 0) {
        isNeedCancel = true
        cancel = await cancelAllOrders(exchangeId, asset)
  
        resultText += `Cancel : ${cancel.status}<br>`
      }
  
  
  
  
  
  
      
  
      if (!isNeedCancel || cancel.status == 200) {
        const amounts = [
          selectedRows[rows].amountTp1,
          selectedRows[rows].amountTp2,
          selectedRows[rows].amountTp3,
          selectedRows[rows].amountTp4,
          selectedRows[rows].amountTp5
        ]
        const prices = [
          selectedRows[rows].priceTp1,
          selectedRows[rows].priceTp2,
          selectedRows[rows].priceTp3,
          selectedRows[rows].priceTp4,
          selectedRows[rows].priceTp5
        ]
  
        let res = []
        for (let i = 0; i < 5; i++) {
          res[i] = await bunchOrders(exchangeId, asset, amounts[i], prices[i])
          resultText += `TP${i} : ${res[i]}<br>`
        }
  
        successSpinHtml('Save completed', resultText, true, true)
      } else {
        errorSpin('Error', `Cancel order : ${cancel.error}`, false, true)
      }
    }
    
  
    console.log(selectedRows[0])*/
}
</script>
