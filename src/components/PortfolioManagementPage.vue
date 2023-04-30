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
    /* return {
       exchanges: [
         {
           name: "Binance",
           platforms: [
             {
               name: "Spot",
               wallets: [
                 {
                   name: "BTC",
                   address: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                   balance: 1.2345,
                 },
                 {
                   name: "ETH",
                   address: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                   balance: 23.4567,
                 },
               ],
             },
             {
               name: "Margin",
               wallets: [
                 {
                   name: "BTC",
                   address: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                   balance: 0.1234,
                 },
               ],
             },
           ],
         },
         {
           name: "Kraken",
           platforms: [
             {
               name: "Spot",
               wallets: [
                 {
                   name: "BTC",
                   address: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                   balance: 3.4567,
                 },
                 {
                   name: "ETH",
                   address: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                   balance: 45.6789,
                 },
               ],
             },
           ],
         },
       ],
     };*/

    return {
      cryptoData: []
    };

  },
  methods: {
    
    async getCmcData() {
      try {
        const response = await fetch(serverHost + '/cmc-data');
        console.error(response);

        const data = await response.json();
        console.error(data);

        this.cryptoData = data.data;
        console.error(this.cryptoData);

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
  },
};
</script>
