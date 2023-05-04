<template>
  <div class="market-page">
    <h1>Gestion des ordres</h1>
    <h2>Ordres en cours</h2>

    <div class="pagination">
      <button v-if="currentPage > 1" @click="prevPage">Prev</button>
      <button v-for="page in pages" :key="page" @click="changePage(page)" :class="{ active: currentPage === page }">{{
        page }}</button>
      <button v-if="currentPage < pageCount" @click="nextPage">Next</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>oId</th>
          <th>Platform</th>
          <th>Symbol</th>
          <th>Type</th>
          <th>Side</th>
          <th>Amount</th>
          <th>Price</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedItems" :key="item.id">
          <td>{{ item.oId }}</td>
          <td>{{ item.platform }}</td>
          <td>{{ item.symbol }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.side }}</td>
          <td>{{ item.amount }}</td>
          <td>{{ item.price }}</td>
          <td><button @click="deleteItem(item)">Cancel</button></td>
        </tr>
      </tbody>
    </table>
    
  </div>
</template>

<script>
const serverHost = "http://localhost:3000";

export default {
  name: "ActiveOrdersPage",
  data() {
    return {
      items: [],
      itemsPerPage: 20,
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
        const response = await fetch(serverHost + '/get/activeOrders');
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