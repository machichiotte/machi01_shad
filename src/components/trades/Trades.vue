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
      <TradesTable :items="items" :filters="filters" />

      <!-- Form for Adding New Trades -->
      <TradesForm v-model:visible="showDialog" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { FilterMatchMode } from 'primevue/api'

import TradesForm from "../forms/TradesForm.vue"
import TradesSearch from "./TradesSearch.vue"
import TradesActions from "./TradesActions.vue"
import TradesTable from "./TradesTable.vue"
import { FETCH_TRADES, GET_TRADES } from '../../store/storeconstants'

const store = useStore()

const showDialog = ref(false)
const items = ref([]) // Raw items data
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

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

onMounted(async () => {
  await getTradesData()
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
