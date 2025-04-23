<!-- src/components/UpdateBarSelector.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import {
    fetchCmc,
    fetchBalance,
    fetchTrade,
    fetchTicker,
    fetchOrder,
    fetchStrategy,
    fetchMachi
} from '../../server/fetchFromServer'
import { Balance, Cmc, Asset, Order, Strat, Ticker, Trade } from '../../types/responseData';

interface FetchOption<T> {
    id: string;
    name: string;
    fetchFunction: () => Promise<T>;
}

// Créer une liste d'options de fetch avec des types explicites
const fetchOptions: Array<
    FetchOption<Cmc[]> |
    FetchOption<Balance[]> |
    FetchOption<Trade[]> |
    FetchOption<Ticker[]> |
    FetchOption<Order[]> |
    FetchOption<Strat[]> |
    FetchOption<Asset[]>
> = [
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

async function fetchMyData<T>(fetchFunction: () => Promise<T>, index: number): Promise<void> {
    errors.value[index] = false

    try {
        loading.value[index] = true
        const result: T = await fetchFunction()// Résultat du type T (ex: Balance[], Strat[], etc.)
        console.info(`${fetchOptions[index].name} fetched successfully`, result)
    } catch (error) {
        console.error(`Error fetching ${fetchOptions[index].name}:`, error)
        errors.value[index] = true
    } finally {
        loading.value[index] = false
    }
}
</script>

<template>
    <div class="fetch-from-server-selector">
        <Button v-for="(fetchOption, index) in fetchOptions" :key="fetchOption.id" :label="fetchOption.name"
            :loading="loading[index]" :class="['fetch-button', { error: errors[index] }]"
            @click="() => fetchMyData(fetchOption.fetchFunction as () => Promise<Cmc[] | Balance[] | Trade[] | Ticker[] | Order[] | Strat[] | Asset[]>, index)" />
    </div>
</template>

<style scoped>
.fetch-from-server-selector {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    overflow-x: auto;
}

.fetch-button {
    margin: 0 0.2rem;
    flex: 0 0 auto;
    position: relative;
    min-width: 150px;
}

.fetch-button.error {
    background-color: red;
    color: white;
}
</style>