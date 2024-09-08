<!-- src/components/forms/AddBuyOrdersForm.vue -->
<template>
    <div>
        <!-- Sélecteur avec les actifs sélectionnés -->
        <Dropdown :options="assetOptions" optionLabel="asset" placeholder="Select Asset" v-model="selectedAsset"
            class="mb-3" />

        <!-- Lignes de commande d'achat -->
        <div v-for="(order, index) in buyOrders" :key="index" class="order-row">
            <InputNumber v-model="order.price" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="8"
                placeholder="Price" @input="updateCalculatedValues(index)" />
            <InputNumber v-model="order.quantity" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="8"
                placeholder="Quantity" @input="updateCalculatedValues(index)" />
            <span class="calculated-value">Calculated Total: {{ calculateTotal(index) }}</span>
            <InputNumber v-model="order.total" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="8"
                placeholder="Total" @input="updateCalculatedValues(index)" />
            <span class="calculated-value">Calculated Quantity: {{ calculateQuantity(index) }}</span>
            <Button icon="pi pi-times" class="p-button-danger" @click="removeOrder(index)" />
        </div>
        <!-- Bouton pour ajouter une ligne de commande -->
        <Button label="Add Line" @click="addOrder" :disabled="buyOrders.length >= 10" />
        <!-- Bouton pour soumettre les commandes -->
        <Button label="Submit" class="p-button-success" @click="submitOrders" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { successSpinHtml } from '../../js/spinner.js'
import { bunchLimitBuyOrders } from '../../js/orders.js'

const props = defineProps({
    assets: Object,
    visible: Boolean,
    selectedAssets: Object,
    onClose: Function
})

const selectedAsset = ref(null)

const buyOrders = ref([{ price: null, quantity: null, total: null }])

/**
 * @returns {void}
 */
const addOrder = () => {
    if (buyOrders.value.length < 10) {
        buyOrders.value.push({ price: null, quantity: null, total: null })
    }
}

/**
 * @param {number} index
 * @returns {void}
 */
const removeOrder = (index) => {
    buyOrders.value.splice(index, 1)
}

/**
 * @param {number} index
 * @returns {void}
 */
const updateCalculatedValues = (index) => {
    calculateTotal(index)
    calculateQuantity(index)
}

/**
 * @param {number} index
 * @returns {number|null}
 */
const calculateTotal = (index) => {
    const order = buyOrders.value[index]
    if (order.price != null && order.quantity != null) {
        return parseFloat((order.price * order.quantity).toFixed(8))
    }
    return null
}

/**
 * @param {number} index
 * @returns {number|null}
 */
const calculateQuantity = (index) => {
    const order = buyOrders.value[index]
    if (order.total != null && order.price != null) {
        return parseFloat((order.total / order.price).toFixed(8))
    }
    return null
}

/**
 * @returns {Promise<void>}
 */
const submitOrders = async () => {
    const orderPlacementResults = await Promise.all(buyOrders.value.map(async (order) => {
        try {
            const result = await bunchLimitBuyOrders(selectedAsset.value.platform, selectedAsset.value.asset, order.quantity, order.price);
            return result;
        } catch (error) {
            console.error('Error placing order:', error);
            return `Error placing order: ${error.message}`;
        }
    }));

    if (orderPlacementResults.length > 0) {
        const formattedResults = orderPlacementResults.map(result => {
            return `Status: ${result.status} - ${JSON.stringify(result.message)}`;
        });
        successSpinHtml('Save completed', formattedResults.join('<br>'), true, true);
    } else {
        successSpinHtml('NOTHING', 'No buy order', true, true);
    }

    props.onClose();
};

const assetOptions = computed(() => {
    const assets = props.selectedAssets.map(row => ({
        asset: row.asset,
        platform: row.platform
    }));

    const uniqueAssets = Array.from(new Set(assets.map(a => a.asset)))
        .map(asset => {
            return assets.find(a => a.asset === asset);
        });

    return uniqueAssets;
});

</script>

<style scoped>
.order-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    flex-direction: column;
    /* Add this to align elements vertically */
}

.calculated-value {
    font-size: 0.8rem;
    /* Smaller font size for calculated values */
    color: #888;
    /* Grey color for indication */
}
</style>
