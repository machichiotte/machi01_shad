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
import { ref, computed, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useCalculStore } from '../../store/calcul'; // Importer le store Pinia
import TradesForm from "../forms/TradesForm.vue";
import SearchBar from "../shad/SearchBar.vue";
import TradesActions from "./TradesActions.vue";
import TradesTable from "./TradesTable.vue";

const showDialog = ref(false);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Utiliser le store Pinia
const calculStore = useCalculStore();

// Utiliser un computed pour obtenir les trades depuis le store Pinia
const trades = computed(() => calculStore.getTrades);

// Fonction pour récupérer les données des trades via le store Pinia
const getTradesData = async () => {
  try {
    await calculStore.fetchTrades(); // Appeler l'action Pinia pour récupérer les données
    console.log("Données Trades récupérées:", trades.value.length);
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error);
    // Affichez un message d'erreur à l'utilisateur si nécessaire
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
