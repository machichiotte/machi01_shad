<template>
    <div>
        <!-- Sélecteur avec les actifs sélectionnés -->
        <Dropdown :options="assetOptions" optionLabel="asset" placeholder="Select Asset" v-model="selectedAsset"
            class="mb-3" />

        <!-- Lignes de commande d'achat -->
        <div v-for="(order, index) in buyOrders" :key="index" class="order-row">
            <InputNumber v-model="order.price" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="8" placeholder="Price" @input="updateValues('price', index)" />
            <InputNumber v-model="order.quantity" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="8" placeholder="Quantity"
            @input="updateValues('quantity', index)" />
            <InputNumber v-model="order.total" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="8" placeholder="Total"
            @input="updateValues('total', index)" />
            <Button icon="pi pi-times" class="p-button-danger" @click="removeOrder(index)" />
        </div>
        <!-- Bouton pour ajouter une ligne de commande -->
        <Button label="Add Line" @click="addOrder" :disabled="buyOrders.length >= 10" />
        <!-- Bouton pour soumettre les commandes -->
        <Button label="Submit" class="p-button-success" @click="submitOrders" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue' // Importer computed depuis la bibliothèque vue
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

const selectedAsset = ref(null) // Déclarer la propriété selectedAsset

const buyOrders = ref([{ price: null, quantity: null, total: null }])

const addOrder = () => {
    if (buyOrders.value.length < 10) {
        buyOrders.value.push({ price: null, quantity: null, total: null })
    }
}

const removeOrder = (index) => {
    buyOrders.value.splice(index, 1)
}

const updateTotal = (index) => {
    const order = buyOrders.value[index]
    if (order.price != null && order.quantity != null) {
        order.total = order.price * order.quantity
    }
}

const updateValues = (changedField, index) => {
    const order = buyOrders.value[index]

    if (changedField === 'price') {
        if (order.price != null) {
            if (order.quantity != null) {
                order.total = parseFloat((order.price * order.quantity).toFixed(8))
            } else if (order.total != null) {
                order.quantity = parseFloat((order.total / order.price).toFixed(8))
            }
        }
    } else if (changedField === 'quantity') {
        if (order.quantity != null) {
            if (order.price != null) {
                order.total = parseFloat((order.price * order.quantity).toFixed(8))
            } else if (order.total != null) {
                order.price = parseFloat((order.total / order.quantity).toFixed(8))
            }
        }
    } else if (changedField === 'total') {
        if (order.total != null) {
            if (order.price != null) {
                order.quantity = parseFloat((order.total / order.price).toFixed(8))
            } else if (order.quantity != null) {
                order.price = parseFloat((order.total / order.quantity).toFixed(8))
            }
        }
    }
}

const submitOrders = async () => {
    // Itérer sur chaque commande dans buyOrders
    const orderPlacementResults = await Promise.all(buyOrders.value.map(async (order) => {
        try {
            // Appeler bunchLimitSellOrders avec les paramètres appropriés
            const result = await bunchLimitBuyOrders(selectedAsset.value.exchangeId, selectedAsset.value.asset, order.quantity, order.price);
            return result; // Retourner le résultat en cas de succès
        } catch (error) {
            console.error('Error placing order:', error);
            return `Error placing order: ${error.message}`; // Retourner le message d'erreur
        }
    }));

    // Afficher les résultats ou les messages d'erreur
    if (orderPlacementResults.length > 0) {
        successSpinHtml('Save completed', orderPlacementResults.join('<br>'), true, true);
    } else {
        successSpinHtml('NOTHING', 'No buy order', true, true);
    }

    // Fermer le formulaire
    props.onClose();
};


// Extraire les actifs uniques de selectedAssets
const assetOptions = computed(() => {
    const assets = props.selectedAssets.map(row => ({
        asset: row.asset,
        exchangeId: row.exchangeId
    }));

    const uniqueAssets = Array.from(new Set(assets.map(a => a.value)))
        .map(value => {
            return assets.find(a => a.value === value);
        });

    console.log('assets', uniqueAssets);
    return uniqueAssets;
});


</script>

<style scoped>
.order-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
}
</style>
../../js/spinner.js../../js/orders.js