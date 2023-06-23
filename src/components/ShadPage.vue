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
import VGrid from "@revolist/vue3-datagrid";

import { getBalanceFromDB, getTradesFromDB, getStratsFromDB, getActiveOrdersFromDB, getCmcDataFromDB } from '../../fromDB.js';
import { getAllCalculs } from '../../calcul.js';
import { columns } from "../../shadColumns.js";

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

      columns: columns,
      paginationConfig: {
        pageSize: 500,
        totalCount: 0,
        current: 1,
      },

    };
  },
  components: {
    VGrid
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