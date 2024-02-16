<!-- src/components/Trades.vue -->
<template>
  <div class="page">
    <h1>Liste des trades</h1>
    <div id="table">
      
      <DataTable
        :value="rows"
        :rows="itemsPerPage"
        :paginator="true"
      >
        <Column
          v-for="(col, index) in cols"
          :key="index"
          :field="col.field"
          :header="col.header"
        ></Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import { tradesColumns } from "../js/columns.js";
import { getTrades } from '../js/getter.js';

import DataTable from "primevue/datatable";
import Column from "primevue/column";

export default {
  components: {
    DataTable,
    Column
  },
  name: "TradesPage",
  data() {
    return {
      items: [],
      itemsPerPage: 13,
      currentPage: 1,
      cols: tradesColumns,
    };
  },
  computed: {
    rows() {
      return this.items.map((item) => {
        return {
          'altA': item['altA'],
          'altB': item['altB'],
          'date': item['date'],
          'pair': item['pair'],
          'type': item['type'],
          'price': item['price'],
          'amount': item['amount'],
          'total': item['total'],
          'totalUSDT': item['totalUSDT'],
          'fee': item['fee'],
          'feecoin': item['feecoin'],
          'platform': item['platform'],
          'explatform': item['explatform']
        };
      })
    }
  },
  methods: {
    async getData() {
      this.items = await getTrades();
    },
    sortItemsByDate() {
      this.items.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Trie par ordre décroissant
      });
    }
  },
  mounted() {
    this.getData();
  }
};
</script>

<style scoped>
.page {
  overflow-x: auto;
}

#table {
  height: 700px;
  width: auto;
}

.sell-row {
  background-color: red;
  color: white;
}

.buy-row {
  background-color: green;
  color: white;
}
</style>