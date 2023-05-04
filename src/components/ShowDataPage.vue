<template>
  <div>
    <h1>Show data</h1>

    <h2>CMC</h2>
    <table>
      <tbody>
        <tr v-for="(order, index) in cryptoData" :key="index">
          <td>{{ order.name }}</td>
          <td>{{ order['cmc_rank']}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
const serverHost = "http://localhost:3000";

export default {
  name: "ShowDataPage",
  data() {
    return {
      cryptoData: null,
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

  },
  mounted() {
    this.cryptoData;
    this.getCmcData();
  }
};
</script>