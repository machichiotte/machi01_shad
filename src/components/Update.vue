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
      <button v-for="exchangeId in exchangeIds" :key="exchangeId" @click="updateExchangeData(exchangeId)">
        Update All {{ exchangeId.toUpperCase() }}
      </button>
    </div>
  </div>
</template>

<script>
const serverHost = process.env.VUE_APP_SERVER_HOST;
const UPD_BALANCE_ENDPOINT = `${serverHost}/balance/update/`;
const ORDERS_ENDPOINT = `${serverHost}/orders/update/`;
const CMC_DATA_ENDPOINT = `${serverHost}/cmc/update/`;

import { loadingSpin, successSpinHtml, errorSpin } from '../js/spinner.js';
import { saveOrdersDataToIndexedDB, saveBalancesDataToIndexedDB, saveCmcDataToIndexedDB } from '../js/indexedDB';

export default {
  name: "UpdatePage",

  data() {
    return {
      cryptoData: null,
      exchangeIds: ['binance', 'kucoin', 'huobi', 'okex', 'gateio'],
    };
  },
  methods: {
    async fetchAndUpdateCoinMarketCapData() {
      try {
        loadingSpin();
        const { data, totalCount } = await this.fetchData(CMC_DATA_ENDPOINT);
        this.cryptoData = data;
        await saveCmcDataToIndexedDB(data);
        successSpinHtml('Save completed', `Résultat : ${totalCount}`, true, true);
      } catch (error) {
        this.handleError('Error fetching and updating CoinMarketCap data:', error);
      }
    },

    async updateAllExchangeTrades() {
      for (const exchangeId of this.exchangeIds) {
        await this.updateExchangeData(exchangeId);
      }
    },

    async updateExchangeData(exchangeId) {
      try {
        loadingSpin();
        const [balance_data, orders_data] = await Promise.all([
          this.fetchData(`${UPD_BALANCE_ENDPOINT}${exchangeId}`),
          this.fetchData(`${ORDERS_ENDPOINT}${exchangeId}`),
        ]);

        await Promise.all([
          saveBalancesDataToIndexedDB(balance_data, exchangeId),
          saveOrdersDataToIndexedDB(orders_data, exchangeId),
        ]);

        this.showUpdateResult(exchangeId, balance_data, orders_data);
      } catch (error) {
        this.handleError(`Error updating ${exchangeId}:`, error);
      }
    },

    async fetchData(url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      return response.json();
    },

    showUpdateResult(exchangeId, balance_data, orders_data) {
      const resultText = `
        <b>${exchangeId.toUpperCase()}</b><br>
        <b>Balance :</b> ${balance_data.length} assets<br>
        <b>Orders :</b> ${orders_data.length} ordres<br>
      `;
      successSpinHtml('Save completed', resultText, true, true);
    },

    handleError(message, error) {
      console.error(message, error);
      errorSpin('Error', `Failed to fetch and update data. ${error.message}`, false, true);
    },
  },
};
</script>