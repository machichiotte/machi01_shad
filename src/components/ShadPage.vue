<template>
  <div class="shad-page">
    <h1>SHAD</h1>

    <div id="table">
      <v-grid theme="compact" :source="rows" :columns="columns" :filter="false" :pagination="paginationConfig">
        <template v-slot:item="{ item }">
          <tr :key="item.asset">
            <!-- Render columns using the key attribute -->
            <td v-for="column in columns" :key="column.name" @mousedown.prevent>
              <!-- Render individual cells using the key attribute -->
              <component :is="getComponentType(column)" :column="column" :model="item"
                @click="handleCellClick(column, item)" />
            </td>
          </tr>
        </template>
      </v-grid>
    </div>

    <div class="pagination">
      <button v-if="currentPage > 1" @click="prevPage">Prev</button>
      <button v-for="page in pages" :key="page" @click="changePage(page)" :class="{ active: currentPage === page }">{{
        page }}</button>
      <button v-if="currentPage < pageCount" @click="nextPage">Next</button>
    </div>
  </div>
</template>

<script>
import VGrid, { VGridVueTemplate } from "@revolist/vue3-datagrid";

import { getBalanceFromDB, getTradesFromDB, getStratsFromDB, getActiveOrdersFromDB, getCmcDataFromDB } from '../../fromDB.js';
import { getAllCalculs } from '../../calcul.js';
import { createColoredCell, createPlatformColoredCell } from '../../cells.js'
import MySellButton from "./MySellButton.vue";

export default {
  name: "ShadPage",
  data() {
    return {
      balances: [],
      trades: [],
      strats: [],
      activeOrders: [],
      cmcData: [],
      openBuyOrders: {},
      openSellOrders: {},
      itemsPerPage: 100,
      currentPage: 1,

      columns: [
        { name: "Asset", prop: "asset", pin: 'colPinStart', autoSize: true, sortable: true, order: "asc", },
        { name: "Actions", cellTemplate: VGridVueTemplate(MySellButton), autoSize: true, canFocus: false },

        { name: "Ratio", prop: "ratioShad", autoSize: true, sortable: true, order: "desc", },
        { name: "Total shad", prop: "totalShad", sortable: true, order: "desc", type: 'number' },
        { name: "Rank", prop: "rank", sortable: true, order: "desc", type: 'number' },
        { name: "Average Entry Price", prop: "averageEntryPrice", sortable: true, order: "desc", type: 'number' },
        { name: "Total buy", prop: "totalBuy", sortable: true, order: "desc", type: 'number' },
        { name: "Max wanted", prop: "maxWanted", sortable: true, order: "desc", type: 'number' },
        { name: "Percentage Difference", prop: "percentageDifference", sortable: true, order: "desc", cellTemplate: createColoredCell },
        { name: "Current Price", prop: "currentPrice", sortable: true, order: "desc", type: 'number' },

        { name: "Wallet", prop: "currentPossession", sortable: true, order: "desc", type: 'number' },
        { name: "Profit", prop: "profit", sortable: true, order: "desc", type: 'number' },

        { name: "Total sell", prop: "totalSell", sortable: true, order: "desc", type: 'number' },
        { name: "Recup shad", prop: "recupShad", sortable: true, order: "desc", type: 'number' },
        {
          name: 'Open Orders',
          children: [
            { name: "Buy", prop: "openBuyOrders", sortable: true, order: "desc", type: 'number' },
            { name: "Sell", prop: "openSellOrders", sortable: true, order: "desc", type: 'number' },
          ]
        },
        { name: "Quantite total achetee", prop: "totalAmount", sortable: true, order: "desc", type: 'number' },
        { name: "Balance", prop: "balance", sortable: true, order: "desc", type: 'number' },
        {
          name: 'Recup',
          children: [
            { name: "tp1", prop: "recupTp1", sortable: true, order: "desc", type: 'number' },
            { name: "tpX", prop: "recupTpX", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP1',
          children: [
            { name: "amount", prop: "amountTp1", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp1", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP2',
          children: [
            { name: "amount", prop: "amountTp2", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp2", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP3',
          children: [
            { name: "amount", prop: "amountTp3", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp3", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP4',
          children: [
            { name: "amount", prop: "amountTp4", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp4", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP5',
          children: [
            { name: "amount", prop: "amountTp5", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp5", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'Percent Change',
          children: [
            { name: "24h", prop: "cryptoPercentChange24h", sortable: true, order: "desc", cellTemplate: createColoredCell },
            { name: "7d", prop: "cryptoPercentChange7d", sortable: true, order: "desc", cellTemplate: createColoredCell },
            { name: "30d", prop: "cryptoPercentChange30d", sortable: true, order: "desc", cellTemplate: createColoredCell },
            { name: "60d", prop: "cryptoPercentChange60d", sortable: true, order: "desc", cellTemplate: createColoredCell },
            { name: "90d", prop: "cryptoPercentChange90d", sortable: true, order: "desc", cellTemplate: createColoredCell },
          ]
        },
        { name: "Exchange", prop: "exchangeId", pin: 'colPinEnd', sortable: true, order: "desc", cellTemplate: createPlatformColoredCell }
      ],
      paginationConfig: {
        pageSize: 500,
        totalCount: 0,
        current: 1,
      },

    };
  },
  components: {
    VGrid, MySellButton
  },
  computed: {
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
    }
  },
  methods: {
    handleCellClick(column, item) {
      console.log(column);
      console.log(item);
      if (column.name === this.columns[0].name) {
        // Logique à exécuter lorsque la première colonne est cliquée
        // Vous pouvez remplacer cette logique par ce que vous souhaitez faire avec le clic sur l'élément
        console.log("Clic sur l'élément :", item[column.name]);
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
    afficherContenu(contenuLigne) {
      alert(contenuLigne);
      // Vous pouvez également effectuer d'autres actions avec le contenu de la ligne
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
  height: 500px;
  width: auto;
}

revo-grid {
  height: 100%;
}
</style>