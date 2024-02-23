<!-- src/components/TradesTable.vue -->
<template>
  <!-- Using PrimeVue DataTable component to display trades data -->
  <DataTable :value="rows" :rows="itemsPerPage">
    <!-- Dynamically rendering columns using PrimeVue Column component -->
    <Column
      v-for="(col, index) in cols"
      :key="index"
      :field="col.field"
      :header="col.header"
    ></Column>
  </DataTable>
</template>

<script setup>
// Importing necessary modules from Vue
import { ref, defineProps, computed } from 'vue';

// Importing necessary columns from the columns.js file
import { tradesTableColumns } from '../js/columns.js';

// Props declaration
 props = defineProps({
  trades: {
    type: Array,
    required: true
  }
});

// Declaring reactive variables using ref
const itemsPerPage = ref(5);

// Computing rows based on trades prop
const rows = computed(() => {
  return props.trades.map((item) => {
    return {
      date: item['date'],
      pair: item['pair'],
      type: item['type'],
      price: parseFloat(item['price']),
      amount: item['amount'],
      total: item['total'],
      totalUSDT: item['totalUSDT'],
      fee: item['fee'] + ' ' + item['feecoin'],
      feecoin: item['feecoin'],
      platform: item['platform'],
      explatform: item['explatform']
    };
  });
});

// Setting up the columns
const cols = tradesTableColumns;
</script>