<!-- src/components/livedata/Livedata.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { useLiveDataStore } from '../../store/liveDataStore';
import { formatPrice, formatChangePercent, formatNumberWithDynamicPrecision } from '../../utils/formatter';
const liveDataStore = useLiveDataStore();
const sortedTickers = computed(() => liveDataStore.sortedTickersByVolume);

const getChangeClass = (percent: string | number | undefined): string => {
  if (percent == null) return '';
  const num = Number(percent);
  if (isNaN(num)) return '';
  return num > 0 ? 'positive-change' : num < 0 ? 'negative-change' : '';
};

</script>

<template>
  <div class="live-data-container">
    <h2>Live Binance Ticker Data</h2>

    <div v-if="sortedTickers.length > 0" class="ticker-grid">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Symbol</th>
            <th>Last Price (USDT)</th>
            <th>Change (24h)</th>
            <th>High (24h)</th>
            <th>Low (24h)</th>
            <th>Volume (Base)</th>
            <th>Volume (Quote)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ticker, index) in sortedTickers" :key="ticker.symbol">
            <td>{{ index + 1 }}</td>
            <td>{{ ticker.symbol }}</td>
            <td>{{ formatPrice(ticker.lastPrice) }}</td>
            <td :class="getChangeClass(ticker.priceChangePercent)">
              {{ formatChangePercent(ticker.priceChangePercent) }}
            </td>
            <td>{{ formatPrice(ticker.highPrice) }}</td>
            <td>{{ formatPrice(ticker.lowPrice) }}</td>
            <td>{{ formatNumberWithDynamicPrecision(ticker.volume, 2) }}</td>
            <td>{{ formatNumberWithDynamicPrecision(ticker.quoteVolume, 2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>Aucune donnée disponible pour le moment.</p>
    </div>
  </div>
</template>

<style scoped>
.live-data-container {
  max-width: 1000px;
  margin: 1rem auto;
  padding: 1rem;
  background-color: #2c2c2c;
  color: #eee;
  border-radius: 8px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.ticker-grid table {
  width: 100%;
  border-collapse: collapse;
}

.ticker-grid th,
.ticker-grid td {
  border: 1px solid #444;
  padding: 0.6rem;
  font-size: 0.9em;
}

.ticker-grid th {
  background-color: #3a3a3a;
  position: sticky;
  top: 0;
}

.ticker-grid tbody tr:nth-child(even) {
  background-color: #333;
}

.ticker-grid tbody tr:hover {
  background-color: #454545;
}

.positive-change {
  color: #4caf50;
}

.negative-change {
  color: #f44336;
}

p {
  text-align: center;
  color: #aaa;
  margin-top: 2rem;
  font-style: italic;
}
</style>
