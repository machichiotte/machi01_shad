<!-- src/components/OrdersTable.vue -->

<template>
  <data-table class="my-datatable"> </data-table>
  <DataTable :value="rows" :rows="itemsPerPage">
    <Column
      v-for="(col, index) in cols"
      :key="index"
      :field="col.field"
      :header="col.header"
    ></Column>
  </DataTable>
</template>
  
<script>
import { openOrdersTableColumns } from '../js/columns.js'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

export default {
  components: {
    DataTable,
    Column
  },
  props: {
    orders: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      itemsPerPage: 5,
      currentPage: 1,
      cols: openOrdersTableColumns
    }
  },
  computed: {
    rows() {
      return this.orders.map((item) => {
        return {
          platform: item['platform'],
          symbol: item['symbol'],
          side: item['side'],
          amount: parseFloat(item['amount']),
          price: item['price']
        }
      })
    }
  }
}
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
  