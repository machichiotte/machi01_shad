<template>
  <div>
    <h1>Gestion des portefeuilles</h1>

    <div>
      <button @click="getCmcData">Get Data</button>
      <ul>
        <li v-for="crypto in cryptoData" :key="crypto.id">
          {{ crypto.name }} - {{ crypto.price }}
        </li>
      </ul>

      <button @click="getKucoinBalance">Get Kucoin Balance</button>
      <ul>
        <li v-for="(balance, symbol, available) in kucoinBalance" :key="symbol">
          {{ balance }} - {{ symbol }} - {{ available }}
        </li>
      </ul>
      <button @click="getHuobiBalance">Get Huobi Balance</button>
      <ul>
        <li v-for="(balance, symbol, available) in huobiBalance" :key="symbol">
          {{ balance }} - {{ symbol }} - {{ available }}
        </li>
      </ul>
      <button @click="getOkexBalance">Get Okex Balance</button>
      <ul>
        <li v-for="(balance, symbol, available) in okexBalance" :key="symbol">
          {{ balance }} - {{ symbol }} - {{ available }}
        </li>
      </ul>
      <button @click="getGateioBalance">Get Gateio Balance</button>
      <ul>
        <li v-for="(balance, symbol, available) in gateioBalance" :key="symbol">
          {{ balance }} - {{ symbol }} - {{ available }}
        </li>
      </ul>
      <button @click="getBinanceBalance">Get Binance Balance</button>
      <ul>
        <li v-for="(balance, symbol, available) in binanceBalance" :key="symbol">
          {{ balance }} - {{ symbol }} - {{ available }}
        </li>
      </ul>
    </div>

    <!--<div v-for="(exchange, index) in exchanges" :key="index">
      <h2>{{ exchange.name }}</h2>
      <div v-for="(platform, platformIndex) in exchange.platforms" :key="platformIndex">
        <h3>{{ platform.name }}</h3>
        <div v-for="(wallet, walletIndex) in platform.wallets" :key="walletIndex">
          <h4>{{ wallet.name }}</h4>
          <div>{{ wallet.address }}</div>
          <div>{{ wallet.balance }}</div>
          <button @click="editWallet">Editer</button>
          <button @click="deleteWallet">Supprimer</button>
        </div>
        <button @click="addWallet">Ajouter un portefeuille</button>
      </div>
    </div>-->
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

    async getBinanceBalance() {
      try {
        const response = await fetch(serverHost + '/balance/binance');
        const data = await response.json();
        this.binanceBalance = data.balance;
      } catch (err) {
        console.error(err);
      }
    },
    async getKucoinBalance() {
      try {
        const response = await fetch(serverHost + '/balance/kucoin');
        const data = await response.json();
        this.kucoinBalance = data.balance;
      } catch (err) {
        console.error(err);
      }
    },
    async getHuobiBalance() {
      try {
        const response = await fetch(serverHost + '/balance/huobi');
        const data = await response.json();
        this.huobiBalance = data.balance;
      } catch (err) {
        console.error(err);
      }
    },
    async getOkexBalance() {
      try {
        const response = await fetch(serverHost + '/balance/okex');
        const data = await response.json();
        this.okexBalance = data.balance;
      } catch (err) {
        console.error(err);
      }
    },
    async getGateioBalance() {
      try {
        const response = await fetch(serverHost + '/balance/gateio');
        const data = await response.json();
        this.gateioBalance = data.balance;
      } catch (err) {
        console.error(err);
      }
    },

    editWallet() {
      // TODO: implementer la fonction pour editer un portefeuille
    },
    deleteWallet() {
      // TODO: implementer la fonction pour supprimer un portefeuille
    },
    addWallet() {
      // TODO: implementer la fonction pour ajouter un portefeuille
    },
  }, mounted() {
    /*this.getCmcData();
    this.getKucoinBalance();
    this.getHuobiBalance();
    this.getOkexBalance();
    this.getGateioBalance();*/
    //this.getBinanceBalance();
  },
};
</script>
