<!-- src/components/trades/Trades.vue -->
<template>
  <div class="page">
    <div class="header">
      <h1>Liste des trades</h1>
      <SearchBar :filters="filters" />
    </div>
    <div class="card">
      <!-- Actions Section -->
      <TradesActions @showDialog="showDialog = true" />

      <!-- DataTable with Trade Data -->
      <TradesTable :items="trades" :filters="filters" />

      <!-- Form for Adding New Trades -->
      <TradesForm v-model:visible="showDialog" />
    </div>
  </div>
</template>

<script setup>
/**
 * @component Trades
 */

import { ref, computed, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useCalculStore } from '../../store/calcul';
import TradesForm from "../forms/TradesForm.vue";
import SearchBar from "../shad/SearchBar.vue";
import TradesActions from "./TradesActions.vue";
import TradesTable from "./TradesTable.vue";

const showDialog = ref(false);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const calculStore = useCalculStore();

const trades = computed(() => calculStore.getTrades);

const getTradesData = async () => {
  try {
    await calculStore.fetchTrades();
    console.log("Données Trades récupérées:", trades.value.length);
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error);
  }
};

onMounted(async () => {
  await getTradesData();
});
</script>

<style scoped>
.page {
  overflow-x: auto;
  padding: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card {
  background: var(--surface-card);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
</style>
