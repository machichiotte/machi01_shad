<template>
  <div class="admin-page">
    <h1>SHAD</h1>

    <div id="table">
      <v-grid theme="compact" :source="rows" :columns="columns" :filter="false" :pagination="paginationConfig">
        <template v-slot:item="{ item }">
          <tr :key="item.asset">
            <!-- Render columns using the key attribute -->
            <td v-for="column in columns" :key="column.name" @mousedown.prevent>
              <!-- Render individual cells using the key attribute -->
              <component :is="getComponentType(column)" :column="column" :model="item"
                @click="handleCellClick(column, item)" />
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
import VGrid, { VGridVueTemplate } from "@revolist/vue3-datagrid";
import { ref } from "vue";
import { bunchOrders, cancelAllOrders } from '../../orders.js';
import { getBalanceFromDB, getTradesFromDB, getStratsFromDB, getActiveOrdersFromDB, getCmcDataFromDB } from '../../fromDB.js';

import { getProfit, getRecupShad, getRecupTp1, getRecupTpX, getDoneShad, getPriceTp1, getAmountTp1, getTotalBuy, getTotalQuantity, getMaxWanted, getRatioShad, getTotalSell, getAverageEntryPrice, getCryptoRank, getCurrentPrice, getCryptoPercentChange, getPercentageDifference, getCurrentPossession, getPriceTp2, getPriceTp3, getPriceTp4, getPriceTp5, getAmountTp2, getAmountTp3, getAmountTp4, getAmountTp5 } from '../../calcul.js';


// ES6 Modules or TypeScript
import Swal from 'sweetalert2'

