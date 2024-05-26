<template>
    <div>
        <!-- Sélecteur avec les actifs sélectionnés -->
        <Dropdown :options="assetOptions" placeholder="Select Asset" v-model="selectedAsset"
            class="mb-3" />

        <!-- Lignes de commande d'achat -->
        <div v-for="(order, index) in buyOrders" :key="index" class="order-row">
            <InputNumber v-model="order.price" placeholder="Price" @input="updateTotal(index)" />
            <InputNumber v-model="order.quantity" placeholder="Quantity" @input="updateTotal(index)" />
            <InputNumber v-model="order.total" placeholder="Total" @input="updateQuantityOrPrice(index)" />
            <Button icon="pi pi-times" class="p-button-danger" @click="removeOrder(index)" />
        </div>
        <!-- Bouton pour ajouter une ligne de commande -->
        <Button label="Add Line" @click="addOrder" :disabled="buyOrders.length >= 10" />
        <!-- Bouton pour soumettre les commandes -->
        <Button label="Submit" class="p-button-success" @click="submitOrders" />
    </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue' // Importer computed depuis la bibliothèque vue
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'

const props = defineProps({
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

const updateQuantityOrPrice = (index) => {
    const order = buyOrders.value[index]
    if (order.total != null) {
        if (order.price != null) {
            order.quantity = order.total / order.price
        } else if (order.quantity != null) {
            order.price = order.total / order.quantity
        }
    }
}

const submitOrders = () => {
    console.log('Submitting buy orders:', buyOrders.value)
    // Logic to handle order submission goes here
    props.onClose()
}

// Extraire les actifs uniques de selectedAssets
const assetOptions = computed(() => {
    console.log('je veux savoirA')
    console.log('je veux savoir ', props.selectedAssets)
    const assets = new Set()
    props.selectedAssets.forEach(row => {
    console.log('je veux savoirB')
        assets.add(row.asset)
    })
    console.log('assets', assets)
    console.log('assetsAAA', Array.from(assets))

    return Array.from(assets)
})

</script>

<style scoped>
.order-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
}
</style>
