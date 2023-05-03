<template>
  <div>
    <h1>Gestion des portefeuilles</h1>

    <h2>Ordres en cours</h2>
    <table>
      <thead>
        <tr>
          <th>Crypto</th>
          <th>Rank</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(order, index) in cryptoData" :key="index">
          <td>{{ order.name }}</td>
          <td>{{ order['cmc_rank']}}</td>
        </tr>
      </tbody>
    </table>

    <button @click="updateCmcData">Update Data</button>
    <ul v-if="cryptoData">
      <li v-for="crypto in cryptoData" :key="crypto.name">
        {{ crypto['cmc_rank'] }} - {{ crypto.name }}
      </li>
    </ul>

    <div>
      <button @click="updateBalance('binance')">Update Binance Balance</button>
      <ul v-if="binanceBalance">
        <li v-for="order in binanceBalance" :key="order.symbol">
          {{ order.symbol }} - {{ order.balance }} - {{ order.available }}
        </li>
      </ul>

      <button @click="updateBalance('kucoin')">Update Kucoin Balance</button>
      <ul v-if="kucoinBalance">
        <li v-for="order in kucoinBalance" :key="order.symbol">
          {{ order.symbol }} - {{ order.balance }} - {{ order.available }}
        </li>
      </ul>

      <button @click="updateBalance('huobi')">Update Huobi Balance</button>
      <ul v-if="huobiBalance">
        <li v-for="order in huobiBalance" :key="order.symbol">
          {{ order.symbol }} - {{ order.balance }} - {{ order.available }}
        </li>
      </ul>

      <button @click="updateBalance('okex')">Update Okex Balance</button>
      <ul v-if="okexBalance">
        <li v-for="order in okexBalance" :key="order.symbol">
          {{ order.symbol }} - {{ order.balance }} - {{ order.available }}
        </li>
      </ul>

      <button @click="updateBalance('gateio')">Update Gateio Balance</button>
      <ul v-if="gateioBalance">
        <li v-for="order in gateioBalance" :key="order.symbol">
          {{ order.symbol }} - {{ order.balance }} - {{ order.available }}
        </li>
      </ul>
    </div>

    <div>
      <button @click="updateActiveOrders('binance')">Update Binance Active Orders</button>
      <ul v-if="binanceActiveOrders">
        <li v-for="order in binanceActiveOrders" :key="order.symbol">
          {{ order.symbol }} - {{ order.balance }}
        </li>
      </ul>

      <button @click="updateActiveOrders('kucoin')">Update Kucoin Active Orders</button>
      <ul v-if="kucoinActiveOrders">
        <li v-for="order in kucoinActiveOrders" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }}
        </li>
      </ul>

      <button @click="updateActiveOrders('huobi')">Update Huobi Active Orders</button>
      <ul v-if="huobiActiveOrders">
        <li v-for="order in huobiActiveOrders" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }}
        </li>
      </ul>

      <button @click="updateActiveOrders('okex')">Update Okex Active Orders</button>
      <ul v-if="okexActiveOrders">
        <li v-for="order in okexActiveOrders" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }}
        </li>
      </ul>

      <button @click="updateActiveOrders('gateio')">Update Gateio Active Orders</button>
      <ul v-if="gateioActiveOrders">
        <li v-for="order in gateioActiveOrders" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }}
        </li>
      </ul>
    </div>

    <div>
      <button @click="updateLoadMarkets('binance')">Update Binance Load Market</button>
      <ul v-if="binanceLoadMarkets">
        <li v-for="order in binanceLoadMarkets" :key="order.symbol">
          {{ order.base }} - {{ order.quote }} - {{ order.amountMin }} - {{ order.priceMin }} - {{
            order.precisionAmount }} - {{ order.precisionPrice }}
        </li>
      </ul>

      <button @click="updateLoadMarkets('kucoin')">Update Kucoin Load Market</button>
      <ul v-if="kucoinLoadMarkets">
        <li v-for="order in kucoinLoadMarkets" :key="order.symbol">
          {{ order.base }} - {{ order.quote }} - {{ order.amountMin }} - {{ order.priceMin }} - {{
            order.precisionAmount }} - {{ order.precisionPrice }}
        </li>
      </ul>

      <button @click="updateLoadMarkets('huobi')">Update Huobi Load Market</button>
      <ul v-if="huobiLoadMarkets">
        <li v-for="order in huobiLoadMarkets" :key="order.symbol">
          {{ order.base }} - {{ order.quote }} - {{ order.amountMin }} - {{ order.priceMin }} - {{
            order.precisionAmount }} - {{ order.precisionPrice }}
        </li>
      </ul>

      <button @click="updateLoadMarkets('okex')">Update Okex Load Market</button>
      <ul v-if="okexLoadMarkets">
        <li v-for="order in okexLoadMarkets" :key="order.symbol">
          {{ order.base }} - {{ order.quote }} - {{ order.amountMin }} - {{ order.priceMin }} - {{
            order.precisionAmount }} - {{ order.precisionPrice }}
        </li>
      </ul>

      <button @click="updateLoadMarkets('gateio')">Update Gateio Load Market</button>
      <ul v-if="gateioLoadMarkets">
        <li v-for="order in gateioLoadMarkets" :key="order.symbol">
          {{ order.base }} - {{ order.quote }} - {{ order.amountMin }} - {{ order.priceMin }} - {{
            order.precisionAmount }} - {{ order.precisionPrice }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
const serverHost = "http://localhost:3000";

export default {
  name: "PortfolioManagementPage",
  data() {
    return {
      cryptoData: null,
      kucoinBalance: null,
      binanceBalance: null,
      huobiBalance: null,
      okexBalance: null,
      gateioBalance: null,

      kucoinActiveOrders: null,
      binanceActiveOrders: null,
      huobiActiveOrders: null,
      okexActiveOrders: null,
      gateioActiveOrders: null,

      kucoinLoadMarkets: null,
      binanceLoadMarkets: null,
      huobiLoadMarkets: null,
      okexLoadMarkets: null,
      gateioLoadMarkets: null
    };
  },
  methods: {
    async getCmcData() {
      try {
        const response = await fetch(serverHost + '/get/cmcData');
        const data = await response.json();
        this.cryptoData = data;
      } catch (err) {
        console.error(err);
      }
    },

    async updateCmcData() {
      try {
        const response = await fetch(serverHost + '/update/cmcData');
        const data = await response.json();
        this.cryptoData = data.data;
      } catch (err) {
        console.error(err);
      }
    },

    async updateBalance(exchange) {
      try {
        const response = await fetch(`${serverHost}/update/balance/${exchange}`);
        const data = await response.json();
        this[`${exchange}Balance`] = data.balance;
      } catch (err) {
        console.error(err);
      }
    },

    async updateActiveOrders(exchange) {
      try {
        const response = await fetch(`${serverHost}/update/activeOrders/${exchange}`);
        const data = await response.json();
        this[`${exchange}ActiveOrders`] = data;
      } catch (err) {
        console.error(err);
      }
    },

    async updateLoadMarkets(exchange) {
      try {
        const response = await fetch(`${serverHost}/update/loadMarkets/${exchange}`);
        const data = await response.json();
        this[`${exchange}LoadMarkets`] = data;
      } catch (err) {
        console.error(err);
      }
    }
  },
  mounted() {
    this.cryptoData;
    this.getCmcData();
  }
};
</script>
