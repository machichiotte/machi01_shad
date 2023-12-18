<template>
  <div>
    <h1>Mise à jour des données</h1>

    <h2>Possibilité de mise à jour</h2>

    <button @click="fetchAndUpdateCoinMarketCapData">Update Data</button>
    <ul v-if="cryptoData">
      <li v-for="crypto in cryptoData" :key="crypto.name">
        {{ crypto['cmc_rank'] }} - {{ crypto.name }}
      </li>
    </ul>

    <button @click="updateAllExchangeTrades()">Update All Trades</button>

    <div>
      <button @click="updateExchangeData('binance')">Update All Binance</button>
      <button @click="updateExchangeData('kucoin')">Update All Kucoin</button>
      <button @click="updateExchangeData('huobi')">Update All Huobi</button>
      <button @click="updateExchangeData('okex')">Update All Okex</button>
      <button @click="updateExchangeData('gateio')">Update All Gate IO</button>
    </div>

  </div>
</template>

<script>
const serverHost = process.env.VUE_APP_SERVER_HOST;
const UPD_BALANCE_ENDPOINT = `${serverHost}/update/balance/`;
const ORDERS_ENDPOINT = `${serverHost}/update/orders/`;
const CMC_DATA_ENDPOINT = `${serverHost}/update/cmcData`;

import { loadingSpin, successSpin, successSpinHtml, errorSpin } from '../js/spinner.js';
import { saveOrdersDataToIndexedDB, saveBalancesDataToIndexedDB, saveCmcDataToIndexedDB } from '../js/indexedDB';

export default {
  name: "UpdatePage",

  data() {
    return {
      cryptoData: null,
    };
  },
  methods: {
    async fetchAndUpdateCoinMarketCapData() {
      loadingSpin();

      try {
        const response = await fetch(CMC_DATA_ENDPOINT);
        const data = await response.json();

        if (response.status === 200) {
          this.cryptoData = data.data;

          // Enregistrez les données dans IndexedDB
          await saveCmcDataToIndexedDB(this.cryptoData);

          successSpin('Save completed', `Résultat : ${data.totalCount}`, true, true);
        } else {
          errorSpin('Error', `${data.error}`, false, true);
        }
      } catch (error) {
        console.error('Error fetching and updating CoinMarketCap data:', error);
        errorSpin('Error', 'Failed to fetch and update CoinMarketCap data.', false, true);
      }
    },

    async updateExchangeData(exchangeId) {
      loadingSpin();

      let resultText = `<b>${exchangeId.toUpperCase()}</b><br>`;

      const balance = await this.fetchAndUpdateBalance(exchangeId);
      const balance_data = await balance.json();
      console.log('bal data', balance_data)
      await saveBalancesDataToIndexedDB(balance_data, exchangeId);

      const orders = await this.fetchAndUpdateOrders(exchangeId);
      const orders_data = await orders.json();
      await saveOrdersDataToIndexedDB(orders_data, exchangeId);

      //const loadMarkets = await this.fetchAndUpdateExchangeMarkets(exchangeId);
      //const loadMarkets_data = await loadMarkets.json();
      //await saveDataToIndexedDB(`${exchangeId}LoadMarkets`, loadMarkets_data);

      if (balance.status === 200) {
        this[`${exchangeId}Balance`] = balance_data;
        resultText += `<b>Balance :</b> ${balance.status} - ${balance_data.length} assets<br>`;
      } else {
        resultText += `<b>Balance :</b> ${balance.status} - ${balance_data.error}<br>`;
      }

      if (orders.status === 200) {
        this[`${exchangeId}Orders`] = orders_data;
        resultText += `<b>Orders :</b> ${orders.status} - ${orders_data.length} ordres<br>`;
      } else {
        resultText += `<b>Orders :</b> ${orders.status} - ${orders_data.error}<br>`;
      }

      /*
      if (loadMarkets.status === 200) {
        this[`${exchangeId}LoadMarkets`] = loadMarkets_data;
        resultText += `<b>LoadMarkets :</b> ${loadMarkets.status} - ${loadMarkets_data.length} paires<br>`;
      } else {
        resultText += `<b>LoadMarkets :</b> ${loadMarkets.status} - ${loadMarkets_data.error}<br>`;
      }
      */

      successSpinHtml('Save completed', resultText, true, true);
    },
    async fetchAndUpdateBalance(exchangeId) {
      try {
        console.log("Fetching balance from:", `${UPD_BALANCE_ENDPOINT}${exchangeId}`);
        const response = await fetch(`${UPD_BALANCE_ENDPOINT}${exchangeId}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`Error fetching balance: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        console.error("Error fetching balance:", error.message);
        throw error;
      }
    },
    /*async fetchAndUpdateExchangeMarkets(exchangeId) {
      try {
        console.log("Fetching exchange markets from:", `${serverHost}/update/loadMarkets/${exchangeId}`);
        const response = await fetch(`${serverHost}/update/loadMarkets/${exchangeId}`);

        if (!response.ok) {
          throw new Error(`Error fetching exchange markets: ${response.statusText}`);
        }
        return response;
      } catch (error) {
        console.error("Error fetching exchange markets:", error);
        throw error;
      }
    },*/
    async fetchAndUpdateOrders(exchangeId) {
      try {
        console.log(`Fetching orders from: ${ORDERS_ENDPOINT}${exchangeId}`);
        const response = await fetch(`${ORDERS_ENDPOINT}${exchangeId}`);

        if (!response.ok) {
          throw new Error(`Error fetching orders: ${response.statusText}`);
        }
        return response;
      } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
    },

  }
}
</script>
