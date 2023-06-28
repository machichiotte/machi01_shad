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
      </vue-good-table>
    </div>

    <div class="overlay" v-if="showOverlay">
      <div class="overlay-content">
        <h2>{{ selectedAsset.asset }}</h2>

        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/11568.png" alt="Icon" width="32" height="32" />

        <p>ID: {{ selectedAsset.id }}</p>


        <p>Ratio: {{ selectedAsset.ratioShad }}</p>
        <p>Total shad: {{ selectedAsset.totalShad }}</p>
        <p>Rank: {{ selectedAsset.rank }}</p>
        <p>Average Entry Price: {{ selectedAsset.averageEntryPrice }}</p>
        <p>Total buy: {{ selectedAsset.totalBuy }}</p>
        <p>Max wanted: {{ selectedAsset.maxWanted }}</p>
        <p>Percentage Difference: {{ selectedAsset.percentageDifference }}</p>
        <p>Current Price: {{ selectedAsset.currentPrice }}</p>
        <p>Wallet: {{ selectedAsset.currentPossession }}</p>
        <p>Profit: {{ selectedAsset.profit }}</p>
        <p>Total sell: {{ selectedAsset.totalSell }}</p>
        <p>Recup shad: {{ selectedAsset.recupShad }}</p>
        <p>Buy: {{ selectedAsset.openBuyOrders }}</p>
        <p>Sell: {{ selectedAsset.openSellOrders }}</p>
        <p>Quantite total achetee: {{ selectedAsset.totalAmount }}</p>
        <p>Balance: {{ selectedAsset.balance }}</p>

        <button @click="toggleHistoricLines">
          {{ showHistoricLines ? 'Hide Historique' : 'Show Historique' }}
        </button>

        <div v-if="showHistoricLines">
          <p v-for="trade in this.getTrades(selectedAsset.asset)" :key="trade.id">{{ JSON.stringify(trade) }}</p>
        </div>

        <button @click="toggleActiveOrdersLines">
          {{ showActiveOrdersLines ? 'Hide Open Orders' : 'Show Open Orders' }}
        </button>

        <div v-if="showActiveOrdersLines">
          <p v-for="buyOrder in this.openBuyOrders[selectedAsset.asset]" :key="buyOrder.id">aaaa</p>
          <p v-for="sellOrder in this.openSellOrders[selectedAsset.asset]" :key="sellOrder.id">
            {{ JSON.stringify(sellOrder) }}</p>
        </div>


        <button @click="togglePercentageLines">
          {{ showPercentageLines ? 'Hide Percentage' : 'Show Percentage' }}
        </button>

        <div v-if="showPercentageLines">
          <p>24h: {{ formatPercentage(selectedAsset.cryptoPercentChange24h) }}</p>
          <p>7d: {{ formatPercentage(selectedAsset.cryptoPercentChange7d) }}</p>
          <p>30d: {{ formatPercentage(selectedAsset.cryptoPercentChange30d) }}</p>
          <p>60d: {{ formatPercentage(selectedAsset.cryptoPercentChange60d) }}</p>
          <p>90d: {{ formatPercentage(selectedAsset.cryptoPercentChange90d) }}</p>
        </div>

        <button @click="showOverlay = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getBalanceFromDB, getTradesFromDB, getStratsFromDB, getActiveOrdersFromDB, getCmcDataFromDB } from '../js/fromDB.js';
import { getAllCalculs, getTradesHistory } from '../js/calcul.js';
import { columns } from "../js/shadColumns.js";
import MySellButtonVue from './MySellButton.vue';

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

      columns: columns,
      paginationConfig: {
        pageSize: 500,
        totalCount: 0,
        current: 1,
      },
      showOverlay: false,
      selectedAsset: {},
      allRows: [],

      showPercentageLines: false,
      showHistoricLines: false,
      showActiveOrdersLines: false,

    };
  },
  components: {
    MySellButtonVue
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
    },
  },
  methods: {
    formatPercentage(value) {
      return (value * 100).toFixed(2) + '%';
    },
    togglePercentageLines() {
      this.showPercentageLines = !this.showPercentageLines;
    },
    toggleHistoricLines() {
      this.showHistoricLines = !this.showHistoricLines;
    },
    toggleActiveOrdersLines() {
      this.showActiveOrdersLines = !this.showActiveOrdersLines;
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
    getIconUrl(asset) {
      return `<img src="${this.getAssetId(asset, this.cmc_data)}" alt="Icon" width="32" height="32"></p>`
    },
    getTrades(asset) {
      return getTradesHistory(asset, this.trades);
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

revo-grid {
  height: 100%;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  /* Add this line to enable scrolling */

}

.overlay-content {
  background-color: white;
  padding: 20px;
  width: 70%;
  height: 70%;
  overflow-y: auto;
  /* Add this line to enable vertical scrolling */
}

.overlay h2 {
  margin-top: 0;
}

#table td {
  user-select: none;
}
</style>