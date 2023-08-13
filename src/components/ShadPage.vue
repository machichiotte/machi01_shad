<template>
  <div class="shad-page">
    <h1>SHAD</h1>

    <div id="table">
      <vue-good-table :columns="columns" :rows="rows" :skip-diacritics="true" :select-options="{ enabled: true }"
        :search-options="{ enabled: true }" :pagination-options="{ enabled: true }"
        v-on:selected-rows-change="selectionChanged" v-on:cell-click="onCellClick">
        <template #selected-row-actions>
          <MySellButtonVue :model="allRows" />
        </template>
<template #fixed>
      <tr>
        <th
          v-for="(column, index) in fixedColumns"
          :key="index"
          :style="column.style"
        >
          {{ column.label }}
        </th>
      </tr>
    </template>
      </vue-good-table>
    </div>

    <Overlay v-if="showOverlay" :selectedAsset="selectedAsset" :openBuyOrders="this.openBuyOrders"
      :openSellOrders="this.openSellOrders" :trades="this.trades" :cmc="this.cmcData" @close="closeOverlay" />

  </div>
</template>

<script>
import { getBalanceFromDB, getTradesFromDB, getStratsFromDB, getActiveOrdersFromDB, getCmcDataFromDB } from '../js/fromDB.js';
import { getAllCalculs } from '../js/calcul.js';
import { shadColumns } from "../js/shadColumns.js";
import MySellButtonVue from './MySellButton.vue';
import Overlay from './ShadOverlay.vue';

export default {
  name: "ShadPage",
  data() {
    return {
      balances: [],
      trades: [],
      strats: [],
      activeOrders: [],
      cmcData: [],
      openBuyOrders: [],
      openSellOrders: [],
      itemsPerPage: 1000,
      currentPage: 1,

      columns: shadColumns,
      showOverlay: false,
      selectedAsset: {},
      allRows: [],

    };
  },
  components: {
    MySellButtonVue, Overlay
  },
  computed: {
fixedColumns() {
      return this.columns.slice(0, 2); // Les deux premières colonnes
    },
    paginatedItems() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.sortedBalances.slice(startIndex, endIndex);
    },
    pageCount() {
      return Math.ceil(this.sortedBalances.length / this.itemsPerPage);
    },
    pages() {
      const pages = [];
      for (let i = 1; i <= this.pageCount; i++) {
        pages.push(i);
      }
      return pages;
    },
    sortedBalances() {
      return this.balances.slice().sort((a, b) => {
        const assetA = a.symbol.toUpperCase();
        const assetB = b.symbol.toUpperCase();
        return assetA.localeCompare(assetB);
      });
    },
    rows() {
      if (this.strats && this.strats.length > 0) {
        return this.paginatedItems.map((item) => {
          return getAllCalculs(item, this.cmcData, this.trades, this.strats, this.openBuyOrders, this.openSellOrders);
        });
      } else {
        return [];
      }
    },
  },
  methods: {
    closeOverlay() {
      this.showOverlay = false;
    },
    selectionChanged(rows) {
      this.allRows = rows;
    },
    onCellClick(params) {
      // Vérifiez si la colonne cliquée est la colonne "asset"
      if (params.column.field === 'asset') {
        // Affichez l'overlay
        this.showOverlay = true;
        // Définissez la ligne sélectionnée
        this.selectedAsset = params.row;
      }
    },
    async getDataFromDB() {
      this.balances = await getBalanceFromDB();
      this.trades = await getTradesFromDB();
      this.strats = await getStratsFromDB();
      this.cmcData = await getCmcDataFromDB();

      const { data, openBuyOrders, openSellOrders } = await getActiveOrdersFromDB();
      this.activeOrders = data;
      this.openBuyOrders = openBuyOrders;
      this.openSellOrders = openSellOrders;
    },

    prevPage() {
      this.currentPage--;
    },
    nextPage() {
      this.currentPage++;
    },
    changePage(page) {
      this.currentPage = page;
    },

  },
  mounted() {
    this.getDataFromDB();
  }
};
</script>

<style scoped>
.shad-page {
  overflow-x: auto;
}

#table {
  height: 700px;
  width: auto;
}
</style>