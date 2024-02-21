<!-- src/components/Update.vue -->

<template>
  <div>
    <h1>Mise à jour des données</h1>
    <h2>Possibilité de mise à jour</h2>
    <Button
      @click="fetchAndUpdateCoinMarketCapData"
      style="font-size: 18px; margin: 4px"
      >Update Data</Button
    >
    <ul v-if="cryptoData">
      <li v-for="crypto in cryptoData" :key="crypto.name">
        {{ crypto["cmc_rank"] }} - {{ crypto.name }}
      </li>
    </ul>
    <Button
      @click="updateAllExchangeTrades()"
      style="font-size: 18px; margin: 4px"
      >Update All Trades</Button
    >
    <div>
      <Button
        v-for="exchangeId in exchangeIds"
        :key="exchangeId"
        @click="updateExchangeData(exchangeId)"
        style="font-size: 18px; margin: 4px"
      >
        Update All {{ exchangeId.toUpperCase() }}
      </Button>
    </div>
  </div>
</template>

<script setup>
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
const cryptoData = ref(null);
const exchangeIds = ref(["binance", "kucoin", "htx", "okx", "gateio"]);

// Define methods
async function fetchAndUpdateCoinMarketCapData() {
  try {
    loadingSpin();
    const { data, totalCount } = (
      await fetchData(API_ENDPOINTS.CMC_DATA)
    ).json();
    cryptoData.value = data;
    await saveCmcToIndexedDB(data);
    successSpinHtml(
      "Save completed",
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

async function updateAllExchangeTrades() {
  for (const exchangeId of exchangeIds.value) {
    await updateExchangeData(exchangeId);
  }
}

async function updateExchangeData(exchangeId) {
  try {
    loadingSpin();
    const [balance_data_response, orders_data_response] = await Promise.all(
      [
        fetchData(`${API_ENDPOINTS.UPD_BALANCE}${exchangeId}`),
        fetchData(`${API_ENDPOINTS.ORDERS}${exchangeId}`),
      ]
    );

    const balance_data = await balance_data_response.json();
    const orders_data = await orders_data_response.json();

    if (balance_data_response.ok) {
      saveBalancesDataToIndexedDB(balance_data, exchangeId);
    }

    if (orders_data_response.ok) {
      saveOrdersDataToIndexedDB(orders_data, exchangeId);
    }

    if (balance_data_response.ok && orders_data_response.ok) {
      showUpdateResult(exchangeId, balance_data, orders_data);
    } else if (balance_data_response.ok) {
      showUpdateResultWithError(
        exchangeId,
        true,
        balance_data,
        orders_data
      );
    } else if (orders_data_response.ok) {
      showUpdateResultWithError(
        exchangeId,
        false,
        orders_data,
        balance_data
      );
    } else {
      showUpdateError(exchangeId, orders_data, balance_data);
    }
  } catch (error) {
    handleError(`Error updating ${exchangeId}:`, error);
  }
}

async function fetchData(url) {
  const response = await fetch(url);
  return response;
}

function showUpdateResult(exchangeId, balance_data, orders_data) {
  const resultText = `
    <b>${exchangeId.toUpperCase()}</b><br>
    <b>Solde :</b> ${balance_data.length} actifs<br>
    <b>Ordres :</b> ${orders_data.length} ordres<br>
  `;
  successSpinHtml("Sauvegarde terminée", resultText, true, true);
}

function showUpdateError(exchangeId, balance_data, orders_data) {
  const balanceErrorMessage = balance_data.error || "Unknown error";
  const ordersErrorMessage = orders_data.error || "Unknown error";

  const resultText = `
    <b>${exchangeId.toUpperCase()}</b><br>
    <b>Solde :</b> ${balanceErrorMessage} <br>
    <b>Ordres :</b> ${ordersErrorMessage} <br>
  `;
  errorSpinHtml("Échec de la sauvegarde", resultText, true, true);
}

function showUpdateResultWithError(exchangeId, isBalanceOk, good_data, bad_data) {
  const badDataErrorMessage = bad_data.error || "Unknown error";

  const okValue = isBalanceOk
    ? `<b>Solde :</b> ${good_data.length} actifs`
    : `<b>Ordres :</b> ${good_data.length} ordres`;
  const nokValue = isBalanceOk
    ? `<b>Ordres :</b> ${badDataErrorMessage}`
    : `<b>Solde :</b> ${badDataErrorMessage}`;

  const resultText = `
    <b>${exchangeId.toUpperCase()}</b><br>
    ${okValue}<br>
    ${nokValue}<br>
  `;
  errorSpin("Sauvegarde partiellement terminée", resultText, true, true);
}

function handleHttpResponseError(message, response) {
  console.error(message, response.status, response.statusText);
  // Other actions to perform on HTTP error
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
