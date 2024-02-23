<!-- src/components/OrdersTable.vue -->

<template>
  <DataTable :value="rows" :rows="itemsPerPage">
    <Column
      v-for="(col, index) in cols"
      :key="index"
      :field="col.field"
      :header="col.header"
    ></Column>
  </DataTable>
</template>
  
<script setup>
import { ref, computed } from 'vue'; // Importing ref and computed from Vue

// Importing necessary columns from the columns.js file
import { openOrdersTableColumns } from '../js/columns.js';

// Declaring reactive variables using ref
const itemsPerPage = ref(5);
const currentPage = ref(1);

// Props declaration
 props = defineProps({
  orders: {
    type: Array,
    required: true
  }
});

// Computing rows based on orders prop
const rows = computed(() => {
  return props.orders.map((item) => {
    return {
      platform: item['platform'],
      symbol: item['symbol'],
      side: item['side'],
      amount: parseFloat(item['amount']),
      price: item['price']
    };
  });
});
</script>
  
<style scoped>
.my-table {
  width: 100%;
  border-collapse: collapse;
}

.my-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.my-table th {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  background-color: #f2f2f2;
}
</style>
  