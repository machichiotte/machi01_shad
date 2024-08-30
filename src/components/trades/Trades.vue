<!-- src/components/trades/Trades.vue -->
<template>
  <div class="page">
    <h1>Liste des trades</h1>
    <div class="card">
      <!-- Search Section -->
      <SearchBar :filters="filters" />

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
import { FilterMatchMode } from 'primevue/api'
import { fetchTrades } from '../../js/fetchFromServer.js'
import TradesForm from "../forms/TradesForm.vue"
import SearchBar from "../shad/SearchBar.vue"
import TradesActions from "./TradesActions.vue"
import TradesTable from "./TradesTable.vue"

const showDialog = ref(false)
const items = ref([]) // Raw items data
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const getTradesData = async () => {
  items.value = await fetchTrades()
}

onMounted(async () => {
  try {
    await getTradesData()
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error)
    // Affichez un message d'erreur à l'utilisateur si nécessaire
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
