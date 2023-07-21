<template>
  <div>
    <h1>Mise à jour des données</h1>

    <h2>Possibilité de mise à jour</h2>

    <button @click="updateCmcData">Update Data</button>
    <ul v-if="cryptoData">
      <li v-for="crypto in cryptoData" :key="crypto.name">
        {{ crypto['cmc_rank'] }} - {{ crypto.name }}
      </li>
    </ul>

    <button @click="updateAllTrades()">Update All Trades</button>

    <div>
      <button @click="updateAllByExchange('binance')">Update All Binance</button>
      <button @click="updateAllByExchange('kucoin')">Update All Kucoin</button>
      <button @click="updateAllByExchange('huobi')">Update All Huobi</button>
      <button @click="updateAllByExchange('okex')">Update All Okex</button>
      <button @click="updateAllByExchange('gateio')">Update All Gate IO</button>
    </div>

    <!--<div>
      <button @click="updateAllTrades('binance')">Update Binance Trades</button>
      <ul v-if="binanceTrades">
        <li v-for="order in binanceTrades" :key="order.symbol">
          {{ order.symbol }} - {{ order.balance }}
        </li>
      </ul>

      <button @click="updateAllTrades('kucoin')">Update Kucoin Trades</button>
      <ul v-if="kucoinTrades">
        <li v-for="order in kucoinTrades" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }}
        </li>
      </ul>

      <button @click="updateAllTrades('huobi')">Update Huobi Trades</button>
      <ul v-if="huobiTrades">
        <li v-for="order in huobiTrades" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }}
        </li>
      </ul>

      <button @click="updateAllTrades('okex')">Update Okex Trades</button>
      <ul v-if="okexTrades">
        <li v-for="order in okexTrades" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }}
        </li>
      </ul>

      <button @click="updateAllTrades('gateio')">Update Gateio Trades</button>
      <ul v-if="gateioTrades">
        <li v-for="order in gateioTrades" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }}
        </li>
      </ul>
    </div> -->
  </div>
</template>

<script>
const serverHost = process.env.VUE_APP_SERVER_HOST;
import { loadingSpin, successSpin, successSpinHtml, errorSpin } from '../js/spinner.js'
//let lastUpdateTimestamp = 0;

export default {
  name: "UpdatePage",

  data() {
    return {
      cryptoData: null,
      binanceBalance: null,
      gateioBalance: null,

      binanceActiveOrders: null,
      gateioActiveOrders: null,

      binanceLoadMarkets: null,
      gateioLoadMarkets: null,

      kucoinTrades: null,
      binanceTrades: null,
      huobiTrades: null,
      okexTrades: null,
      gateioTrades: null,
    };
  },
  methods: {

    async getBalance() {
      try {
        const response = await fetch(`${serverHost}/get/balance`);
        const data = await response.json();
        this.balance = data;
      } catch (err) {
        console.error(err);
      }
    },

    async updateCmcData() {
      loadingSpin();

      const response = await fetch(`${serverHost}/update/cmcData`);
      const data = await response.json();

      if (response.status === 200) {
        this.cryptoData = data.data;
        successSpin('Save completed', `Résultat : ${data.totalCount}`, true, true);
      } else {
        errorSpin('Error', `${data.error}`, false, true);
      }
    },

    async updateAllByExchange(exchangeId) {
      loadingSpin();

      let resultText = `<b>${exchangeId.toUpperCase()}</b><br>`;

      const balance = await this.updateBalance(exchangeId);
      const activeOrders = await this.updateActiveOrders(exchangeId);
      const loadMarkets = await this.updateLoadMarkets(exchangeId);

      const balance_data = await balance.json();
      const activeOrders_data = await activeOrders.json();
      const loadMarkets_data = await loadMarkets.json();

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

    async updateBalance(exchangeId) {
      const response = await fetch(`${serverHost}/update/balance/${exchangeId}`);
      return response;
    },
    async updateLoadMarkets(exchangeId) {
      const response = await fetch(`${serverHost}/update/loadMarkets/${exchangeId}`);
      return response;
    },
    async updateActiveOrders(exchangeId) {
      const response = await fetch(`${serverHost}/update/activeOrders/${exchangeId}`);
      return response;
    },

    //TODO complete trades part
    async updateAllTrades() {
      loadingSpin();

      // const exchanges = ['binance', 'kucoin', 'huobi', 'okex', 'gateio'];
      const exchanges = ['huobi'];
      const tradesData = [];
      const exchData = [];

      for (const exch of exchanges) {

        const result = await this.updateTrades(exch);
        console.log(result);
        if (result.status === 200 && result.length > 0) {
          tradesData.push(...result.data);
        }
        exchData.push(exch + ' ' + result.status + ' ' + result.length);
        console.log(exch);
      }

      successSpin('Save completed', `Résultat : ${tradesData.length}`, true, true);
    },

    /*
    async updateAllTradesByAsset(exchange) {
      const ending = ['USDT', 'BUSD', 'BTC', 'ETH'];
      await this.getBalance();
      this.balance.forEach(async (item) => {
  
        if (item.platform === exchange) {
          const symbol = item.symbol;
          for (let i = 0; i < ending.length; i++) {
            const exchangeSymbol = this.getExchangeSymbol(exchange, symbol, ending[i]);
            try {
              const now = Date.now();
              const timeSinceLastUpdate = now - lastUpdateTimestamp;
              const minimumTimeBetweenUpdates = 1000 / (3600 / 60); // 1000ms / (1800 requests/60s) = 33.33ms
              if (timeSinceLastUpdate < minimumTimeBetweenUpdates) {
                console.log(`Delaying ${exchangeSymbol} update for ${minimumTimeBetweenUpdates - timeSinceLastUpdate}ms`);
                await new Promise(resolve => setTimeout(resolve, minimumTimeBetweenUpdates - timeSinceLastUpdate));
              }
              await this.updateTrades(exchange, exchangeSymbol);
              lastUpdateTimestamp = now;
            } catch (err) {
              console.error(err);
            }
          }
        }
      });
    },
    */

    async updateTrades(exchange) {
      const response = await fetch(`${serverHost}/update/trades/${exchange}`);
      const data = await response.json();

      if (response.status === 200) {
        return { exchange, 'status': response.status, data };
      } else {
        return { exchange, 'status': response.status };
      }
    },

  }
}
</script>
