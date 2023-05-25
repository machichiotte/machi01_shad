<template>
  <div class="admin-page">
    <h1>SHAD</h1>

    <div class="pagination">
      <button v-if="currentPage > 1" @click="prevPage">Prev</button>
      <button v-for="page in pages" :key="page" @click="changePage(page)" :class="{ active: currentPage === page }">{{ page }}</button>
      <button v-if="currentPage < pageCount" @click="nextPage">Next</button>
    </div>

    <div class="table-container">
      <table class="scrollable-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Rank</th>
            <th>Average Entry Price</th>
            <th>Percentage Difference</th>
            <th>Balance</th>
            <th>Exchange</th>
            <th>Total des achats</th>
            <th>Total des ventes</th>
            <th>Current Price</th>
            <th>Percent Change 24h</th>
            <th>Current Possession</th>
            <th>Ratio SHAD</th>
            <th>Open Buy Orders</th>
            <th>Open Sell Orders</th>
            <th>Gain</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedItems" :key="item.symbol">
            <td>{{ item.symbol }}</td>
            <td>{{ getCryptoRank(item.symbol) }}</td>
            <td>{{ calculateAverageEntryPrice(item.symbol) }}</td>
            <td :class="[getPercentageClass(calculatePercentageDifference(item.symbol))]">{{ calculatePercentageDifference(item.symbol) }}</td>
            <td>{{ item.balance }}</td>
            <td>{{ item.platform }}</td>
            <td>{{ calculateBuyTotal(item.symbol) }}</td>
            <td>{{ calculateSellTotal(item.symbol) }}</td>
            <td>{{ getCryptoPrice(item.symbol) }}</td>
            <td :class="[getPercentageClass(getCryptoPercentChange24h(item.symbol))]">{{ getCryptoPercentChange24h(item.symbol) }}</td>
            <td>{{ calculateCurrentPossession(item.symbol) }}</td>
            <td>{{ getRatioShad(item.symbol, item.platform) }}</td>
            <td>{{ openBuyOrders[item.symbol] || 0 }}</td>
            <td>{{ openSellOrders[item.symbol] || 0 }}</td>
            <td>{{ calculateProfit(item.symbol) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<script>
const serverHost = "http://localhost:3000";

export default {
  name: "AdminPage",
  data() {
    return {
      balances: [], // Les données des ordres à récupérer depuis l'API
      trades: [], // Les données des trades à récupérer depuis l'API
      strats: [], // Les données des strats à récupérer depuis l'API
      activeOrders: [], // Les données des activeOrders à récupérer depuis l'API
      cmcData: [], // Les données des cmcData à récupérer depuis l'API
      openBuyOrders: {}, // Nombre d'ordres d'achat ouverts par actif
      openSellOrders: {}, // Nombre d'ordres de vente ouverts par actif
      itemsPerPage: 500,
      currentPage: 1,
    };
  },
  computed: {
    paginatedItems() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.sortedBalances.slice(startIndex, endIndex);
    },
    pageCount() {
      return Math.ceil(this.sortedBalances.length / this.itemsPerPage);
    },
    pages() {
      const pages = [];
      for (let i = 1; i <= this.pageCount; i++) {
        pages.push(i);
      }
      return pages;
    },
    sortedBalances() {
      return this.balances.slice().sort((a, b) => {
        const symbolA = a.symbol.toUpperCase();
        const symbolB = b.symbol.toUpperCase();
        return symbolA.localeCompare(symbolB);
      });
    },
  },
  methods: {
    async getBalanceFromDB() {
      try {
        const response = await fetch(serverHost + '/get/balance');
        const data = await response.json();
        this.balances = data;
        console.log(this.balances);
      } catch (err) {
        console.error(err);
      }
    },
    async getTradesFromDB() {
      try {
        const response = await fetch(serverHost + '/get/trades');
        const data = await response.json();
        this.trades = data;
        console.log(this.trades);
      } catch (err) {
        console.error(err);
      }
    },
    async getStratsFromDB() {
      try {
        const response = await fetch(serverHost + '/get/strat');
        const data = await response.json();
        this.strats = data;
        console.log(this.strats);
      } catch (err) {
        console.error(err);
      }
    },
    async getActiveOrdersFromDB() {
      try {
        const response = await fetch(serverHost + '/get/activeOrders');
        const data = await response.json();
        this.activeOrders = data;
        console.log(this.activeOrders);

        // Réinitialiser les propriétés openBuyOrders et openSellOrders
        this.openBuyOrders = {};
        this.openSellOrders = {};

        // Calculer le nombre d'ordres ouverts par actif
        this.activeOrders.forEach(order => {
          const symbol = order.symbol.split('/')[0]; // Récupérer le symbole sans la paire
          if (order.side === 'buy') {
            this.openBuyOrders[symbol] = this.openBuyOrders[symbol] + 1 || 1; // Incrémenter le nombre d'ordres d'achat ouverts
          } else if (order.side === 'sell') {
            this.openSellOrders[symbol] = this.openSellOrders[symbol] + 1 || 1; // Incrémenter le nombre d'ordres de vente ouverts
          }
        });
      } catch (err) {
        console.error(err);
      }
    },

    async getCmcDataFromDB() {
      try {
        const response = await fetch(serverHost + '/get/cmcData');
        const data = await response.json();
        this.cmcData = data;
        console.log(this.cmcData);
      } catch (err) {
        console.error(err);
      }
    },
    calculateProfit(symbol) {
      const buyTotal = parseFloat(this.calculateBuyTotal(symbol));
      const sellTotal = parseFloat(this.calculateSellTotal(symbol));
      const currentPrice = parseFloat(this.getCryptoPrice(symbol));
      const balance = parseFloat(this.getBalance(symbol));

      if (isNaN(buyTotal) || isNaN(sellTotal) || isNaN(currentPrice) || isNaN(balance)) {
        return 'N/A';
      }

      const totalInvestment = buyTotal - sellTotal;
      const currentValue = currentPrice * balance;
      const profit = currentValue - totalInvestment;

      return profit.toFixed(2);
    },
    calculateBuyTotal(symbol) {
      const filteredTrades = this.trades.filter(trade => trade.pair === `${symbol}/USDT` && trade.type === 'buy');
      const buyTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.total), 0);
      return buyTotal.toFixed(2);
    },
    calculateSellTotal(symbol) {
      const filteredTrades = this.trades.filter(trade => trade.pair === `${symbol}/USDT` && trade.type === 'sell');
      const sellTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.total), 0);
      return sellTotal.toFixed(2);
    },
    calculateAverageEntryPrice(symbol) {
      const filteredTrades = this.trades.filter(trade => trade.pair === `${symbol}/USDT` && trade.type === 'buy');
      if (filteredTrades.length === 0) {
        return 'N/A';
      }
      const entryPrices = filteredTrades.map(trade => parseFloat(trade.price));
      const averageEntryPrice = entryPrices.reduce((total, price) => total + price, 0) / entryPrices.length;
      return averageEntryPrice.toFixed(7);
    },
    getRatioShad(symbol, platform) {
      const strategies = this.strats;
      const assetStrategies = strategies[symbol];

      if (!assetStrategies || !platform) {
        return 'NULL';
      }

      const strategy = assetStrategies[platform];

      if (strategy === 'strategy1') {
        return '2';
      }

      if (strategy === 'strategy2') {
        return '4';
      }

      return 'NULL';
    },

    getBalance(symbol) {
      const balance = this.sortedBalances.find(item => item.symbol === symbol);
      return balance ? balance.balance : 'N/A';
    },
    getCryptoRank(symbol) {
      const crypto = this.cmcData.find(item => item.symbol === symbol);
      return crypto ? crypto.cmc_rank : 'N/A';
    },
    getCryptoPrice(symbol) {
      const crypto = this.cmcData.find(item => item.symbol === symbol);
      return crypto ? crypto.quote.USD.price.toFixed(7) : 'N/A';
    },
    getCryptoPercentChange24h(symbol) {
      const crypto = this.cmcData.find(item => item.symbol === symbol);
      return crypto ? crypto.quote.USD.percent_change_24h.toFixed(2) + '%' : 'N/A';
    },
    calculatePercentageDifference(symbol) {
      const currentPrice = parseFloat(this.getCryptoPrice(symbol));
      const averageEntryPrice = parseFloat(this.calculateAverageEntryPrice(symbol));
      if (isNaN(currentPrice) || isNaN(averageEntryPrice)) {
        return 'N/A';
      }
      const percentageDifference = ((currentPrice - averageEntryPrice) / averageEntryPrice) * 100;
      return percentageDifference.toFixed(2) + '%';
    },
    calculateCurrentPossession(symbol) {
      const currentPrice = parseFloat(this.getCryptoPrice(symbol));
      const balance = parseFloat(this.getBalance(symbol));
      if (isNaN(currentPrice) || isNaN(balance)) {
        return 'N/A';
      }
      const currentPossession = (currentPrice * balance).toFixed(2);
      return currentPossession;
    },

    getPercentageClass(value) {
      if (value === 'N/A') {
        return '';
      } else if (parseFloat(value) > 0) {
        return 'positive-percent';
      } else if (parseFloat(value) < 0) {
        return 'negative-percent';
      }
      return '';
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
    this.getBalanceFromDB();
    this.getTradesFromDB();
    this.getStratsFromDB();
    this.getActiveOrdersFromDB();
    this.getCmcDataFromDB();
  }
};
</script>

<style scoped>

.admin-page {
  overflow-x: auto;
}

.scrollable-table {
  table-layout: auto;
  white-space: nowrap;
}

.table-container {
  padding: 10px; /* Ajoutez un padding pour la marge interne autour du tableau */
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

.negative-percent {
  color: red;
}

.positive-percent {
  color: green;
}
</style>
