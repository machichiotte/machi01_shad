<!-- src/components/trades/Trades.vue -->
<template>
  <div class="page">
    <h1>Liste des trades</h1>
    <div class="card">
      <!-- Search Section -->
      <TradesSearch :filters="filters" />

      <!-- Actions Section -->
      <TradesActions @showDialog="showDialog = true" />

      <!-- DataTable with Trade Data -->
      <TradesTable :rows="rows" :itemsPerPage="itemsPerPage" :filters="filters" />

      <!-- Form for Adding New Trades -->
      <TradesForm v-model:visible="showDialog" />
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import { useStore } from 'vuex'
import { FilterMatchMode } from 'primevue/api'

import { tradesColumns } from '../../js/columns.js'
import TradesForm from "../forms/TradesForm.vue"
import TradesSearch from "./TradesSearch.vue"
import TradesActions from "./TradesActions.vue"
import TradesTable from "./TradesTable.vue"
import { FETCH_BALANCES, FETCH_TRADES, GET_BALANCES, GET_TRADES } from '../../store/storeconstants'

const store = useStore()

const showDialog = ref(false)
const items = ref([])
const itemsPerPage = 13
const cols = tradesColumns
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const rows = ref([])

const fetchData = async (fetchAction, getter, type) => {
  try {
    await store.dispatch('calcul/' + fetchAction)
  } catch (error) {
    console.error(`Une erreur s'est produite lors de la récupération des données de ${type} :`, error)
  }
  return store.getters['calcul/' + getter]
}

const getTradesData = async () => {
  items.value = await fetchData(FETCH_TRADES, GET_TRADES, 'trades')
}

const getBalancesData = async () => {
  items.value = await fetchData(FETCH_BALANCES, GET_BALANCES, 'balances')
}

onMounted(async () => {
  await getBalancesData()
  await getTradesData()
})

watchEffect(() => {
  if (Array.isArray(items.value)) {
    rows.value = items.value.map((item) => {
      let date
      if (typeof item['date'] === 'string') {
        date = item['date']
      } else {
        const timestamp = parseFloat(item['timestamp'])
        const formattedDate = new Date(timestamp)

        const year = formattedDate.getFullYear()
        const month = String(formattedDate.getMonth() + 1).padStart(2, '0')
        const day = String(formattedDate.getDate()).padStart(2, '0')
        const hours = String(formattedDate.getHours()).padStart(2, '0')
        const minutes = String(formattedDate.getMinutes()).padStart(2, '0')
        const seconds = String(formattedDate.getSeconds()).padStart(2, '0')

        date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }

      return {
        base: item['base'],
        quote: item['quote'],
        date: date,
        pair: item['pair'],
        type: item['type'],
        price: item['price'],
        amount: item['amount'],
        total: item['total'],
        totalUSDT: item['totalUSDT'],
        fee: item['fee'],
        feecoin: item['feecoin'],
        platform: item['platform']
      }
    })
  }
})
</script>

<style scoped>
.page {
  overflow-x: auto;
}

.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}
</style>
