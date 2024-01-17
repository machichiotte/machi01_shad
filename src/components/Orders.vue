<!-- src/components/Orders.vue -->
<template>
  <div class="page">
    <h1>Ordres en cours</h1>
    <div id="table">
      <vue-good-table :columns="columns" :rows="rows" :skip-diacritics="true" :select-options="{ enabled: true }"
        :search-options="{ enabled: true }" :pagination-options="{ enabled: true }"
        v-on:selected-rows-change="selectionChanged" v-on:cell-click="showAssetDetails">
        <template #selected-row-actions>
          <MySellButtonVue :model="allRows" />
        </template>
      </vue-good-table>
    </div>
  </div>
</template>

<script>
import { ordersColumns } from '../js/columns.js';
import { getOrders } from '../js/getter.js';

import MySellButtonVue from './MySellButton.vue';

const ITEMS_PER_PAGE = 2000;

//TODO myDeleteButton instead of MySellButton

export default {
  name: "OrdersPage",
  data() {
    return {
      items: [],
      pageSize: ITEMS_PER_PAGE,
      currentPage: 1,
      columns: ordersColumns,
      showOverlay: false,
      allRows: null,
      selectedAsset: null,
    };
  },
  components: {
    MySellButtonVue
  },
  computed: {
    paginatedItems() {
      if (Array.isArray(this.items)) {
        return this.items.slice(
          (this.currentPage - 1) * this.pageSize,
          this.currentPage * this.pageSize
        );
      } else {
        // Gérez le cas où this.items n'est pas un tableau
        throw new Error("this.items is not an array:", this.items);
      }
    },
    pageCount() {
      return Math.ceil(this.items.length / this.pageSize);
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
          'oId': item['oId'],
          'platform': item['platform'],
          'symbol': item['symbol'],
          'type': item['type'],
          'side': item['side'],
          'amount': item['amount'],
          'price': item['price']
        };
      });
    },
  },
  methods: {
    async getData() {
      this.items = await getOrders();
    },
    selectionChanged(rows) {
      this.allRows = rows;
    },
    showAssetDetails(params) {
      // Vérifiez si la colonne cliquée est la colonne "asset"
      if (params.column.field === 'asset') {
        // Affichez l'overlay
        this.showOverlay = true;
        // Définissez la ligne sélectionnée
        this.selectedAsset = params.row;
      }
    },
    closeOverlay() {
      this.showOverlay = false;
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
</style>