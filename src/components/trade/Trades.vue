<!-- src/components/trades/Trades.vue -->
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

<template>
  <div class="page">
    <div class="header">
      <h1>Trade List</h1>
      <SearchBar :filters="filters" />
    </div>

    <div class="card">
      <TradesActions @showDialog="showDialog = true" />
      <TradesTable :items="trades" :filters="filters" />

      <!-- Form for Adding New Trades -->
      <!--  <TradesForm v-model:visible="showDialog" /> -->
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* Prend toute la hauteur de l'écran */
}

nav {
  display: flex;
  justify-content: center;
  /* Centre les éléments de navigation */
  padding: 10px;
}

nav a {
  padding: 0px;
  padding-right: 20px;
  padding-left: 20px;
  text-align: center;
  text-decoration: none;
}

nav a.selected-link {
  font-weight: bold;
  border-bottom: 2px solid black;
  /* Pour indiquer le lien actif */
}

main {
  flex-grow: 1;
  /* Permet au RouterView de prendre tout l'espace restant */
  width: 100vw;
  /* Assure que main prend toute la largeur de la fenêtre */
  overflow-y: auto;
  /* Ajoute un défilement si le contenu dépasse en hauteur */
  display: flex;
  justify-content: center;
  /* Centre le contenu dans le main horizontalement */
  align-items: center;
  /* Centre le contenu verticalement */
}

main>* {
  width: 90%;
  /* S'assure que les enfants prennent toute la largeur du main */
  margin: 0;
  /* Annule les marges des éléments internes */
}
</style>