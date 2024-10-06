<!-- src/components/orders/Orders.vue -->
<template>
  <div class="page">
    <h1>Current Orders List</h1>
    <div class="card">
      <!-- Search Section -->
      <SearchBar :filters="filters" />

      <!-- DataTable with Orders Data -->
      <OrdersTable :items="orders" :filters="filters" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCalculStore } from '@store/calculStore'; // Import Pinia store
import { FilterMatchMode } from 'primevue/api';
import OrdersTable from "@components/OrdersTable.vue";
import SearchBar from "@components/shad/SearchBar.vue";

// Define types for orders
interface Order {
  id: number;
  // Ajoutez d'autres propriétés selon votre modèle de données
}

// Use Pinia store
const calculStore = useCalculStore();

// Reactive variables
const filters = ref<{
  global: { value: string | null; matchMode: FilterMatchMode };
}>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// Access orders from Pinia store
const orders = computed<Order[]>(() => calculStore.getOrders);

// Function to fetch order data using Pinia store
const getOrdersData = async (): Promise<void> => {
  try {
    await calculStore.loadOrders(); // Call Pinia action to fetch data
    console.log("Orders data retrieved:", orders.value.length);
  } catch (error) {
    console.error("An error occurred while fetching data:", error);
    // Display an error message to the user if necessary
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