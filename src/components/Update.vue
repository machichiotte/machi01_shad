<template>
  <div>
    <h1>Mise à jour des données</h1>
    <h2>Possibilité de mise à jour</h2>
    <Button @click="fetchAndUpdateCoinMarketCapData" style="font-size: 18px; margin: 4px">Maj cmc</Button>
    <ul v-if="cryptoData">
      <li v-for="crypto in cryptoData" :key="crypto.name">
        {{ crypto["cmc_rank"] }} - {{ crypto.name }}
      </li>
    </ul>
    <Button @click="updateAll()" style="font-size: 18px; margin: 4px">Maj exchanges</Button>
    <div v-for="exchangeId in exchangeIds" :key="exchangeId" style="margin-bottom: 10px;">
      <ToggleButton :id="exchangeId" v-model="selectedExchanges[exchangeId]" :onLabel="exchangeId"
        :offLabel="exchangeId" />
    </div>
    <div>
      <ToggleButton id="balance" v-model="updateBalance" onLabel="Balance" offLabel="Balance" />
    </div>
    <div>
      <ToggleButton id="orders" v-model="updateOrders" onLabel="Orders" offLabel="Orders" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Importing necessary modules and functions
import {
  loadingSpin,
  successSpinHtml,
  errorSpinHtml,
  errorSpin,
} from "../js/spinner.js";
import {
  saveOrdersDataToIndexedDB,
  saveBalancesDataToIndexedDB,
  saveCmcToIndexedDB,
} from "../js/indexedDB";

// Define API endpoints
const serverHost = import.meta.env.VITE_SERVER_HOST;
const API_ENDPOINTS = {
  UPD_BALANCE: `${serverHost}/balance/update/`,
  ORDERS: `${serverHost}/orders/update/`,
  CMC_DATA: `${serverHost}/cmc/update/`,
};

// Define reactive data
const cryptoData = ref();
const exchangeIds = ref(["binance", "kucoin", "htx", "okx", "gateio"]);
const selectedExchanges = ref({});
const updateBalance = ref(true);
const updateOrders = ref(true);

// Initialize selectedExchanges object with default values
exchangeIds.value.forEach(exchangeId => {
  selectedExchanges.value[exchangeId] = false;
});

// Define methods
async function fetchAndUpdateCoinMarketCapData() {
  try {
    loadingSpin();
    const response = await fetch(API_ENDPOINTS.CMC_DATA)
    const data = await response.json();

    const totalCount = data.totalCount;

    cryptoData.value = data.data;

    await saveCmcToIndexedDB(response);

    successSpinHtml(
      "Mise a jour terminee",
      `Résultat : ${totalCount}`,
      true,
      true
    );
  } catch (error) {
    handleError(
      "Error fetching and updating CoinMarketCap data:",
      error
    );
  }
}

async function updateExchangeData(exchangeId) {
  try {
    loadingSpin();
    let result = '';

    let balanceCount = 0;
    let ordersCount = 0;

    if (updateBalance.value || updateOrders.value) {
      result += `${exchangeId.toUpperCase()} : `;
    }

    if (updateBalance.value) {
      const balance_data_response = await fetch(`${API_ENDPOINTS.UPD_BALANCE}${exchangeId}`);
      if (balance_data_response.ok) {
        console.log('okokok');
        const balance_data = await balance_data_response.json();

        saveBalancesDataToIndexedDB(balance_data.data, exchangeId);

        console.log('saveBalancesDataToIndexedDB');

        balanceCount = balance_data.data.length;

        result += `${balanceCount} assets. `;
      }
    }

    if (updateOrders.value) {
      const orders_data_response = await fetch(`${API_ENDPOINTS.ORDERS}${exchangeId}`);
      if (orders_data_response.ok) {
        const orders_data = await orders_data_response.json();
        console.log('orders_data', orders_data)

        saveOrdersDataToIndexedDB(orders_data, exchangeId);
        ordersCount = orders_data.length;

        result += `${ordersCount} ordres ouverts. `;
      }
    }

    if (result !== '') {
      return result;
    } else {
      throw new Error(`No data updated for ${exchangeId.toUpperCase()}`);
    }
  } catch (error) {
    throw new Error(`Error updating ${exchangeId}: ${error.message}`);
  }
}

async function updateAll() {
  try {
    const promises = Object.keys(selectedExchanges.value)
      .filter(exchangeId => selectedExchanges.value[exchangeId])
      .map(exchangeId => updateExchangeData(exchangeId));

    const results = await Promise.all(promises);
    const finalResult = results.join('<br>');
    showUpdateResult(finalResult);
  } catch (error) {
    handleError('Error updating exchanges:', error);
  }
}


function showUpdateResult(finalResult) {
  successSpinHtml(
    "Sauvegarde terminée",
    finalResult,
    true,
    true
  );
}

function handleError(message, error) {
  console.error(message, error);
  errorSpin(
    "Error",
    `Failed to fetch and update data. ${error.message}`,
    false,
    true
  );
}
</script>
