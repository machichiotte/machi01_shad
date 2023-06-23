<template>
    <button @click="iAmClicked">
        Add sell orders
    </button>
</template>
  
<script>
import { bunchOrders, cancelAllOrders } from '../../orders.js';
import { loadingSpin, successSpinHtml, errorSpin } from '../../spinner.js'

export default {
    props: ["rowIndex", "model"],
    methods: {
        async iAmClicked() {
            loadingSpin();

            const asset = this.model.asset;
            const exchangeId = this.model.exchangeId;

            const cancel = await cancelAllOrders(exchangeId, asset);

            console.log('canc :: ' + cancel.status);
            let resultText = `Cancel : ${cancel.status}<br>`;

            if (cancel.status == 200) {
                console.log('canc IS 200');

                const amounts = [this.model.amountTp1, this.model.amountTp2, this.model.amountTp3, this.model.amountTp4, this.model.amountTp5];
                const prices = [this.model.priceTp1, this.model.priceTp2, this.model.priceTp3, this.model.priceTp4, this.model.priceTp5];

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
};
</script>
  