<template>
  <div>
      <h1 style="font-size: 24px; text-align: center;">Add trades</h1>
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
                <input type="text" v-model="trade.altA" required style="font-size: 18px;">
              </td>
              <td>
                <select v-model="trade.altB" required style="font-size: 18px;">
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
                <input type="number" v-model="trade.price" step="any" required style="font-size: 18px;">
              </td>
              <td>
                <input type="number" v-model="trade.amount" step="any" required style="font-size: 18px;">
              </td>
              <td>
                <input type="number" v-model="trade.total" step="any" required style="font-size: 18px;">
              </td>
              <td>
                <input type="number" v-model="trade.fee" step="any" required style="font-size: 18px;">
              </td>
              <td>
                <input type="text" v-model="trade.feecoin" required style="font-size: 18px;">
              </td>
              <td>
                <select v-model="trade.platform" required style="font-size: 18px;">
                  <option value="" disabled>Select a platform</option>
                  <option value="binance">Binance</option>
                  <option value="kucoin">Kucoin</option>
                  <option value="huobi">Huobi</option>
                  <option value="okex">Okex</option>
                  <option value="gateio">Gateio</option>
                </select>
              </td>
              <td>
                <select v-model="trade.explatform" style="font-size: 18px;">
                  <option value="" disabled>Select a platform</option>
                  <option value="binance">Binance</option>
                  <option value="kucoin">Kucoin</option>
                  <option value="huobi">Huobi</option>
                  <option value="okex">Okex</option>
                  <option value="gateio">Gateio</option>
                </select>
              </td>
 <td>
        <input type="text" v-model="trade.pair" :value="trade.altA + '/' + trade.altB" readonly style="font-size: 18px;">
      </td>
            </tr>
          </tbody>
        </table>
        <div style="text-align: center; margin-top: 10px;">
          <button type="button" @click="addRow" style="font-size: 18px; padding: 10px 20px;">Add Row</button>
          <button type="submit" style="font-size: 18px; padding: 10px 20px;">Add Trades</button>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
  import {
    successSpin,
    errorSpin
  } from '../js/spinner.js';
  export default {
    methods: {
      async addTrades() {
        try {
          const response = await fetch('/add/trades', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              tradesData: this.trades
            }),
          });
          if (response.ok) {
            const responseData = await response.json();
            successSpin('Save completed', 'Trades added successfully.' + responseData, true, true);
          } else {
            const responseData = await response.json();
            errorSpin('Error', responseData.error, false, true);
          }
        } catch (error) {
          errorSpin('Error', 'An error occurred while adding the trades: ' + error + " --- trstring: " +JSON.stringify(this.trades), false, true);
        }
      },
      addRow() {
        this.trades.push({
          date: '',
          altA: '',
          altB: 'USDT',
          type: 'buy',
          price: 0,
          amount: 0,
          total: 0,
          fee: 0,
          feecoin: '',
          platform: '',
          explatform: '',
pair: ''
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