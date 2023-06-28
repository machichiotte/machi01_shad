<template>
    <button @click="iAmClicked">
        Add sell orders
    </button>
</template>
  
<script>
import { bunchOrders, cancelAllOrders } from '../js/orders.js';
import { loadingSpin, successSpinHtml, errorSpin } from '../js/spinner.js'

export default {
    props: {
        model: {
            type: Object,
            required: true,
        },
    },
    methods: {
        async iAmClicked() {
            loadingSpin();

            const selectedRows = this.model.selectedRows;

            for (let rows in selectedRows) {
                const asset = selectedRows[rows].asset;
                const exchangeId = selectedRows[rows].exchangeId;

                console.log(asset);
                console.log(exchangeId);


                const cancel = await cancelAllOrders(exchangeId, asset);

                let resultText = `Cancel : ${cancel.status}<br>`;

                if (cancel.status == 200) {

                    const amounts = [selectedRows[rows].amountTp1, selectedRows[rows].amountTp2, selectedRows[rows].amountTp3, selectedRows[rows].amountTp4, selectedRows[rows].amountTp5];
                    const prices = [selectedRows[rows].priceTp1, selectedRows[rows].priceTp2, selectedRows[rows].priceTp3, selectedRows[rows].priceTp4, selectedRows[rows].priceTp5];

                    let res = [];
                    for (let i = 0; i < 5; i++) {
                        res[i] = await bunchOrders(exchangeId, asset, amounts[i], prices[i]);
                        resultText += `TP${i} : ${res[i].status}<br>`;
                    }

                    successSpinHtml('Save completed', resultText, true, true);

                } else {
                    errorSpin('Error', `Cancel order : ${cancel.error}`, false, true);
                }
            }

        }
    }
};
</script>
  