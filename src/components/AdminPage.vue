<template>
  <div class="admin-page">
    <h1>SHAD</h1>

    <div id="table">
      <v-grid theme="compact" :source="rows" :columns="columns" :filter="false" :pagination="paginationConfig"
        :autoSizeColumn="{
          mode: 'autoSizeOnTextOverlap',
        }"></v-grid>
    </div>

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
import VGrid from "@revolist/vue3-datagrid";

// Fonction générique pour la création de cellules avec couleur en fonction du contenu
function createColoredCell(createElement, props) {
  const cellContent = props.model[props.prop];
  const textColor = cellContent.includes('-') ? 'red' : 'green';

  return createElement('span', {
    style: {
      color: textColor
    }
  }, cellContent);
}

// Fonction générique pour la création de cellules avec couleur de fond et texte personnalisés
function createPlatformColoredCell(createElement, props) {
  const cellContent = props.model[props.prop];
  const { backgroundColor, textColor } = getPlatformColors(cellContent);

  return createElement('div', {
    style: {
      backgroundColor,
      color: textColor,
      textAlign: 'center'
    }
  }, cellContent);
}

// Fonction pour définir les couleurs en fonction de la plateforme
function getPlatformColors(platform) {
  switch (platform) {
    case 'binance':
      return {
        backgroundColor: '#F3BA2F',
        textColor: 'black'
      };
    case 'kucoin':
      return {
        backgroundColor: '#23AF91',
        textColor: 'white'
      };
    case 'huobi':
      return {
        backgroundColor: '#2D8CF0',
        textColor: 'white'
      };
    case 'okex':
      return {
        backgroundColor: '#1A9924',
        textColor: 'black'
      };
    case 'gateio':
      return {
        backgroundColor: '#00A86B',
        textColor: 'white'
      };
    default:
      return {
        backgroundColor: '',
        textColor: 'black'
      };
  }
}

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
      itemsPerPage: 100,
      currentPage: 1,
      columns: [
        { name: "Symbol", prop: "symbol", pin: 'colPinStart', autoSize: true, sortable: true, order: "desc", },
        { name: "Total shad", prop: "totalShad", sortable: true, order: "desc", type: 'number' },
        { name: "Rank", prop: "rank", sortable: true, order: "desc", type: 'number' },
        { name: "Average Entry Price", prop: "averageEntryPrice", sortable: true, order: "desc", type: 'number' },
        { name: "Total buy", prop: "totalBuy", sortable: true, order: "desc", type: 'number' },
        { name: "Max wanted", prop: "maxWanted", sortable: true, order: "desc", type: 'number' },
        { name: "Percentage Difference", prop: "percentageDifference", sortable: true, order: "desc", cellTemplate: createColoredCell },
        { name: "Current Price", prop: "currentPrice", sortable: true, order: "desc", type: 'number' },

        { name: "Wallet", prop: "currentPossession", sortable: true, order: "desc", type: 'number' },
        { name: "Profit", prop: "profit", sortable: true, order: "desc", type: 'number' },

        { name: "Total sell", prop: "totalSell", sortable: true, order: "desc", type: 'number' },
        { name: "Recup shad", prop: "recupShad", sortable: true, order: "desc", type: 'number' },
        {
          name: 'Open Orders',
          children: [
            { name: "Buy", prop: "openBuyOrders", sortable: true, order: "desc", type: 'number' },
            { name: "Sell", prop: "openSellOrders", sortable: true, order: "desc", type: 'number' },
          ]
        },
        { name: "Quantite total achetee", prop: "totalQuantity", sortable: true, order: "desc", type: 'number' },
        { name: "Balance", prop: "balance", sortable: true, order: "desc", type: 'number' },
        {
          name: 'Recup',
          children: [
            { name: "tp1", prop: "recupTp1", sortable: true, order: "desc", type: 'number' },
            { name: "tpX", prop: "recupTpX", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP1',
          children: [
            { name: "qty", prop: "qtyTp1", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp1", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP2',
          children: [
            { name: "qty", prop: "qtyTp2", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp2", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP3',
          children: [
            { name: "qty", prop: "qtyTp3", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp3", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP4',
          children: [
            { name: "qty", prop: "qtyTp4", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp4", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP5',
          children: [
            { name: "qty", prop: "qtyTp5", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp5", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'Percent Change',
          children: [
            { name: "24h", prop: "cryptoPercentChange24h", sortable: true, order: "desc", cellTemplate: createColoredCell },
            { name: "7d", prop: "cryptoPercentChange7d", sortable: true, order: "desc", cellTemplate: createColoredCell },
            { name: "30d", prop: "cryptoPercentChange30d", sortable: true, order: "desc", cellTemplate: createColoredCell },
            { name: "60d", prop: "cryptoPercentChange60d", sortable: true, order: "desc", cellTemplate: createColoredCell },
            { name: "90d", prop: "cryptoPercentChange90d", sortable: true, order: "desc", cellTemplate: createColoredCell },
          ]
        },
        { name: "Exchange", prop: "platform", pin: 'colPinEnd', sortable: true, order: "desc", cellTemplate: createPlatformColoredCell }
      ],
      paginationConfig: {
        pageSize: 10, // Nombre d'éléments par page
        totalCount: 0, // Nombre total d'éléments
        current: 1, // Page actuelle
      },

    };
  },
  components: {
    VGrid,
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
    rows() {
      return this.paginatedItems.map(item => {
        const symbol = item.symbol;
        const platform = item.platform;
        const balance = item.balance;

        console.log(symbol);

        // Calcul des valeurs utilisées dans l'objet
        const rank = this.getCryptoRank(symbol);
        const averageEntryPrice = this.getAverageEntryPrice(symbol);
        const totalBuy = this.getTotalBuy(symbol, platform);
        const currentPrice = this.getCurrentPrice(symbol);
        const totalSell = this.getTotalSell(symbol);
        const openBuyOrders = this.openBuyOrders[symbol] || 0;
        const openSellOrders = this.openSellOrders[symbol] || 0;
        const totalQuantity = this.getTotalQuantity(symbol, platform);

        const cryptoPercentChange24h = this.getCryptoPercentChange24h(symbol);
        const cryptoPercentChange7d = this.getCryptoPercentChange7d(symbol);
        const cryptoPercentChange30d = this.getCryptoPercentChange30d(symbol);
        const cryptoPercentChange60d = this.getCryptoPercentChange60d(symbol);
        const cryptoPercentChange90d = this.getCryptoPercentChange90d(symbol);

        const maxWanted = this.getMaxWanted(rank, totalBuy);
        const recupShad = this.getRecupShad(totalBuy, totalSell, maxWanted);
        const percentageDifference = this.getPercentageDifference(currentPrice, averageEntryPrice);
        const currentPossession = this.getCurrentPossession(currentPrice, balance);
        const profit = this.getProfit(totalBuy, totalSell, currentPrice, balance);
        const recupTpX = this.getRecupTpX(symbol, platform, maxWanted);
        const totalShad = this.getDoneShad(totalBuy, totalSell, maxWanted, recupShad, recupTpX);
        const recupTp1 = this.getRecupTp1(totalBuy, totalSell, maxWanted, recupShad, recupTpX, totalShad);

        const qtyTp1 = this.getQtyTp1(recupTp1, averageEntryPrice, balance, totalBuy, totalSell, totalShad)
        const priceTp1 = this.getPriceTp1(recupTp1, qtyTp1);

        const qtyTp2 = this.getQtyTp2(balance, qtyTp1);
        const priceTp2 = this.getPriceTp2(recupTpX, qtyTp2);
        const qtyTp3 = this.getQtyTp3(balance, qtyTp1, qtyTp2);
        const priceTp3 = this.getPriceTp3(recupTpX, qtyTp3);
        const qtyTp4 = this.getQtyTp4(balance, qtyTp1, qtyTp2, qtyTp3);
        const priceTp4 = this.getPriceTp4(recupTpX, qtyTp4);
        const qtyTp5 = this.getQtyTp5(balance, qtyTp1, qtyTp2, qtyTp3, qtyTp4);
        const priceTp5 = this.getPriceTp5(recupTpX, qtyTp5);


        // Retourne l'objet avec les valeurs calculées
        return {
          symbol,
          totalShad,
          rank,
          averageEntryPrice,
          totalBuy,
          maxWanted,
          percentageDifference,
          currentPrice,
          currentPossession,
          profit,
          totalSell,
          recupShad,
          openBuyOrders,
          openSellOrders,
          totalQuantity,
          balance,
          recupTp1,
          recupTpX,
          qtyTp1,
          priceTp1,
          qtyTp2,
          priceTp2,
          qtyTp3,
          priceTp3,
          qtyTp4,
          priceTp4,
          qtyTp5,
          priceTp5,
          cryptoPercentChange24h,
          cryptoPercentChange7d,
          cryptoPercentChange30d,
          cryptoPercentChange60d,
          cryptoPercentChange90d,
          platform
        };
      });
    }
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

    getProfit(totalBuy, totalSell, currentPrice, balance) {
      const buyTotal = parseFloat(totalBuy);
      const sellTotal = parseFloat(totalSell);
      const price = parseFloat(currentPrice);
      const bal = parseFloat(balance);

      if (isNaN(buyTotal) || isNaN(sellTotal) || isNaN(price) || isNaN(bal)) {
        return 'N/A';
      }

      const totalInvestment = buyTotal - sellTotal;
      const currentValue = price * bal;
      const profit = currentValue - totalInvestment;

      return profit.toFixed(2);
    },
    getRecupShad(totalBuy, totalSell, maxWanted) {

      if (totalSell > 0) {
        if (maxWanted < totalBuy) {
          return Math.round(totalSell - totalBuy + maxWanted, 2);
        } else {
          return Math.round(totalSell, 2);
        }
      }
      return 0;
    },
    //TODO PROBLEM ICI 
    getRecupTp1(totalBuy, totalSell, maxWanted, recupShad, recupTpX, totalShad) {
      let recupTp1 = (maxWanted) + (totalSell) < (totalBuy) ? (totalBuy) - (totalSell) - (maxWanted) :
        (recupTpX) - (recupShad) + (totalShad) * (recupTpX);
      if ((recupTp1) <= 1) {
        recupTp1 = (recupTpX);
      }
      return recupTp1;
    },
    getRecupTpX(symbol, platform, maxWanted) {
      return maxWanted * this.getRatioShad(symbol, platform) * .5;
    },
    getDoneShad(totalBuy, totalSell, maxWanted, recupShad, recupTpX) {
      if (Math.abs(totalBuy - maxWanted) > 0.5 && totalSell < 0.95 * Math.abs(totalBuy - maxWanted)) {
        return -1;
      } else if (recupShad >= 0.95 * recupTpX) {
        return -1 + Math.round(1.1 + recupShad / recupTpX, 2);
      } else {
        return 0;
      }
    },
    getPriceTp1(recupTp1, qtyTp1) {
      return parseFloat(recupTp1) / parseFloat(qtyTp1);
    },
    getQtyTp1(recupTp1, averageEntryPrice, balance, totalBuy, totalSell, totalShad) {
      const parsedRecupTp1 = parseFloat(recupTp1);
      const parsedEntryAvg = parseFloat(averageEntryPrice);
      const parsedBalance = parseFloat(balance);
      const parsedTotalBuy = parseFloat(totalBuy);
      const parsedTotalSell = parseFloat(totalSell);

      if (totalShad > -1) {
        return 0.5 * parsedBalance;
      } else if (parsedRecupTp1 / parsedEntryAvg < parsedBalance) {
        return parsedRecupTp1 / parsedEntryAvg;
      } else {
        return parsedRecupTp1 * parsedBalance / (parsedTotalBuy - parsedTotalSell);
      }
    },
    getTotalBuy(symbol, platform) {
      const filteredTrades = this.trades.filter(trade => trade.pair === `${symbol}/USDT` && trade.type === 'buy' && trade.platform === platform);
      const buyTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.total), 0);
      return buyTotal.toFixed(2);
    },
    getTotalQuantity(symbol, platform) {
      const filteredTrades = this.trades.filter(trade => trade.pair === `${symbol}/USDT` && trade.type === 'buy' && trade.platform === platform);
      const qtyBuy = filteredTrades.reduce((total, trade) => total + parseFloat(trade.amount), 0);
      return qtyBuy;
    },
    getTotalSell(symbol) {
      const filteredTrades = this.trades.filter(trade => trade.pair === `${symbol}/USDT` && trade.type === 'sell');
      const sellTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.total), 0);
      return sellTotal.toFixed(2);
    },
    getMaxWanted(rank, totalBuy) {
      switch (true) {
        case (rank > 1000):
          return (Math.min(totalBuy, 5)).toFixed(2);
        case (rank > 800):
          return (Math.min(totalBuy, 10)).toFixed(2);
        case (rank > 600):
          return (Math.min(totalBuy, 25)).toFixed(2);
        case (rank > 400):
          return (Math.min(totalBuy, 50)).toFixed(2);
        case (rank > 300):
          return (Math.min(totalBuy, 100)).toFixed(2);
        case (rank > 200):
          return (Math.min(totalBuy, 200)).toFixed(2);
        case (rank <= 200):
          return totalBuy;
      }
    },
    getAverageEntryPrice(symbol) {
      const filteredTrades = this.trades.filter(trade => trade.pair === `${symbol}/USDT` && trade.type === 'buy');
      if (filteredTrades.length === 0) {
        return 0;
      }
      const entryPrices = filteredTrades.map(trade => parseFloat(trade.price));
      const averageEntryPrice = entryPrices.reduce((total, price) => total + price, 0) / entryPrices.length;
      return averageEntryPrice;
    },
    getRatioShad(symbol, platform) {
      const assetStrategies = this.strats[symbol];

      if (!assetStrategies || !platform) {
        //return 'NULL';
        return 2;
      }

      const strategy = assetStrategies[platform];

      if (strategy === 'strategy1') {
        return '2';
      }

      if (strategy === 'strategy2') {
        return '4';
      }

      return 2;
    },
    getBalance(symbol) {
      const balance = this.sortedBalances.find(item => item.symbol === symbol);
      return balance ? balance.balance : 'N/A';
    },
    getCryptoRank(symbol) {
      const crypto = this.cmcData.find(item => item.symbol === symbol);
      return crypto ? parseInt(crypto.cmc_rank) : 0;
    },
    getCurrentPrice(symbol) {
      const crypto = this.cmcData.find(item => item.symbol === symbol);
      return crypto ? crypto.quote.USD.price.toFixed(7) : 'N/A';
    },
    getCryptoPercentChange24h(symbol) {
      const crypto = this.cmcData.find(item => item.symbol === symbol);
      return crypto ? crypto.quote.USD.percent_change_24h.toFixed(2) + '%' : 'N/A';
    },
    getCryptoPercentChange7d(symbol) {
      const crypto = this.cmcData.find(item => item.symbol === symbol);
      return crypto ? crypto.quote.USD.percent_change_7d.toFixed(2) + '%' : 'N/A';
    },
    getCryptoPercentChange30d(symbol) {
      const crypto = this.cmcData.find(item => item.symbol === symbol);
      return crypto ? crypto.quote.USD.percent_change_30d.toFixed(2) + '%' : 'N/A';
    },
    getCryptoPercentChange60d(symbol) {
      const crypto = this.cmcData.find(item => item.symbol === symbol);
      return crypto ? crypto.quote.USD.percent_change_60d.toFixed(2) + '%' : 'N/A';
    },
    getCryptoPercentChange90d(symbol) {
      const crypto = this.cmcData.find(item => item.symbol === symbol);
      return crypto ? crypto.quote.USD.percent_change_90d.toFixed(2) + '%' : 'N/A';
    },
    getPercentageDifference(currentPrice, averageEntryPrice) {
      const price = parseFloat(currentPrice);
      const avgEntryPrice = parseFloat(averageEntryPrice);
      if (isNaN(price) || isNaN(avgEntryPrice)) {
        return 'N/A';
      }
      const percentageDifference = ((price - avgEntryPrice) / avgEntryPrice) * 100;
      return percentageDifference.toFixed(2) + '%';
    },
    getCurrentPossession(currentPrice, balance) {
      if (isNaN(currentPrice) || isNaN(balance)) {
        return 0;
      }
      const currentPossession = (currentPrice * balance).toFixed(2);
      return currentPossession;
    },
    getPriceTp2(recupTpX, qtyTp2) {
      return recupTpX / qtyTp2;
    },
    getPriceTp3(recupTpX, qtyTp3) {
      return recupTpX / qtyTp3;
    },
    getPriceTp4(recupTpX, qtyTp4) {
      return recupTpX / qtyTp4;
    },
    getPriceTp5(recupTpX, qtyTp5) {
      return recupTpX / qtyTp5;
    },
    getQtyTp2(balance, qtyTp1) {
      return 0.5 * (balance - qtyTp1);
    },
    getQtyTp3(balance, qtyTp1, qtyTp2) {
      return 0.5 * (balance - qtyTp1 - qtyTp2);
    },
    getQtyTp4(balance, qtyTp1, qtyTp2, qtyTp3) {
      return 0.5 * (balance - qtyTp1 - qtyTp2 - qtyTp3);
    },
    getQtyTp5(balance, qtyTp1, qtyTp2, qtyTp3, qtyTp4) {
      return 0.5 * (balance - qtyTp1 - qtyTp2 - qtyTp3 - qtyTp4);
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

#table {
  height: 500px;
  width: auto;
}

revo-grid {
  height: 100%;
}
</style>
