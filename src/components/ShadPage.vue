<template>
  <div class="shad-page">
    <h1>SHAD</h1>

    <div class="search-bar">
      <input type="text" v-model="searchTerm" @input="performSearch" placeholder="Search..." />
    </div>

    <div id="table">
      <v-grid theme="compact" :source="filteredRows" :columns="columns" :filter="false" :pagination="paginationConfig">
        <template v-slot:item="{ item }">
          <tr :key="item.asset">
            <!-- Render columns using the key attribute -->
            <td v-for="column in columns" :key="column.name" @mousedown.prevent>
              <!-- Render individual cells using the key attribute -->
              <component :is="getComponentType(column)" :column="column" :model="item"
                @click="handleCellClick(column, item)" :tabindex="column.name === columns[0].name ? -1 : null" />
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

import { getBalanceFromDB, getTradesFromDB, getStratsFromDB, getActiveOrdersFromDB, getCmcDataFromDB } from '../js/fromDB.js';
import { getAllCalculs } from '../js/calcul.js';
import { columns } from "../js/shadColumns.js";

export default {
  name: "ShadPage",
  data() {
    return {
      searchTerm: '', // Terme de recherche saisi par l'utilisateur

      balances: [],
      trades: [],
      strats: [],
      activeOrders: [],
      cmcData: [],
      openBuyOrders: {},
      openSellOrders: {},
      itemsPerPage: 1000,
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
    },
    filteredRows() {
      if (this.searchTerm) {
        // Filter the rows based on the search term
        return this.rows.filter((row) => {
          // Check if any of the column values contain the search term
          return this.columns.some((column, index) => {
            // Check if the column is the second column
            if (index === 1) {
              const value = row[column.prop].toString().toLowerCase();
              return value.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      } else {
        // No search term entered, return all rows
        return this.rows;
      }
    },

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
    performSearch() {
      // Update the filtered rows based on the search term
      if (this.searchTerm) {
        this.filteredRows = this.rows.filter((row) => {
          // Check if any of the column values contain the search term
          return this.columns.some((column) => {
            const value = row[column.prop];
            if (value) {
              const valueString = value.toString().toLowerCase();
              return valueString.includes(this.searchTerm.toLowerCase());
            }
            return false;
          });
        });
      } else {
        // No search term entered, display all rows
        this.filteredRows = this.rows;
      }
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

</style>