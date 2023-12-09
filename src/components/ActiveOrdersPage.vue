<template>
  <div class="activeorders-page">
    <h1>Ordres en cours</h1>
    <div id="table">
      <vue-good-table :columns="columns" :rows="rows" :skip-diacritics="true" :select-options="{ enabled: true }"
        :search-options="{ enabled: true }" :pagination-options="{ enabled: true }"
        v-on:selected-rows-change="selectionChanged" v-on:cell-click="onCellClick">
        <template #selected-row-actions>
          <MySellButtonVue :model="allRows" />
        </template>
      </vue-good-table>
    </div>
  </div>
</template>

<script>
//TODO myDeleteButton instead of MySellButton
const serverHost = process.env.VUE_APP_SERVER_HOST;
import { activeOrdersColumns } from "../js/shadColumns.js";
import MySellButtonVue from './MySellButton.vue';

export default {
  name: "ActiveOrdersPage",
  data() {
    return {
      items: [],
      pageSize: 2000,
      currentPage: 1,
      columns: activeOrdersColumns,

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
        console.error("this.items is not an array:", this.items);
        return [];
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
          'price': item['price'],
        };
      });
    },
  },
  methods: {
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
    async deleteItem(item) {
      // Appeler l'API pour annuler l'ordre à l'index donné
      try {
        const response = await fetch(`${serverHost}/deleteOrder?exchangeId=${item.platform}&oId=${item.oId}&symbol=${item.symbol}`);
        const data = await response.json();
        console.log("code :: " + data.code);
      } catch (err) {
        console.error(err);
      }
    },
    async getActiveOrderFromDB() {
      try {
        const response = await fetch(`${serverHost}/get/activeOrders`);
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
    },
  },
  mounted() {
    this.getActiveOrderFromDB();
  }
};
</script>

<style scoped>
.activeorders-page {
  overflow-x: auto;
}

#table {
  height: 700px;
  width: auto;
}
</style>