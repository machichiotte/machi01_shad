<template>
  <div class="page">
    <h1>Add new trades</h1>
    <div id="table">
      <form @submit.prevent="addTrades">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>altA</th>
              <th>altB</th>
              <th>Type</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Total</th>
              <th>Total (USDT)</th>
              <th>Fee</th>
              <th>Fee Coin</th>
              <th>Platform</th>
              <th>Ex Platform</th>
              <th>Pair</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(trade, index) in trades" :key="index">
              <td>
                <input type="date" v-model="trade.date" required style="font-size: 18px;">
              </td>
              <td>
                <input type="text" v-model="trade.altA" @input="trade.altA = trade.altA.toUpperCase()" required
                  style="font-size: 18px;">
              </td>
              <td>
                <select v-model="trade.altB" @input="trade.altB = trade.altB.toUpperCase()" required
                  style="font-size: 18px;">
                  <option value="USDT">USDT</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USD">USD</option>
                </select>
              </td>
              <td>
                <select v-model="trade.type" required style="font-size: 18px;">
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </td>
              <td>
                <input type="text" v-model="trade.price" step="any" required style="font-size: 18px;">
              </td>
              <td>
                <input type="text" v-model="trade.amount" step="any" required style="font-size: 18px;">
              </td>
              <td>
                <input type="text" v-model="trade.total" step="any" required style="font-size: 18px;">
              </td>
              <td>
                <input type="text" v-model="trade.totalUSDT" step="any" required style="font-size: 18px;">
              </td>
              <td>
                <input type="text" v-model="trade.fee" step="any" required style="font-size: 18px;">
              </td>
              <td>
                <input type="text" v-model="trade.feecoin" @input="trade.feecoin = trade.feecoin.toUpperCase()" required
                  style="font-size: 18px;">
              </td>
              <td>
                <select v-model="trade.platform" required style="font-size: 18px;">
                  <option value="" disabled>Select a platform</option>
                  <option value="binance">Binance</option>
                  <option value="kucoin">Kucoin</option>
                  <option value="htx">Htx</option>
                  <option value="okx">Okx</option>
                  <option value="gateio">Gateio</option>
                </select>
              </td>
              <td>
                <select v-model="trade.explatform" style="font-size: 18px;">
                  <option value="" disabled>Select a platform</option>
                  <option value="binance">Binance</option>
                  <option value="kucoin">Kucoin</option>
                  <option value="htx">Htx</option>
                  <option value="okx">Okx</option>
                  <option value="gateio">Gateio</option>
                </select>
              </td>
              <td>
                <input type="text" v-model="trade.pair" readonly style="font-size: 18px;">
              </td>
              <td>
                <button @click="removeRow(index)" style="font-size: 14px;">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  </div>
  <div style="text-align: center; margin-top: 10px;">
    <button type="button" @click="addRow" style="font-size: 18px; padding: 10px 20px;">Add Row</button>
    <button type="submit" style="font-size: 18px; padding: 10px 20px;">Add Trades</button>
  </div>
</template>

<script>
import { successSpin, errorSpin } from '../js/spinner.js';

const serverHost = process.env.VUE_APP_SERVER_HOST;

export default {
  name: 'HomePage',
  methods: {
    async addTrades() {
      successSpin('calcul test', `Résultat : ${JSON.stringify(this.trades)}`, true, true);
      try {
        const response = await fetch(`${serverHost}/add/trades`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            trades_data: this.trades
          })
        });
        console.log("resp:: " + response);
        /*  if (response.ok) {
            const responseData = await response.json();
            successSpin('Save completed', 'Trades added successfully.' + responseData, true, true);
          } else {
            const responseData = await response.json();
            errorSpin('Error', responseData.error, false, true);
          } */
      } catch (error) {
        errorSpin('Error', 'An error occurred while adding the trades: ' + error, false, true);
      }
    },
    removeRow(index) {
      this.trades.splice(index, 1);
    },
    addRow() {
      this.trades.push({
        "date": "",
        "altA": "",
        "altB": "USDT",
        "pair": "",
        "type": "buy",
        "price": "0",
        "amount": "0",
        "total": "0",
        "fee": "0",
        "feecoin": "",
        "platform": "",
        "explatform": ""
      });
    },
  },
  mounted() {
    this.addRow();
  },
  data() {
    return {
      trades: [],
    };
  },
};
</script>

<style scoped> .page {
   overflow-x: auto;
 }

 #table {
   height: 700px;
   width: auto;
 }
</style>