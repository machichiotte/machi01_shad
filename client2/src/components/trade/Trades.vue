<!-- src/components/trades/Trades.vue -->
<template>
  <div class="page">
    <div class="header">
      <h1>Trade List</h1>
      <SearchBar :filters="filters" />
    </div>
    <div class="card">
      <!-- Actions Section -->
      <TradesActions @showDialog="showDialog = true" />

      <!-- DataTable with Trade Data -->
      <TradesTable :items="trades" :filters="filters" />

      <!-- Form for Adding New Trades -->
      <!--  <TradesForm v-model:visible="showDialog" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useCalculStore } from '../../store/calculStore';
//import TradesForm from "../forms/TradesForm.vue";
import SearchBar from "../machi/SearchBar.vue";
import TradesActions from "./TradesActions.vue";
import TradesTable from "./TradesTable.vue";
import { Trade } from '../../types/responseData';

const showDialog = ref<boolean>(false);
const filters = ref<{ global: { value: string | null; matchMode: typeof FilterMatchMode[keyof typeof FilterMatchMode] } }>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const calculStore = useCalculStore();

const trades = computed<Trade[]>(() => calculStore.getTrade); // Où Trade[] est un tableau d'objets de type Trade

const getTradesData = async () => {
  try {
    await calculStore.loadTrade();
    console.log("Trade data retrieved:", trades.value.length);
  } catch (error) {
    console.error("An error occurred while retrieving data:", error);
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
