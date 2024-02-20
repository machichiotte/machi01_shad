<!-- src/components/MySellButton.vue -->
<template>
  <Button @click="iAmClicked"> </Button>
</template>
  
<script setup>
import { ref } from 'vue'
import { bunchOrders, cancelAllOrders } from '../js/orders.js'
import { loadingSpin, successSpinHtml, errorSpin } from '../js/spinner.js'

const model = ref(null)

const iAmClicked = async () => {
  loadingSpin()

  const selectedRows = model.value.selectedRows

  for (let rows in selectedRows) {
    const asset = selectedRows[rows].asset
    const exchangeId = selectedRows[rows].exchangeId

    let resultText = `${asset}<br>`

    let isNeedCancel = false
    let cancel

    //TODO check pour ne suppr que les sell orders
    if (selectedRows[rows].openSellOrders > 0) {
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
        resultText += `TP${i} : ${res[i].status}<br>`
      }

      successSpinHtml('Save completed', resultText, true, true)
    } else {
      errorSpin('Error', `Cancel order : ${cancel.error}`, false, true)
    }
  }
}
</script>
