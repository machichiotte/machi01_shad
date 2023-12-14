<template>
  <div class="showcmc-page">
    <h1>CMC</h1>
    <div id="table">
      <vue-good-table :columns="columns" :rows="rows" :skip-diacritics="true"
        :search-options="{ enabled: true }" :pagination-options="{ enabled: true }">
      </vue-good-table>
    </div>
  </div>
</template>

<script>
const serverHost = process.env.VUE_APP_SERVER_HOST;
import { cmcColumns } from "../js/shadColumns.js";
import { saveCryptoDataToIndexedDB } from '../js/indexedDB';

export default {
  name: "ShowDataPage",
  data() {
    return {
      items: [],
      itemsPerPage: 20000,
      currentPage: 1,
      columns: cmcColumns,
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
          'rank': item['cmc_rank'],
          'name': item['name'],
          'symbol': item['symbol']
        };
      });
    },
  },
  methods: {
    async getCmcDataFromAPI() {
      try {
        const response = await fetch(`${serverHost}/get/cmcData`);
        const data = await response.json();
        this.items = data;

        // Save data to IndexedDB for future use
        await saveCryptoDataToIndexedDB('cryptoData', data);
      } catch (err) {
        console.error(err);
      }
    },
    async getCmcDataFromIndexedDB() {
      try {
        const db = await openDatabase();
        const transaction = db.transaction(['cryptoData'], 'readonly');
        const objectStore = transaction.objectStore('cryptoData');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
          const data = event.target.result;
          this.items = data;
        };

        request.onerror = (error) => {
          console.error('Error retrieving data from IndexedDB:', error);
          // If there's an error, fall back to fetching from API
          this.getCmcDataFromAPI();
        };
      } catch (error) {
        console.error('Error opening database:', error);
        // If there's an error, fall back to fetching from API
        this.getCmcDataFromAPI();
      }
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
  async mounted() {
    // Try to get data from IndexedDB first
    await this.getCmcDataFromIndexedDB();
  }
};
</script>

<style scoped>
.showcmc-page {
  overflow-x: auto;
}

#table {
  height: 700px;
  width: auto;
}

</style>