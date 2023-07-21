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
const serverHost = "http://localhost:3000";
import { cmcColumns } from "../js/shadColumns.js";

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
      try {
        const response = await fetch(serverHost + '/get/cmcData');
        const data = await response.json();
        this.items = data;
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
  mounted() {
    this.getCmcData();
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