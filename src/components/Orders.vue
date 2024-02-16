<!-- src/components/Orders.vue -->
<template>
  <div class="page">
    <h1>Ordres en cours</h1>
    <div id="table">
      <DataTable
        :value="rows"
        :rows="itemsPerPage"
        :paginator="true"
        :currentPage="currentPage"
        :paginatorPosition="bottom"
      >
        <Column
          v-for="(col, index) in cols"
          :key="index"
          :field="col.field"
          :header="col.header"
        ></Column>
        <template #selected-row-actions>
          <MySellButtonVue :model="allRows" />
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script>
import { ordersColumns } from '../js/columns.js'
import { getOrders } from '../js/getter.js'

import MySellButtonVue from './MySellButton.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

//TODO myDeleteButton instead of MySellButton

export default {
  components: {
    MySellButtonVue,
    DataTable,
    Column,
    Button
  },
  name: 'OrdersPage',
  data() {
    return {
      items: [],
      itemsPerPage: 13,
      currentPage: 1,
      cols: ordersColumns,
      showOverlay: false,

      allRows: null,
      selectedAsset: null
    }
  },
  computed: {
    rows() {
      return this.items.map((item) => {
        return {
          oId: item['oId'],
          platform: item['platform'],
          symbol: item['symbol'],
          type: item['type'],
          side: item['side'],
          amount: item['amount'],
          price: item['price']
        }
      })
    }
  },
  methods: {
    async getData() {
      this.items = await getOrders()
    },
    selectionChanged(rows) {
      this.allRows = rows
    },
    showAssetDetails(params) {
      // Vérifiez si la colonne cliquée est la colonne "asset"
      if (params.column.field === 'asset') {
        // Affichez l'overlay
        this.showOverlay = true
        // Définissez la ligne sélectionnée
        this.selectedAsset = params.row
      }
    },
    closeOverlay() {
      this.showOverlay = false
    }
  },
  mounted() {
    this.getData()
  }
}
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