<!-- AddTradeForm.vue -->

<template>
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
          <input
            type="date"
            v-model="trade.date"
            required
            style="font-size: 18px"
          />
        </td>
        <td>
          <input
            type="text"
            v-model="trade.altA"
            @input="trade.altA = trade.altA.toUpperCase()"
            required
            style="font-size: 18px"
          />
        </td>
        <td>
          <select
            v-model="trade.altB"
            @input="trade.altB = trade.altB.toUpperCase()"
            required
            style="font-size: 18px"
          >
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="USD">USD</option>
          </select>
        </td>
        <td>
          <select v-model="trade.type" required style="font-size: 18px">
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </td>
        <td>
          <input
            type="text"
            v-model="trade.price"
            step="any"
            required
            style="font-size: 18px"
          />
        </td>
        <td>
          <input
            type="text"
            v-model="trade.amount"
            step="any"
            required
            style="font-size: 18px"
          />
        </td>
        <td>
          <input
            type="text"
            v-model="trade.total"
            step="any"
            required
            style="font-size: 18px"
          />
        </td>
        <td>
          <input
            type="text"
            v-model="trade.totalUSDT"
            step="any"
            required
            style="font-size: 18px"
          />
        </td>
        <td>
          <input
            type="text"
            v-model="trade.fee"
            step="any"
            required
            style="font-size: 18px"
          />
        </td>
        <td>
          <input
            type="text"
            v-model="trade.feecoin"
            @input="trade.feecoin = trade.feecoin.toUpperCase()"
            required
            style="font-size: 18px"
          />
        </td>
        <td>
          <SelectPlatform :options="platformOptions" v-model="trade.platform" />
        </td>
        <td>
          <SelectPlatform
            :options="platformOptions"
            v-model="trade.explatform"
          />
        </td>
        <td>
          <input
            type="text"
            v-model="trade.pair"
            readonly
            style="font-size: 18px"
          />
        </td>
        <td>
          <button @click="removeRow(index)" style="font-size: 14px">
            Supprimer
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import SelectPlatform from "./SelectPlatform.vue";
import platformOptions from "../json/platforms.json";

export default {
  props: {
    trades: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    SelectPlatform,
  },
  data() {
    // **Replace with a function**
    return {
      platformOptions,
    };
  },
  methods: {
    removeRow(index) {
      this.$emit("removeRow", index);
    },
  },
};
</script>