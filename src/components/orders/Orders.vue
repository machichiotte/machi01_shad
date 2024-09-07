<!-- src/components/orders/Orders.vue -->
<template>
  <div class="page">
    <h1>Liste des ordres en cours</h1>
    <div class="card">
      <!-- Search Section -->
      <SearchBar :filters="filters" />

      <!-- DataTable with Orders Data -->
      <OrdersTable :items="orders" :filters="filters" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCalculStore } from '../../store/calcul'; // Importer le store Pinia
import { FilterMatchMode } from 'primevue/api';
import OrdersTable from "./OrdersTable.vue";
import SearchBar from "../shad/SearchBar.vue";

// Utiliser le store Pinia
const calculStore = useCalculStore();

// Variables réactives
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// Accéder aux commandes à partir du store Pinia
const orders = computed(() => calculStore.getOrders);

// Fonction pour récupérer les données des ordres en utilisant le store Pinia
const getOrdersData = async () => {
  try {
    await calculStore.fetchOrders(); // Appeler l'action Pinia pour récupérer les données
    console.log("Données Orders récupérées:", orders.value.length);
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error);
    // Affichez un message d'erreur à l'utilisateur si nécessaire
  }
};

onMounted(async () => {
  await getOrdersData();
});
</script>

<style scoped>
.page {
  overflow-x: auto;
}

#table {
  height: 700px;
  width: auto;
}
</style>
