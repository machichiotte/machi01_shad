<template>
  <div class="market-page">
    <h1>Liste des trades</h1>

    <div class="pagination">
      <button v-if="currentPage > 1" @click="prevPage">Prev</button>
      <button v-for="page in pages" :key="page" @click="changePage(page)" :class="{ active: currentPage === page }">{{
        page }}</button>
      <button v-if="currentPage < pageCount" @click="nextPage">Next</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>altA</th>
          <th>altB</th>
          <th>date</th>
          <th>pair</th>
          <th>type</th>
          <th>price</th>
          <th>amount</th>
          <th>total</th>
          <th>fee</th>
          <th>feecoin</th>
          <th>platform</th>
          <th>explatform</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedItems" :key="item.id">
          <td>{{ item.altA }}</td>
          <td>{{ item.altB }}</td>
          <td>{{ item.date }}</td>
          <td>{{ item.pair }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.price }}</td>
          <td>{{ item.amount }}</td>
          <td>{{ item.total }}</td>
          <td>{{ item.fee }}</td>
          <td>{{ item.feecoin }}</td>
          <td>{{ item.platform }}</td>
          <td>{{ item.explatform }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
const serverHost = "http://localhost:3000";

export default {
  name: "TradesPage",
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
    async getTradesFromDB() {
      try {
        const response = await fetch(serverHost + '/get/trades');
        console.log("resp :: " + response)
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
    this.getTradesFromDB();
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