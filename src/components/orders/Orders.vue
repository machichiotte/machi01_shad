<!-- src/components/orders/Orders.vue -->
<template>
  <div class="page">
    <h1>Liste des ordres en cours</h1>
    <div class="card">
      <!-- Search Section -->
      <SearchBar :filters="filters" />

      <!-- DataTable with Orders Data -->
      <OrdersTable :items="items" :filters="filters" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchOrders } from '../../js/fetchFromServer.js'
import { FilterMatchMode } from 'primevue/api'
import OrdersTable from "./OrdersTable.vue"
import SearchBar from "../shad/SearchBar.vue"

// Variables réactives
const items = ref([])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const getOrdersData = async () => {
  items.value = await fetchOrders()
}

onMounted(async () => {
  try {
    await getOrdersData()
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

#table {
  height: 700px;
  width: auto;
}
</style>