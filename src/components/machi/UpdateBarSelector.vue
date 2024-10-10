<!-- src/components/UpdateBarSelector.vue -->
<template>
    <div class="fetch-from-server-selector">
        <Button v-for="(fetchOption, index) in fetchOptions" :key="fetchOption.id" :label="fetchOption.name"
            :loading="loading[index]" :class="['fetch-button', { error: errors[index] }]"
            @click="fetchData(fetchOption.fetchFunction, index)" />
    </div>
</template>

<script setup lang="ts">
/**
 * @component UpdateBarSelector
 */

import { ref } from 'vue'
import {
    fetchCmc,
    fetchBalance,
    fetchTrade,
    fetchTicker,
    fetchOrder,
    fetchStrategy,
    fetchMachi
} from '../../js/server/fetchFromServer'

const fetchOptions = [
    { id: 'fetchCmc', name: 'Fetch CMC Data', fetchFunction: fetchCmc },
    { id: 'fetchBalances', name: 'Fetch Balances Data', fetchFunction: fetchBalance },
    { id: 'fetchTrades', name: 'Fetch Trades Data', fetchFunction: fetchTrade },
    { id: 'fetchTickers', name: 'Fetch Tickers Data', fetchFunction: fetchTicker },
    { id: 'fetchOrders', name: 'Fetch Orders Data', fetchFunction: fetchOrder },
    { id: 'fetchStrategy', name: 'Fetch Strategy Data', fetchFunction: fetchStrategy },
    { id: 'fetchMachi', name: 'Fetch Machi Data', fetchFunction: fetchMachi }
]

const loading = ref(Array(fetchOptions.length).fill(false))
const errors = ref(Array(fetchOptions.length).fill(false))

/**
 * @async
 * @param {Function} fetchFunction
 * @param {number} index
 * @returns {Promise<void>}
 */
async function fetchData(fetchFunction: () => Promise<void>, index: number): Promise<void> {
    errors.value[index] = false

    try {
        loading.value[index] = true
        await fetchFunction()
        console.log(`${fetchOptions[index].name} fetched successfully`)
    } catch (error) {
        console.error(`Error fetching ${fetchOptions[index].name}:`, error)
        errors.value[index] = true
    } finally {
        loading.value[index] = false
    }
}
</script>

<style scoped>
.fetch-from-server-selector {
    display: flex;
    align-items: center;
    margin: 1rem 0;
    flex-wrap: nowrap;
    overflow-x: auto;
}

.fetch-button {
    margin: 0 0.5rem;
    flex: 0 0 auto;
    position: relative;
    min-width: 150px;
}

.fetch-button.error {
    background-color: red;
    color: white;
}
</style>