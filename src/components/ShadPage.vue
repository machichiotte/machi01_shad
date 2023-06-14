<template>
  <div class="admin-page">
    <h1>SHAD</h1>

    <div id="table">
      <v-grid theme="compact" :source="rows" :columns="columns" :filter="false" :pagination="paginationConfig">
        <template v-slot:item="{ item }">
          <tr :key="item.asset">
            <!-- Render columns using the key attribute -->
            <td v-for="column in columns" :key="column.name">
              <!-- Render individual cells using the key attribute -->
              <component :is="getComponentType(column)" :column="column" :model="item" />
            </td>
          </tr>
        </template>
      </v-grid>
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
import VGrid, { VGridVueTemplate } from "@revolist/vue3-datagrid";
import { ref } from "vue";

const mySellButton = {
  props: ["rowIndex", "model"],
  setup(props) {
    const countIndex = ref(0);

    const iAmClicked = async () => {
      props.model.count.value++;

      const asset = props.model.asset;
      const exchangeId = props.model.exchangeId;

      await cancelAllOrders(exchangeId, asset);

      const amounts = [props.model.amountTp1, props.model.amountTp2, props.model.amountTp3, props.model.amountTp4, props.model.amountTp5];
      const prices = [props.model.priceTp1, props.model.priceTp2, props.model.priceTp3, props.model.priceTp4, props.model.priceTp5];

      for (let i = 0; i < 5; i++) {
        await bunchOrders(exchangeId, asset, amounts[i], prices[i]);
      }
    };

    return {
      countIndex,
      iAmClicked,
    };
  },
  render(props) {
    return (
      <button onClick={this.iAmClicked}>
        {props.model.count.value} times.
      </button>
    );
  },
};

