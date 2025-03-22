<!-- src/components/order/Orders.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCalculStore } from '../../store/calculStore';
import { FilterMatchMode } from 'primevue/api';
import SearchBar from "../machi/SearchBar.vue";
import OrdersTable from "./OrdersTable.vue";

const calculStore = useCalculStore();

const itemsPerPage = ref(20)
const filters = ref<{ global: { value: string; matchMode: typeof FilterMatchMode[keyof typeof FilterMatchMode] } }>({
  global: { value: '', matchMode: FilterMatchMode.CONTAINS }
});
// Access orders from Pinia store
const orders = computed(() => calculStore.getOrder);

// Function to fetch order data using Pinia store
const getOrdersData = async (): Promise<void> => {
  try {
    await calculStore.loadOrder(); // Call Pinia action to fetch data
    console.info("Orders data retrieved:", orders.value.length);
  } catch (error) {
    console.error("An error occurred while fetching data:", error);
    // Display an error message to the user if necessary
  }
};

onMounted(async () => {
  await getOrdersData();
});
</script>

<template>
  <div class="page">
    <h1>Current Orders List</h1>
    <div class="card">
      <SearchBar :filters="filters" />
      <OrdersTable :rows="orders" :globalFilter="filters.global.value || ''" :itemsPerPage="itemsPerPage" />
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

#table {
  height: 700px;
  width: auto;
}
</style>