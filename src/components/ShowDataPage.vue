<template>
  <div class="showcmc-page">
    <h1>CMC</h1>
    <div id="table">
      <vue-good-table :columns="columns" :rows="rows" :skip-diacritics="true" :search-options="{ enabled: true }"
        :pagination-options="{ enabled: true }">
      </vue-good-table>
    </div>
  </div>
</template>

<script>
const serverHost = process.env.VUE_APP_SERVER_HOST;
import { cmcColumns } from "../js/shadColumns.js";
import { fetchDataWithCache, saveCmcDataToIndexedDB } from '../js/indexedDB';

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
    async getCmcData() {
      const DATA_TYPE = "cmcData";
      const ENDPOINT = `${serverHost}/get/${DATA_TYPE}`;

      try {
        this.items = await fetchDataWithCache(DATA_TYPE, ENDPOINT, saveCmcDataToIndexedDB);
      } catch (err) {
        console.error(err);
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
    await this.getCmcData();
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