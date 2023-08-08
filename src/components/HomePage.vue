<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
    <div style="width: 400px;">
      <h1 style="font-size: 24px; text-align: center;">Add trades</h1>
      <form @submit.prevent="addTrade">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="date" style="font-size: 18px; text-align: right;">Date:</label>
            <input type="date" v-model="tradeData.date" required style="font-size: 18px;">
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="altA" style="font-size: 18px; text-align: right;">altA:</label>
            <input type="text" v-model="tradeData.altA" required style="font-size: 18px;">
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="altB" style="font-size: 18px; text-align: right;">altB:</label>
            <select v-model="tradeData.altB" required style="font-size: 18px;">
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="USD">USD</option>
            </select>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="type" style="font-size: 18px; text-align: right;">Type:</label>
            <select v-model="tradeData.type" required style="font-size: 18px;">
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="price" style="font-size: 18px; text-align: right;">Price:</label>
            <input type="number" v-model="tradeData.price" step="any" required style="font-size: 18px;">
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="amount" style="font-size: 18px; text-align: right;">Amount:</label>
            <input type="number" v-model="tradeData.amount" step="any" required style="font-size: 18px;">
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="total" style="font-size: 18px; text-align: right;">Total:</label>
            <input type="number" v-model="tradeData.total" step="any" required style="font-size: 18px;">
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="fee" style="font-size: 18px; text-align: right;">Fee:</label>
            <input type="number" v-model="tradeData.fee" step="any" required style="font-size: 18px;">
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="feecoin" style="font-size: 18px; text-align: right;">Fee Coin:</label>
            <input type="text" v-model="tradeData.feecoin" required style="font-size: 18px;">
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="platform" style="font-size: 18px; text-align: right;">Platform:</label>
            <select v-model="tradeData.platform" required style="font-size: 18px;">
              <option value="" disabled>Select a platform</option>
              <option value="binance">Binance</option>
              <option value="kucoin">Kucoin</option>
              <option value="huobi">Huobi</option>
              <option value="okex">Okex</option>
              <option value="gateio">Gateio</option>
            </select>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="explatform" style="font-size: 18px; text-align: right;">Ex Platform:</label>
            <select v-model="tradeData.explatform" style="font-size: 18px;">
              <option value="" disabled>Select an exchange platform</option>
              <option value="binance">Binance</option>
              <option value="kucoin">Kucoin</option>
              <option value="huobi">Huobi</option>
              <option value="okex">Okex</option>
              <option value="gateio">Gateio</option>
            </select>
          </div>
          
          <div style="text-align: center;">
            <button type="submit" style="font-size: 18px; padding: 10px 20px;">Add Trade</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import {successSpin, errorSpin } from '../js/spinner.js'

export default {
  methods: {
    async addTrade() {
      try {
        const response = await fetch('/add/trade', this.tradeData);

        if (response.ok) {
          successSpin('Save completed', 'Trade added successfully.', true, true);
        } else {
          const responseData = await response.json();
          errorSpin('Error', responseData.error, false, true);
        }
      } catch (error) {
        console.error(error);
        errorSpin('Error', 'An error occurred while adding the trade. : ' + error + ' -- ' + 'td:: ' + this.tradeData +' std:: ' + JSON.stringify(this.tradeData), false, true);
      }
    },
  },
  data() {
    return {
      tradeData: {
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
      },
    };
  },
};
</script>