const mySellButton = {
  props: ["rowIndex", "model"],
  setup(props) {
    const countIndex = ref(0);

    const iAmClicked = async () => {

      // Afficher une alerte avec un spin initial
      Swal.fire({
        title: 'Traitement en cours',
        text: 'Veuillez patienter...',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          this.$swal.showLoading();
        }
      });

      props.model.count.value++;

      const asset = props.model.asset;
      const exchangeId = props.model.exchangeId;

      const cancel = await cancelAllOrders(exchangeId, asset);

      console.log('canc :: ' + cancel.status);
      let resultText = `Cancel : ${cancel.status}<br>`;

      if (cancel.status == 200) {
        console.log('canc IS 200');

        const amounts = [props.model.amountTp1, props.model.amountTp2, props.model.amountTp3, props.model.amountTp4, props.model.amountTp5];
        const prices = [props.model.priceTp1, props.model.priceTp2, props.model.priceTp3, props.model.priceTp4, props.model.priceTp5];

        let res = [];
        for (let i = 0; i < 5; i++) {
          res[i] = await bunchOrders(exchangeId, asset, amounts[i], prices[i]);
          resultText += `TP${i} : ${res[i].status}<br>`;
        }

        // Update the content of the alert with the result
        Swal.fire({
          title: 'Save completed',
          html: resultText,
          icon: 'success',
          allowOutsideClick: true,
          showConfirmButton: true
        });

      } else {
        // Show an error alert within the existing alert
        Swal.fire({
          title: 'Error',
          text: `Cancel order : ${cancel.error}`,
          icon: 'error',
          allowOutsideClick: false,
          showConfirmButton: true
        });
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
        pageSize: 500,
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

        this.ranks[index] = getCryptoRank(this.assets[index], this.cmcData);
        this.totalSells[index] = getTotalSell(this.assets[index], this.trades);
        this.currentPrices[index] = getCurrentPrice(this.assets[index], this.cmcData);
        this.averageEntryPrices[index] = getAverageEntryPrice(this.assets[index], this.trades);
        this.openBuyOrderss[index] = this.openBuyOrders[this.assets[index]] || 0;
        this.openSellOrderss[index] = this.openSellOrders[this.assets[index]] || 0;

        this.ratioShads[index] = getRatioShad(this.assets[index], this.exchangeIds[index], this.strats);
        this.totalBuys[index] = getTotalBuy(this.assets[index], this.exchangeIds[index], this.trades);
        this.totalQuantitys[index] = getTotalQuantity(this.assets[index], this.exchangeIds[index], this.trades);

        this.cryptoPercentChange24hs[index] = getCryptoPercentChange(this.assets[index], '24h', this.cmcData);
        this.cryptoPercentChange7ds[index] = getCryptoPercentChange(this.assets[index], '7d', this.cmcData);
        this.cryptoPercentChange30ds[index] = getCryptoPercentChange(this.assets[index], '30d', this.cmcData);
        this.cryptoPercentChange60ds[index] = getCryptoPercentChange(this.assets[index], '60d', this.cmcData);
        this.cryptoPercentChange90ds[index] = getCryptoPercentChange(this.assets[index], '90d', this.cmcData);

        this.maxWanteds[index] = getMaxWanted(this.ranks[index], this.totalBuys[index]);
        this.recupShads[index] = getRecupShad(this.totalBuys[index], this.totalSells[index], this.maxWanteds[index]);
        this.percentageDifferences[index] = getPercentageDifference(this.currentPrices[index], this.averageEntryPrices[index]);
        this.currentPossessions[index] = getCurrentPossession(this.currentPrices[index], this.bals[index]);
        this.profits[index] = getProfit(this.totalBuys[index], this.totalSells[index], this.currentPrices[index], this.bals[index]);
        this.recupTpXs[index] = getRecupTpX(this.maxWanteds[index], this.ratioShads[index]);
        this.totalShads[index] = getDoneShad(this.totalBuys[index], this.totalSells[index], this.maxWanteds[index], this.recupShads[index], this.recupTpXs[index]);
        this.recupTp1s[index] = getRecupTp1(this.totalBuys[index], this.totalSells[index], this.maxWanteds[index], this.recupShads[index], this.recupTpXs[index], this.totalShads[index]);

        this.amountTp1s[index] = getAmountTp1(this.recupTp1s[index], this.averageEntryPrices[index], this.bals[index], this.totalBuys[index], this.totalSells[index], this.totalShads[index]);
        this.amountTp2s[index] = getAmountTp2(this.bals[index], this.amountTp1s[index]);
        this.amountTp3s[index] = getAmountTp3(this.bals[index], this.amountTp1s[index], this.amountTp2s[index]);
        this.amountTp4s[index] = getAmountTp4(this.bals[index], this.amountTp1s[index], this.amountTp2s[index], this.amountTp3s[index]);
        this.amountTp5s[index] = getAmountTp5(this.bals[index], this.amountTp1s[index], this.amountTp2s[index], this.amountTp3s[index], this.amountTp4s[index]);

        this.priceTp1s[index] = getPriceTp1(this.recupTp1s[index], this.amountTp1s[index]);
        this.priceTp2s[index] = getPriceTp2(this.recupTpXs[index], this.amountTp2s[index]);
        this.priceTp3s[index] = getPriceTp3(this.recupTpXs[index], this.amountTp3s[index]);
        this.priceTp4s[index] = getPriceTp4(this.recupTpXs[index], this.amountTp4s[index]);
        this.priceTp5s[index] = getPriceTp5(this.recupTpXs[index], this.amountTp5s[index]);

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
    handleCellClick(column, item) {
      console.log(column);
      console.log(item);
      if (column.name === this.columns[0].name) {
        // Logique à exécuter lorsque la première colonne est cliquée
        // Vous pouvez remplacer cette logique par ce que vous souhaitez faire avec le clic sur l'élément
        console.log("Clic sur l'élément :", item[column.name]);
      }
    },
    getComponentType(column) {
      if (column.cellTemplate) {
        return VGridVueTemplate(mySellButton);
      }
      return 'span';
    },

    async getDataFromDB() {
      this.balances = await getBalanceFromDB();
      this.trades = await getTradesFromDB();
      this.strats = await getStratsFromDB();

      this.cmcData = await getCmcDataFromDB();

      const { data, openBuyOrders, openSellOrders } = await getActiveOrdersFromDB();
      this.activeOrders = data;
      this.openBuyOrders = openBuyOrders;
      this.openSellOrders = openSellOrders;
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
    this.getDataFromDB();
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