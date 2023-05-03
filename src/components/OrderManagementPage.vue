<template>
  <div>
    <h1>Gestion des ordres</h1>
    <h2>Ordres en cours</h2>
    <table>
      <thead>
        <tr>
          <th>OrderId</th>
          <th>ClientId</th>
          <th>Exchange</th>
          <th>Pair de trading</th>
          <th>Type d'ordre</th>
          <th>Side</th>
          <th>Quantité</th>
          <th>Prix</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(order, index) in activeOrders" :key="index">
          <td>{{ order.oId }}</td>
          <td>{{ order.cId }}</td>
          <td>{{ order.platform }}</td>
          <td>{{ order.symbol }}</td>
          <td>{{ order.type }}</td>
          <td>{{ order.side }}</td>
          <td>{{ order.amount }}</td>
          <td>{{ order.price }}</td>
          <td>
            <button @click="cancelOrder(order.symbol, order.oId, order.platform)">Annuler</button>
          </td>
        </tr>
      </tbody>
    </table>
    <h2>Historique des ordres</h2>
    <table>
      <thead>
        <tr>
          <th>Exchange</th>
          <th>Pair de trading</th>
          <th>Type d'ordre</th>
          <th>Prix</th>
          <th>Quantité</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(order, index) in filledOrders" :key="index">
          <td>{{ order.exchange }}</td>
          <td>{{ order.pair }}</td>
          <td>{{ order.orderType }}</td>
          <td>{{ order.price }}</td>
          <td>{{ order.quantity }}</td>
          <td>{{ order.date }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
const serverHost = "http://localhost:3000";

export default {
  name: "OrderManagementPage",
  data() {
    return {
      activeOrders: [],
      filledOrders: []
    };
  },
  methods: {
    async cancelOrder(symbol, oId, platform) {
      // Appeler l'API pour annuler l'ordre à l'index donné
      try {
        const response = await fetch(`${serverHost}/deleteOrder?exchangeId=${platform}&oId=${oId}&symbol=${symbol}`);
        const data = await response.json();
        console.log("code :: " + data.code);
      } catch (err) {
        console.error(err);
      }
    },

    async getActiveOrderFromDB() {
      try {
        const response = await fetch(serverHost + '/get/activeOrders');
        const data = await response.json();
        this.activeOrders = data;
      } catch (err) {
        console.error(err);
      }
    },

  },
  mounted() {
    this.activeOrders;
    this.getActiveOrderFromDB();

    //TODO
    this.filledOrders = [
      {
        exchange: 'Binance',
        pair: 'BTC/USDT',
        orderType: 'Limit',
        price: 52000,
        quantity: 0.5,
        date: '2023-04-26 10:23:45'
      },
      {
        exchange: 'Coinbase Pro',
        pair: 'ETH/USD',
        orderType: 'Market',
        price: 2800,
        quantity: 2.3,
        date: '2023-04-25 09:12:34'
      }
    ];
  }
};
</script>