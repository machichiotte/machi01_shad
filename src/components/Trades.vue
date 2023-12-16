<template>
  <div class="page">
    <h1>Liste des trades</h1>
    <div id="table">
      <vue-good-table :columns="tradesColumns" :rows="rows" :skip-diacritics="true" :select-options="{ enabled: true }"
        :search-options="{ enabled: true }" :pagination-options="{ enabled: true }">
      </vue-good-table>
    </div>
  </div>
</template>

<script>
const serverHost = process.env.VUE_APP_SERVER_HOST;
import { tradesColumns } from "../js/shadColumns.js";
import { fetchDataWithCache, saveTradesDataToIndexedDB } from '../js/indexedDB';

export default {
  name: "Trades",
  data() {
    return {
      items: [],
      itemsPerPage: 10000,
      currentPage: 1,
      tradesColumns: tradesColumns,
    };
  },
  computed: {
    paginatedItems() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.items.slice(startIndex, endIndex);
    },
    pageCount() {
      return Math.ceil(this.items.length / this.itemsPerPage);
    },
    pages() {
      const pages = [];
      for (let i = 1; i <= this.pageCount; i++) {
        pages.push(i);
      }
      return pages;
    },
    rows() {
      return this.paginatedItems.map((item) => {
        return {
          'altA': item['altA'],
          'altB': item['altB'],
          'date': item['date'],
          'pair': item['pair'],
          'type': item['type'],
          'price': item['price'],
          'amount': item['amount'],
          'total': item['total'],
          'fee': item['fee'],
          'feecoin': item['feecoin'],
          'platform': item['platform'],
          'explatform': item['explatform']
        };
      })
    }
  },
  methods: {
    async getTrades() {
      const DATA_TYPE = "trades";
      const ENDPOINT = `${serverHost}/get/${DATA_TYPE}`;

      try {
        this.items = await fetchDataWithCache(DATA_TYPE, ENDPOINT, saveTradesDataToIndexedDB);
      } catch (err) {
        console.error(err);
      }
    },
    sortItemsByDate() {
      this.items.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Trie par ordre décroissant
      });
    },
    prevPage() {
      this.currentPage--;
    },
    nextPage() {
      this.currentPage++;
    },
    changePage(page) {
      this.currentPage = page;
    }
  },
  mounted() {
    this.getTrades();
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