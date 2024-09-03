<!-- src/components/orders/OrdersTable.vue -->
<template>
  <DataTable :value="filteredItems" :rows="itemsPerPage" columnResizeMode="fit" :paginator="true" scrollable
    :filters="filters">
    <Column v-for="(col, index) in cols" :key="index" :field="col.field" :header="col.header"></Column>
  </DataTable>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { openOrdersTableColumns } from '../../js/columns.js';

const itemsPerPage = ref(10);

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  filters: {
    type: Object,
    required: true
  }
});

const cols = openOrdersTableColumns

// Filtered items based on search
const filteredItems = ref([])

watchEffect(() => {
  if (Array.isArray(props.items)) {
    // Computing rows based on orders prop
    filteredItems.value = props.items.map((item) => {
      return {
        platform: item['platform'],
        symbol: item['symbol'],
        side: item['side'],
        amount: parseFloat(item['amount']),
        price: item['price']
      };
    })
  }
})


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