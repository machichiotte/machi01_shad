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
const GET_BALANCE_ENDPOINT = `${serverHost}/get/balance`;
const UPD_BALANCE_ENDPOINT = `${serverHost}/update/balance/`;
const CMC_DATA_ENDPOINT = `${serverHost}/update/cmcData`;

import { loadingSpin, successSpin, successSpinHtml, errorSpin } from '../js/spinner.js'
//let lastUpdateTimestamp = 0;

export default {
  name: "UpdatePage",

  data() {
    return {
      cryptoData: null,

      kucoinTrades: null,
      binanceTrades: null,
      huobiTrades: null,
      okexTrades: null,
      gateioTrades: null
    };
  },
  methods: {
    async updateExchangeData(exchangeId) {
      loadingSpin();

      let resultText = `<b>${exchangeId.toUpperCase()}</b><br>`;


      const balance = await this.fetchAndUpdateBalance(exchangeId);
      const balance_data = await balance.json();

      // Vérifier si les éléments de la balance actuelle correspondent à ceux de la balance précédente
      //const previousBalance = await this.fetchPreviousBalanceByExchange(exchangeId);
      //const modifiedAssets = this.findModifiedAssets(previousBalance, balance_data);
      // TODO si et seulement si modifiedAssets nest pas nul, alors on doit rechercher les trades des assets concernes, sur l'exchangeId uniquement. via ccxt
      // TODO faire fonction qui recherche via ccxt les trades de chaque asset de lexchangeId presents dans modifiedAssets. Certains exhcanges necessitent seulemnt lasset comme par exemple BTC, dadutre veulent la paire par exemple btc/usdt ou btc/eth.
      // TODO il faudra faire attention a bien gere lappel 


      const activeOrders = await this.fetchAndUpdateActiveOrders(exchangeId);
      const activeOrders_data = await activeOrders.json();
      //const activeOrders_data = await activeOrders;

      const loadMarkets = await this.fetchAndUpdateExchangeMarkets(exchangeId);
      const loadMarkets_data = await loadMarkets.json();
      //const loadMarkets_data = await loadMarkets;

      if (balance.status === 200) {
        this[`${exchangeId}Balance`] = balance_data;
        resultText += `<b>Balance :</b> ${balance.status} - ${balance_data.length} assets<br>`;
      } else {
        resultText += `<b>Balance :</b> ${balance.status} - ${balance_data.error}<br>`;
      }

      if (activeOrders.status === 200) {
        this[`${exchangeId}ActiveOrders`] = activeOrders_data;
        resultText += `<b>ActiveOrders :</b> ${activeOrders.status} - ${activeOrders_data.length} ordres<br>`;
      } else {
        resultText += `<b>ActiveOrders :</b> ${activeOrders.status} - ${activeOrders_data.error}<br>`;
      }

      if (loadMarkets.status === 200) {
        this[`${exchangeId}LoadMarkets`] = loadMarkets_data;
        resultText += `<b>LoadMarkets :</b> ${loadMarkets.status} - ${loadMarkets_data.length} paires<br>`;
      } else {
        resultText += `<b>LoadMarkets :</b> ${loadMarkets.status} - ${loadMarkets_data.error}<br>`;
      }

      successSpinHtml('Save completed', resultText, true, true);
    },

    async fetchPreviousBalanceByExchange(exchangeId) {
      try {
        const response = await fetch(GET_BALANCE_ENDPOINT);
        const data = await response.json();
        return data.filter(item => item.platform === exchangeId);
      } catch (err) {
        console.error(err);
        return [];
      }
    },

    async fetchAndUpdateCoinMarketCapData() {
      loadingSpin();

      try {
        const response = await fetch(CMC_DATA_ENDPOINT);
        const data = await response.json();

        if (response.status === 200) {
          this.cryptoData = data.data;
          successSpin('Save completed', `Résultat : ${data.totalCount}`, true, true);
        } else {
          errorSpin('Error', `${data.error}`, false, true);
        }
      } catch (error) {
        console.error('Error fetching and updating CoinMarketCap data:', error);
        errorSpin('Error', 'Failed to fetch and update CoinMarketCap data.', false, true);
      }
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
    async fetchAndUpdateExchangeMarkets(exchangeId) {
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
    },

    async fetchAndUpdateActiveOrders(exchangeId) {
      try {
        console.log("Fetching active orders from:", `${serverHost}/update/activeOrders/${exchangeId}`);
        const response = await fetch(`${serverHost}/update/activeOrders/${exchangeId}`);

        if (!response.ok) {
          throw new Error(`Error fetching active orders: ${response.statusText}`);
        }
        return response;
      } catch (error) {
        console.error("Error fetching active orders:", error);
        throw error;
      }
    },

    //TODO complete trades part
    async updateAllExchangeTrades() {
      loadingSpin();

      const exchanges = ['binance', 'kucoin', 'huobi', 'okex', 'gateio'];
      const tradesData = [];
      const exchData = [];

      for (const exch of exchanges) {

        const result = await this.fetchAndUpdateTrades(exch);
        console.log(result);
        if (result.status === 200 && result.data && result.data.length > 0) {
          tradesData.push(...result.data);
        }
        exchData.push(`${exch} ${result.status} ${result.data ? result.data.length : 0}`);
        console.log(exch);
      }

      successSpin('Save completed', `Résultat : ${tradesData.length}`, true, true);
    },

    findModifiedAssets(previousBalance, currentBalance) {
      const modifiedAssets = [];

      // Comparer chaque asset de la balance actuelle avec la balance précédente pour l'exchange spécifié
      if (previousBalance && currentBalance) {

        currentBalance.forEach((currentAsset) => {
          const previousAsset = previousBalance.find((asset) => asset.symbol === currentAsset.symbol);
          if (!previousAsset || currentAsset.balance !== previousAsset.balance) {
            modifiedAssets.push(currentAsset.symbol);
          }
        });
      }

      return modifiedAssets;
    },

    async fetchAndUpdateTrades(exchangeId) {
      const response = await fetch(`${serverHost}/update/trades/${exchangeId}`);
      const data = await response.json();

      return {
        exchangeId,
        status: response.status,
        data: response.status === 200 ? data : null,
      };
    },

  }
}
</script>
