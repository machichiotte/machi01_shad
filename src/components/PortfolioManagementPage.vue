<template>
  <div>
    <h1>Gestion des portefeuilles</h1>

    <button @click="getCmcData">Get Data</button>
    <ul v-if="cryptoData">
      <li v-for="crypto in cryptoData" :key="crypto.name">
        {{ crypto.name }} - {{ crypto.price }}
      </li>
    </ul>

    <div>
      <button @click="getBalance('binance')">Get Binance Balance</button>
      <ul v-if="binanceBalance">
        <li v-for="order in binanceBalance" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }} - {{ order.available }}
        </li>
      </ul>

      <button @click="getBalance('kucoin')">Get Kucoin Balance</button>
      <ul v-if="kucoinBalance">
        <li v-for="order in kucoinBalance" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }} - {{ order.available }}
        </li>
      </ul>

      <button @click="getBalance('huobi')">Get Huobi Balance</button>
      <ul v-if="huobiBalance">
        <li v-for="order in huobiBalance" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }} - {{ order.available }}
        </li>
      </ul>

      <button @click="getBalance('okex')">Get Okex Balance</button>
      <ul v-if="okexBalance">
        <li v-for="order in okexBalance" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }} - {{ order.available }}
        </li>
      </ul>

      <button @click="getBalance('gateio')">Get Gateio Balance</button>
      <ul v-if="gateioBalance">
        <li v-for="order in gateioBalance" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }} - {{ order.available }}
        </li>
      </ul>
    </div>

    <div>
      <button @click="getActiveOrders('binance')">Get Binance Active Orders</button>
      <ul v-if="binanceActiveOrders">
        <li v-for="order in binanceActiveOrders" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }} - {{ order.available }}
        </li>
      </ul>

      <button @click="getActiveOrders('kucoin')">Get Kucoin Active Orders</button>
      <ul v-if="kucoinActiveOrders">
        <li v-for="order in kucoinActiveOrders" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }} - {{ order.available }}
        </li>
      </ul>

      <button @click="getActiveOrders('huobi')">Get Huobi Active Orders</button>
      <ul v-if="huobiActiveOrders">
        <li v-for="order in huobiActiveOrders" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }} - {{ order.available }}
        </li>
      </ul>

      <button @click="getActiveOrders('okex')">Get Okex Active Orders</button>
      <ul v-if="okexActiveOrders">
        <li v-for="order in okexActiveOrders" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }} - {{ order.available }}
        </li>
      </ul>

      <button @click="getActiveOrders('gateio')">Get Gateio Active Orders</button>
      <ul v-if="gateioActiveOrders">
        <li v-for="order in gateioActiveOrders" :key="order.symbol">
          {{ order.balance }} - {{ order.symbol }} - {{ order.available }}
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
      gateioBalance: null
    };
  },
  methods: {
    async getCmcData() {
      try {
        const response = await fetch(serverHost + '/cmc-data');
        const data = await response.json();
        this.cryptoData = data.data;
      } catch (err) {
        console.error(err);
      }
    },

    async getBalance(exchange) {
      try {
        const response = await fetch(`${serverHost}/balance/${exchange}`);
        const data = await response.json();
        this[`${exchange}Balance`] = data.balance;
      } catch (err) {
        console.error(err);
      }
    },

    async getActiveOrders(exchange) {
      try {
        const response = await fetch(`${serverHost}/activeOrders/${exchange}`);
        const data = await response.json();

        //TODO change it
        this[`${exchange}ActiveOrders`] = data.balance;
      } catch (err) {
        console.error(err);
      }
    }
  }
};
</script>
