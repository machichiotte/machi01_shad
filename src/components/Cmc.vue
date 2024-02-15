<!-- src/components/Cmc.vue -->
<template>
  <div class="page">
    <h1>CMC</h1>
    <div id="table">
      <vue-good-table
        :columns="columns"
        :rows="rows"
        :skip-diacritics="true"
        :search-options="{ enabled: true }"
        :pagination-options="{ enabled: true }"
      >
      </vue-good-table>

      <DataTable
        :value="items"
        :rows="itemsPerPage"
        :paginator="true"
        :currentPage="currentPage"
      >
        <Column
          v-for="(column, index) in columns"
          :key="index"
          :field="column.field"
          :header="column.label"
        ></Column>
        <Paginator
          :first="first"
          :rows="rows"
          :totalRecords="totalRecords"
          :rowsPerPageOptions="[5, 10, 20]"
          :onPageChange="onPageChange"
        ></Paginator>
      </DataTable>
    </div>
  </div>
</template>

<script>
import { cmcColumns } from "../js/columns.js";
import { getCmc } from "../js/getter.js";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

import Paginator from "primevue/paginator";
//import { Button } from 'primevue/button'; // For prime-button

export default {
  components: {
    DataTable,
    Column,
    Paginator,
    //Button, // Include Button component
  },
  name: "CmcPage",
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
          rank: item["cmc_rank"],
          name: item["name"],
          symbol: item["symbol"],
        };
      });
    },
  },
  methods: {
    async getData() {
      this.items = await getCmc();
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
    this.getData();
  },
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
</style>