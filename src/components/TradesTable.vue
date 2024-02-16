<!-- src/components/TradesTable.vue -->
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
  
<script>
import { tradesTableColumns } from '../js/columns.js'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

export default {
  components: {
    DataTable,
    Column
  },
  props: {
    trades: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      itemsPerPage: 5,
      currentPage: 1,
      cols: tradesTableColumns
    }
  },
  computed: {
    rows() {
      return this.trades.map((item) => {
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
        }
      })
    }
  }
}
</script>