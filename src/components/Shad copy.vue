<!-- src/components/Shad.vue -->
<template>
  <div class="page">
    <h1>SHAD</h1>
    <div id="table">
      <vue-good-table
        :columns="cols"
        :rows="rows"
        :skip-diacritics="true"
        :select-options="{ enabled: true }"
        :search-options="{ enabled: true }"
        :pagination-options="{ enabled: true }"
        v-on:selected-rows-change="selectionChanged"
        v-on:cell-click="onCellClick"
      >
        <template #selected-row-actions>
          <MySellButtonVue :model="allRows" />
        </template>
        <template #fixed>
          <tr>
            <th v-for="(column, index) in fixedColumns" :key="index" :style="column.style">
              {{ column.label }}
            </th>
          </tr>
        </template>
        <template #body-row="props">
          <tr :class="props.row._rowVariant">
            <td v-for="(column, index) in props.columns" :key="index">
              {{ props.formattedRow[column.field] }}
            </td>
          </tr>
        </template>
      </vue-good-table>

      <DataTable :value="rows" :rows="itemsPerPage">
        <Column
          v-for="(col, index) in cols"
          :key="index"
          :field="col.field"
          :header="col.header"
        ></Column>
      </DataTable>
    </div>
    <Overlay
      v-if="showOverlay"
      :selectedAsset="selectedAsset"
      :buyOrders="this.buyOrders"
      :sellOrders="this.sellOrders"
      :trades="this.trades"
      :cmc="this.cmc"
      @close="closeOverlay"
    />
  </div>
</template>

<script>
import { getCmc, getBalances, getTrades, getOrders, getStrategy } from '../js/getter.js'
import { getAllCalculs } from '../js/calcul.js'
import { shadColumns } from '../js/columns.js'
import MySellButtonVue from './MySellButton.vue'
import Overlay from './ShadOverlay.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

export default {
  components: {
    DataTable,
    Column
  },
  name: 'ShadPage',
  data() {
    return {
      balances: [],
      trades: [],
      strats: [],
      orders: [],
      cmc: [],
      buyOrders: [],
      sellOrders: [],
      itemsPerPage: 13,
      currentPage: 1,
      cols: shadColumns,
      showOverlay: false,
      selectedAsset: {},
      allRows: []
    }
  },
  components: {
    MySellButtonVue,
    Overlay
  },
  computed: {
    fixedColumns() {
      return this.columns.slice(0, 2) // Les deux premières colonnes
    },
    displayedBalances() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      const endIndex = startIndex + this.itemsPerPage
      return this.sortedBalances.slice(startIndex, endIndex)
    },
    sortedBalances() {
      if (this.balances && this.balances.length > 0) {
        return this.balances.slice().sort((a, b) => {
          const assetA = a.symbol.toUpperCase()
          const assetB = b.symbol.toUpperCase()
          return assetA.localeCompare(assetB)
        })
      } else {
        return []
      }
    },
    rows() {
      if (this.strats && this.strats.length > 0) {
        return this.displayedBalances.map((item) => {
          return getAllCalculs(
            item,
            this.cmc,
            this.trades,
            this.strats,
            this.buyOrders,
            this.sellOrders
          )
        })
      } else {
        return []
      }
    }
  },
  methods: {
    applyRowClasses() {
      this.rows.forEach((row) => {
        const totalShad = row.totalShad
        row._rowVariant = this.getRowClass(totalShad)
      })
    },
    getRowClass(totalShad) {
      if (totalShad >= 2) {
        return 'blue-row'
      } else if (totalShad === 1) {
        return 'green-row'
      } else if (totalShad === 0) {
        return 'orange-row'
      } else if (totalShad === -1) {
        return 'red-row'
      } else {
        return ''
      }
    },
    closeOverlay() {
      if (this.showOverlay) this.showOverlay = false
    },
    selectionChanged(rows) {
      this.allRows = rows
    },
    onCellClick(params) {
      // Vérifiez si la colonne cliquée est la colonne "asset"
      if (params.column.field === 'asset') {
        // Affichez l'overlay
        this.showOverlay = true
        // Définissez la ligne sélectionnée
        this.selectedAsset = params.row
      }
    },
    async getData() {
      console.log('getData')

      try {
        this.balances = await getBalances()
        this.trades = await getTrades()
        this.strats = await getStrategy()
        this.cmc = await getCmc()
        this.orders = await getOrders()

        this.buyOrders = this.orders.filter((order) => order.side === 'buy')
        this.sellOrders = this.orders.filter((order) => order.side === 'sell')
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des données :", error)
        // Affichez un message d'erreur à l'utilisateur si nécessaire
      }
    },

    prevPage() {
      this.currentPage--
    },
    nextPage() {
      this.currentPage++
    },
    changePage(page) {
      this.currentPage = page
    }
  },
  async mounted() {
    try {
      await this.getData()
      this.applyRowClasses()
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error)
      // Affichez un message d'erreur à l'utilisateur si nécessaire
    }
  }
}
</script>

<style scoped>
:root {
  --blue-light: #e6f7ff;
  --green-light: #d9f2e6;
  --orange-light: #ffe0b3;
  --red-light: #f2dede;
}

.page {
  overflow-x: auto;
}

#table {
  height: 700px;
  width: auto;
}

.blue-row {
  background-color: var(--blue-light);
}

.green-row {
  background-color: var(--green-light);
}

.orange-row {
  background-color: var(--orange-light);
}

.red-row {
  background-color: var(--red-light);
}
</style>
