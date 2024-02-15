<!-- src/components/Update.vue -->
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
import {
  loadingSpin,
  successSpinHtml,
  errorSpinHtml,
  errorSpin
} from '../js/spinner.js';
import {
  saveOrdersDataToIndexedDB,
  saveBalancesDataToIndexedDB,
  saveCmcToIndexedDB
} from '../js/indexedDB';

const serverHost = import.meta.env.VITE_SERVER_HOST;
const API_ENDPOINTS = {
  UPD_BALANCE: `${serverHost}/balance/update/`,
  ORDERS: `${serverHost}/orders/update/`,
  CMC_DATA: `${serverHost}/cmc/update/`
};

export default {
  name: "UpdatePage",

  data() {
    return {
      cryptoData: null,
      exchangeIds: ['binance', 'kucoin', 'htx', 'okx', 'gateio'],
    };
  },
  methods: {
    async fetchAndUpdateCoinMarketCapData() {
      try {
        loadingSpin();
        const {
          data,
          totalCount
        } = (await this.fetchData(API_ENDPOINTS.CMC_DATA)).json();
        this.cryptoData = data;
        await saveCmcToIndexedDB(data);
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
        const [balance_data_response, orders_data_response] = await Promise.all([
          this.fetchData(`${API_ENDPOINTS.UPD_BALANCE}${exchangeId}`),
          this.fetchData(`${API_ENDPOINTS.ORDERS}${exchangeId}`),
        ]);

        const balance_data = await balance_data_response.json();
        const orders_data = await orders_data_response.json();

        if (balance_data_response.ok) {
          saveBalancesDataToIndexedDB(balance_data, exchangeId);
        }

        if (orders_data_response.ok) {
          saveOrdersDataToIndexedDB(orders_data, exchangeId);
        }

        if (balance_data_response.ok && orders_data_response.ok) {
          this.showUpdateResult(exchangeId, balance_data, orders_data);
        } else if (balance_data_response.ok) {
          this.showUpdateResultWithError(exchangeId, true, balance_data, orders_data);
        } else if (orders_data_response.ok) {
          this.showUpdateResultWithError(exchangeId, false, orders_data, balance_data);
        } else {
          this.showUpdateError(exchangeId, orders_data, balance_data);
        }

      } catch (error) {
        this.handleError(`Error updating ${exchangeId}:`, error);
      }
    },

    async fetchData(url) {
      const response = await fetch(url);
      return response;
    },

    showUpdateResult(exchangeId, balance_data, orders_data) {
      const resultText = `
        <b>${exchangeId.toUpperCase()}</b><br>
        <b>Solde :</b> ${balance_data.length} actifs<br>
        <b>Ordres :</b> ${orders_data.length} ordres<br>
      `;
      successSpinHtml('Sauvegarde terminée', resultText, true, true);
    },

    showUpdateError(exchangeId, balance_data, orders_data) {
      const balanceErrorMessage = balance_data.error || 'Unknown error';
      const ordersErrorMessage = orders_data.error || 'Unknown error';

      const resultText = `
    <b>${exchangeId.toUpperCase()}</b><br>
    <b>Solde :</b> ${balanceErrorMessage} <br>
    <b>Ordres :</b> ${ordersErrorMessage} <br>
  `;
      errorSpinHtml('Échec de la sauvegarde', resultText, true, true);
    },

    showUpdateResultWithError(exchangeId, isBalanceOk, good_data, bad_data) {
      const badDataErrorMessage = bad_data.error || 'Unknown error';

      const okValue = isBalanceOk ? `<b>Solde :</b> ${good_data.length} actifs` : `<b>Ordres :</b> ${good_data.length} ordres`;
      const nokValue = isBalanceOk ? `<b>Ordres :</b> ${badDataErrorMessage}` : `<b>Solde :</b> ${badDataErrorMessage}`;

      const resultText = `
        <b>${exchangeId.toUpperCase()}</b><br>
        ${okValue}<br>
        ${nokValue}<br>
      `;
      errorSpin('Sauvegarde partiellement terminée', resultText, true, true);
    },

    handleHttpResponseError(message, response) {
      console.error(message, response.status, response.statusText);
      // Other actions to perform on HTTP error
    },

    handleError(message, error) {
      console.error(message, error);
      errorSpin('Error', `Failed to fetch and update data. ${error.message}`, false, true);
    },
  },
};
</script>
