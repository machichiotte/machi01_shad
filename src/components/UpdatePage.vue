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


    <button @click="updateAllTrades()">Update All Trades</button>

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
const serverHost = "http://localhost:3000";
//let lastUpdateTimestamp = 0;

export default {
  name: "UpdatePage",
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
      gateioLoadMarkets: null,

      kucoinTrades: null,
      binanceTrades: null,
      huobiTrades: null,
      okexTrades: null,
      gateioTrades: null,
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

    async getBalance() {
      try {
        const response = await fetch(serverHost + '/get/balance');
        const data = await response.json();
        this.balance = data;
      } catch (err) {
        console.error(err);
      }
    },

    async updateCmcData() {
      // Afficher une alerte avec un spin initial
      this.$swal({
        title: 'Traitement en cours',
        text: 'Veuillez patienter...',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          this.$swal.showLoading();
        }
      });
      const response = await fetch(serverHost + '/update/cmcData');
      const data = await response.json();
      if (response.status === 200) {
        this.cryptoData = data.data;

        // Update the content of the alert with the result
        this.$swal({
          title: 'Save completed',
          text: `Résultat : ${data.totalCount}`,
          icon: 'success',
          allowOutsideClick: true,
          showConfirmButton: true
        });
      } else {
        // Show an error alert within the existing alert
        this.$swal({
          title: 'Error',
          text: `${data.error}`,
          icon: 'error',
          allowOutsideClick: false,
          showConfirmButton: true
        });
      }
    },

    async updateBalance(exchange) {
      // Afficher une alerte avec un spin initial
      this.$swal({
        title: 'Traitement en cours',
        text: 'Veuillez patienter...',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          this.$swal.showLoading();
        }
      });

      const response = await fetch(`${serverHost}/update/balance/${exchange}`);
      const data = await response.json();

      if (response.status === 200) {
        this[`${exchange}Balance`] = data.balance;
        // Update the content of the alert with the result
        this.$swal({
          title: 'Save completed',
          text: `Résultat : ${data.length}`,
          icon: 'success',
          allowOutsideClick: true,
          showConfirmButton: true
        });
      } else {
        // Show an error alert within the existing alert
        this.$swal({
          title: 'Error',
          text: `${data.error}`,
          icon: 'error',
          allowOutsideClick: false,
          showConfirmButton: true
        });
      }
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


    async updateAllTrades() {
      // Afficher une alerte avec un spin initial
      this.$swal({
        title: 'Traitement en cours',
        text: 'Veuillez patienter...',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          this.$swal.showLoading();
        }
      });


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

      // Update the content of the alert with the result
      this.$swal({
        title: 'Save completed',
        text: `Résultat : ${tradesData.length}`,
        icon: 'success',
        allowOutsideClick: true,
        showConfirmButton: true
      });
    },

    async updateTrades(exchange) {
      const response = await fetch(`${serverHost}/update/trades/${exchange}`);
      const data = await response.json();

      if (response.status === 200) {
        return { exchange, 'status': response.status, data };
      } else {
        return { exchange, 'status': response.status };
      }
    },

    async updateActiveOrders(exchange) {
      // Afficher une alerte avec un spin initial
      this.$swal({
        title: 'Traitement en cours',
        text: 'Veuillez patienter...',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          this.$swal.showLoading();
        }
      });

      const response = await fetch(`${serverHost}/update/activeOrders/${exchange}`);
      const data = await response.json();

      if (response.status === 200) {
        this[`${exchange}ActiveOrders`] = data;
        // Update the content of the alert with the result
        this.$swal({
          title: 'Save completed',
          text: `Résultat : ${data.length}`,
          icon: 'success',
          allowOutsideClick: true,
          showConfirmButton: true
        });
      } else {
        // Show an error alert within the existing alert
        this.$swal({
          title: 'Error',
          text: `${data.error}`,
          icon: 'error',
          allowOutsideClick: false,
          showConfirmButton: true
        });
      }
    },

    async updateLoadMarkets(exchangeId) {
      // Afficher une alerte avec un spin initial
      this.$swal({
        title: 'Traitement en cours',
        text: 'Veuillez patienter...',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          this.$swal.showLoading();
        }
      });

      const response = await fetch(`${serverHost}/update/loadMarkets/${exchangeId}`);
      const data = await response.json();

      if (response.status === 200) {

        this[`${exchangeId}LoadMarkets`] = data;
        // Update the content of the alert with the result
        this.$swal({
          title: 'Save completed',
          text: `Résultat : ${data.length}`,
          icon: 'success',
          allowOutsideClick: true,
          showConfirmButton: true
        });
      } else {
        // Show an error alert within the existing alert
        this.$swal({
          title: 'Error',
          text: `${data.error}`,
          icon: 'error',
          allowOutsideClick: false,
          showConfirmButton: true
        });
      }
    }
  }
}
</script>
