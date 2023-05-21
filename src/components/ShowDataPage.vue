<template>
  <div>
    <h1>Show data</h1>
    <h2>CMC</h2>

    
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Rank</th>
          <th>Symbol</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedItems" :key="item.name">
          <td>{{ item.name }}</td>
          <td>{{ item['cmc_rank'] }}</td>
          <td>{{ item.symbol }}</td>
        </tr>
      </tbody>
    </table>
    <div class="pagination">
      <button v-if="currentPage > 1" @click="prevPage">Prev</button>
      <button v-for="page in pages" :key="page" @click="changePage(page)" :class="{ active: currentPage === page }">{{
        page }}</button>
      <button v-if="currentPage < pageCount" @click="nextPage">Next</button>
    </div>
  </div>
</template>

<script>
const serverHost = "http://localhost:3000";

export default {
  name: "ShowDataPage",
  data() {
    return {
      items: [],
      itemsPerPage: 100,
      currentPage: 1,
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
.market-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

table {
  border-collapse: collapse;
  width: 80%;
  margin-top: 20px;
}

th {
  font-size: 20px;
}

td,
th {
  border: 1px solid black;
  padding: 10px;
  text-align: center;
}
</style>