async function cancelAllOrders(exchangeId, asset) {
  try {
    const requestBody = {
      exchangeId: exchangeId,
      asset: asset
    };

    const response = await fetch(`${serverHost}/cancel/all-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

async function bunchOrders(exchangeId, asset, amount, price) {
  try {
    const requestBody = {
      exchangeId: exchangeId,
      asset: asset,
      amount: amount,
      price: price
    };

    const response = await fetch(`${serverHost}/bunch-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

// Generic function for creating cells with color based on content
function createColoredCell(createElement, props) {
  const cellContent = props.model[props.prop];
  const textColor = cellContent.includes('-') ? 'red' : 'green';

  return createElement('span', {
    style: {
      color: textColor
    }
  }, cellContent);
}

// Generic function for creating cells with custom background color and text
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

// Function to define colors based on the exchangeId
function getPlatformColors(exchangeId) {
  switch (exchangeId) {
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
      balances: [],
      trades: [],
      strats: [],
      activeOrders: [],
      cmcData: [],
      openBuyOrders: {},
      openSellOrders: {},
      itemsPerPage: 100,
      currentPage: 1,

      assets: [],
      ratioShads: [],
      totalShads: [],
      ranks: [],
      averageEntryPrices: [],
      totalBuys: [],
      maxWanteds: [],
      percentageDifferences: [],
      currentPrices: [],
      currentPossessions: [],
      profits: [],
      totalSells: [],
      recupShads: [],
      openBuyOrderss: [],
      openSellOrderss: [],
      totalQuantitys: [],
      bals: [],
      recupTp1s: [],
      recupTpXs: [],
      amountTp1s: [],
      priceTp1s: [],
      amountTp2s: [],
      priceTp2s: [],
      amountTp3s: [],
      priceTp3s: [],
      amountTp4s: [],
      priceTp4s: [],
      amountTp5s: [],
      priceTp5s: [],
      cryptoPercentChange24hs: [],
      cryptoPercentChange7ds: [],
      cryptoPercentChange30ds: [],
      cryptoPercentChange60ds: [],
      cryptoPercentChange90ds: [],
      exchangeIds: [],
      counts: [],

      columns: [
        { name: "Asset", prop: "asset", pin: 'colPinStart', autoSize: true, sortable: true, order: "asc", },
        { name: "Actions", cellTemplate: VGridVueTemplate(mySellButton), canFocus: false },

        { name: "Ratio", prop: "ratioShad", autoSize: true, sortable: true, order: "desc", },
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
            { name: "amount", prop: "amountTp1", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp1", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP2',
          children: [
            { name: "amount", prop: "amountTp2", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp2", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP3',
          children: [
            { name: "amount", prop: "amountTp3", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp3", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP4',
          children: [
            { name: "amount", prop: "amountTp4", sortable: true, order: "desc", type: 'number' },
            { name: "price", prop: "priceTp4", sortable: true, order: "desc", type: 'number' },
          ]
        },
        {
          name: 'TP5',
          children: [
            { name: "amount", prop: "amountTp5", sortable: true, order: "desc", type: 'number' },
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
        { name: "Exchange", prop: "exchangeId", pin: 'colPinEnd', sortable: true, order: "desc", cellTemplate: createPlatformColoredCell }
      ],
      paginationConfig: {
        pageSize: 10,
        totalCount: 0,
        current: 1,
      },

    };
  },
  components: {
    VGrid, mySellButton
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
        const assetA = a.symbol.toUpperCase();
        const assetB = b.symbol.toUpperCase();
        return assetA.localeCompare(assetB);
      });
    },
    rows() {
      return this.paginatedItems.map((item, index) => {
        const { symbol, platform, balance } = item;

        this.assets[index] = symbol;
        this.exchangeIds[index] = platform;
        this.bals[index] = balance;

        this.ranks[index] = this.getCryptoRank(this.assets[index]);
        this.totalSells[index] = this.getTotalSell(this.assets[index]);
        this.currentPrices[index] = this.getCurrentPrice(this.assets[index]);
        this.averageEntryPrices[index] = this.getAverageEntryPrice(this.assets[index]);
        this.openBuyOrderss[index] = this.openBuyOrders[this.assets[index]] || 0;
        this.openSellOrderss[index] = this.openSellOrders[this.assets[index]] || 0;

        this.ratioShads[index] = this.getRatioShad(this.assets[index], this.exchangeIds[index]);
        this.totalBuys[index] = this.getTotalBuy(this.assets[index], this.exchangeIds[index]);
        this.totalQuantitys[index] = this.getTotalQuantity(this.assets[index], this.exchangeIds[index]);

        this.cryptoPercentChange24hs[index] = this.getCryptoPercentChange(this.assets[index], '24h');
        this.cryptoPercentChange7ds[index] = this.getCryptoPercentChange(this.assets[index], '7d');
        this.cryptoPercentChange30ds[index] = this.getCryptoPercentChange(this.assets[index], '30d');
        this.cryptoPercentChange60ds[index] = this.getCryptoPercentChange(this.assets[index], '60d');
        this.cryptoPercentChange90ds[index] = this.getCryptoPercentChange(this.assets[index], '90d');

        this.maxWanteds[index] = this.getMaxWanted(this.ranks[index], this.totalBuys[index]);
        this.recupShads[index] = this.getRecupShad(this.totalBuys[index], this.totalSells[index], this.maxWanteds[index]);
        this.percentageDifferences[index] = this.getPercentageDifference(this.currentPrices[index], this.averageEntryPrices[index]);
        this.currentPossessions[index] = this.getCurrentPossession(this.currentPrices[index], this.bals[index]);
        this.profits[index] = this.getProfit(this.totalBuys[index], this.totalSells[index], this.currentPrices[index], this.bals[index]);
        this.recupTpXs[index] = this.getRecupTpX(this.maxWanteds[index], this.ratioShads[index]);
        this.totalShads[index] = this.getDoneShad(this.totalBuys[index], this.totalSells[index], this.maxWanteds[index], this.recupShads[index], this.recupTpXs[index]);
        this.recupTp1s[index] = this.getRecupTp1(this.totalBuys[index], this.totalSells[index], this.maxWanteds[index], this.recupShads[index], this.recupTpXs[index], this.totalShads[index]);

        this.amountTp1s[index] = this.getamountTp1(this.recupTp1s[index], this.averageEntryPrices[index], this.bals[index], this.totalBuys[index], this.totalSells[index], this.totalShads[index]);
        this.amountTp2s[index] = this.getamountTp2(this.bals[index], this.amountTp1s[index]);
        this.amountTp3s[index] = this.getamountTp3(this.bals[index], this.amountTp1s[index], this.amountTp2s[index]);
        this.amountTp4s[index] = this.getamountTp4(this.bals[index], this.amountTp1s[index], this.amountTp2s[index], this.amountTp3s[index]);
        this.amountTp5s[index] = this.getamountTp5(this.bals[index], this.amountTp1s[index], this.amountTp2s[index], this.amountTp3s[index], this.amountTp4s[index]);
        
        this.priceTp1s[index] = this.getPriceTp1(this.recupTp1s[index], this.amountTp1s[index]);
        this.priceTp2s[index] = this.getPriceTp2(this.recupTpXs[index], this.amountTp2s[index]);
        this.priceTp3s[index] = this.getPriceTp3(this.recupTpXs[index], this.amountTp3s[index]);
        this.priceTp4s[index] = this.getPriceTp4(this.recupTpXs[index], this.amountTp4s[index]);
        this.priceTp5s[index] = this.getPriceTp5(this.recupTpXs[index], this.amountTp5s[index]);

        if (!this.counts[index]) {
          this.counts[index] = ref(0);
        }

        return {
          asset: this.assets[index],
          ratioShad: this.ratioShads[index],
          totalShad: this.totalShads[index],
          rank: this.ranks[index],
          averageEntryPrice: this.averageEntryPrices[index],
          totalBuy: this.totalBuys[index],
          maxWanted: this.maxWanteds[index],
          percentageDifference: this.percentageDifferences[index],
          currentPrice: this.currentPrices[index],
          currentPossession: this.currentPossessions[index],
          profit: this.profits[index],
          totalSell: this.totalSells[index],
          recupShad: this.recupShads[index],
          openBuyOrders: this.openBuyOrderss[index],
          openSellOrders: this.openSellOrderss[index],
          totalQuantity: this.totalQuantitys[index],
          balance: this.bals[index],
          recupTp1: this.recupTp1s[index],
          recupTpX: this.recupTpXs[index],
          amountTp1: this.amountTp1s[index],
          priceTp1: this.priceTp1s[index],
          amountTp2: this.amountTp2s[index],
          priceTp2: this.priceTp2s[index],
          amountTp3: this.amountTp3s[index],
          priceTp3: this.priceTp3s[index],
          amountTp4: this.amountTp4s[index],
          priceTp4: this.priceTp4s[index],
          amountTp5: this.amountTp5s[index],
          priceTp5: this.priceTp5s[index],
          cryptoPercentChange24h: this.cryptoPercentChange24hs[index],
          cryptoPercentChange7d: this.cryptoPercentChange7ds[index],
          cryptoPercentChange30d: this.cryptoPercentChange30ds[index],
          cryptoPercentChange60d: this.cryptoPercentChange60ds[index],
          cryptoPercentChange90d: this.cryptoPercentChange90ds[index],
          exchangeId: this.exchangeIds[index],
          count: this.counts[index],
        };
      });
    }
  },
  methods: {
    getComponentType(column) {
      if (column.cellTemplate) {
        return VGridVueTemplate(mySellButton);
      }
      return 'span';
    },

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
          const asset = order.symbol.split('/')[0]; // Récupérer l'asset sans la paire
          if (order.side === 'buy') {
            this.openBuyOrders[asset] = this.openBuyOrders[asset] + 1 || 1; // Incrémenter le nombre d'ordres d'achat ouverts
          } else if (order.side === 'sell') {
            this.openSellOrders[asset] = this.openSellOrders[asset] + 1 || 1; // Incrémenter le nombre d'ordres de vente ouverts
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
    getRecupTp1(totalBuy, totalSell, maxWanted, recupShad, recupTpX, totalShad) {
      let recupTp1 = (maxWanted) + (totalSell) < (totalBuy) ? (totalBuy) - (totalSell) - (maxWanted) :
        (recupTpX) - (recupShad) + (totalShad) * (recupTpX);
      if ((recupTp1) <= 1) {
        recupTp1 = (recupTpX);
      }
      return recupTp1;
    },
    getRecupTpX(maxWanted, ratioShad) {
      return maxWanted * ratioShad * .5;
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
    getPriceTp1(recupTp1, amountTp1) {
      return parseFloat(recupTp1) / parseFloat(amountTp1);
    },
    getamountTp1(recupTp1, averageEntryPrice, balance, totalBuy, totalSell, totalShad) {
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
    getTotalBuy(asset, exchangeId) {
      const filteredTrades = this.trades.filter(trade => trade.pair === `${asset}/USDT` && trade.type === 'buy' && trade.platform === exchangeId);
      const buyTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.total), 0);
      return buyTotal.toFixed(2);
    },
    getTotalQuantity(asset, exchangeId) {
      const filteredTrades = this.trades.filter(trade => trade.pair === `${asset}/USDT` && trade.type === 'buy' && trade.platform === exchangeId);
      const amountBuy = filteredTrades.reduce((total, trade) => total + parseFloat(trade.amount), 0);
      return amountBuy;
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

    getRatioShad(asset, exchangeId) {
      const strategy = this.strats[0][asset][exchangeId];

      switch (strategy) {
        case 'strategy1':
          return '2';
        case 'strategy2':
          return '4';
        case 'strategy3':
          return '8';
        default:
          return 'NULL';
      }
    },

    getTotalSell(asset) {
      const filteredTrades = this.trades.filter(trade => trade.pair === `${asset}/USDT` && trade.type === 'sell');
      const sellTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.total), 0);
      return sellTotal.toFixed(2);
    },
    getAverageEntryPrice(asset) {
      const filteredTrades = this.trades.filter(trade => trade.pair === `${asset}/USDT` && trade.type === 'buy');
      if (filteredTrades.length === 0) {
        return 0;
      }
      const entryPrices = filteredTrades.map(trade => parseFloat(trade.price));
      const averageEntryPrice = entryPrices.reduce((total, price) => total + price, 0) / entryPrices.length;
      return averageEntryPrice;
    },
    getBalance(asset) {
      const balance = this.sortedBalances.find(item => item.symbol === asset);
      return balance ? balance.balance : 'N/A';
    },
    getCryptoRank(asset) {
      const crypto = this.cmcData.find(item => item.symbol === asset);
      return crypto ? parseInt(crypto.cmc_rank) : 0;
    },
    getCurrentPrice(asset) {
      const crypto = this.cmcData.find(item => item.symbol === asset);
      return crypto ? crypto.quote.USD.price.toFixed(7) : 'N/A';
    },


    getCryptoPercentChange(asset, timePeriod) {
      const crypto = this.cmcData.find(item => item.symbol === asset);
      if (crypto) {
        const percentChange = crypto.quote.USD[`percent_change_${timePeriod}`];
        return percentChange ? percentChange.toFixed(2) + '%' : 'N/A';
      } else {
        return 'N/A';
      }
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
    getPriceTp2(recupTpX, amountTp2) {
      return recupTpX / amountTp2;
    },
    getPriceTp3(recupTpX, amountTp3) {
      return recupTpX / amountTp3;
    },
    getPriceTp4(recupTpX, amountTp4) {
      return recupTpX / amountTp4;
    },
    getPriceTp5(recupTpX, amountTp5) {
      return recupTpX / amountTp5;
    },
    getamountTp2(balance, amountTp1) {
      return 0.5 * (balance - amountTp1);
    },
    getamountTp3(balance, amountTp1, amountTp2) {
      return 0.5 * (balance - amountTp1 - amountTp2);
    },
    getamountTp4(balance, amountTp1, amountTp2, amountTp3) {
      return 0.5 * (balance - amountTp1 - amountTp2 - amountTp3);
    },
    getamountTp5(balance, amountTp1, amountTp2, amountTp3, amountTp4) {
      return 0.5 * (balance - amountTp1 - amountTp2 - amountTp3 - amountTp4);
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
    afficherContenu(contenuLigne) {
      alert(contenuLigne);
      // Vous pouvez également effectuer d'autres actions avec le contenu de la ligne
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