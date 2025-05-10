  <!-- src/components/livedata/Livedata.vue -->
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useLiveDataStore } from '../../store/liveDataStore';
  import { formatPrice, formatChangePercent, formatNumberWithDynamicPrecision } from '../../utils/formatter';
  import { getQuoteCurrency } from '../../utils/marketUtils'; // Ajustez le chemin si nécessaire

  const liveDataStore = useLiveDataStore();

  const selectedQuotes = ref<string[]>([]);
    const availableQuotes = computed(() => {
    const quotes = new Set<string>();
    // Itère sur le TABLEAU fourni par le getter du store
    liveDataStore.sortedTickersByVolume.forEach(ticker => { // 'ticker' est ici un objet TickerData
      const quote = getQuoteCurrency(ticker.symbol); // Accède à la propriété 'symbol' de l'objet
      if (quote) {
        quotes.add(quote);
      }
    });
    return Array.from(quotes).sort();
  });

  const filteredAndSortedTickers = computed(() => {
    // Utilise directement le TABLEAU trié fourni par le store
    const baseSorted = liveDataStore.sortedTickersByVolume;

    // Si aucune devise n'est sélectionnée, retourne le tableau complet (inchangé)
    if (selectedQuotes.value.length === 0) {
      return baseSorted;
    }

    // Filtre le TABLEAU fourni par le store
    return baseSorted.filter(ticker => { // 'ticker' est ici un objet TickerData
      const quote = getQuoteCurrency(ticker.symbol); // Accède à la propriété 'symbol' de l'objet
      return quote ? selectedQuotes.value.includes(quote) : false;
    });
  });

  const getChangeClass = (percent: string | number | undefined): string => {
    if (percent == null) return '';
    const num = Number(percent);
    if (isNaN(num)) return '';
    return num > 0 ? 'positive-change' : num < 0 ? 'negative-change' : '';
  };

  const selectAllQuotes = () => {
      selectedQuotes.value = [...availableQuotes.value];
  };

  const deselectAllQuotes = () => {
      selectedQuotes.value = [];
  };

  </script>

  <template>
    <div class="live-data-container">
      <h2>Live Binance Ticker Data</h2>

      <div class="filter-controls" v-if="availableQuotes.length > 0">
        <h3>Filter by Quote Currency:</h3>
        <div class="quote-options">
          <label v-for="quote in availableQuotes" :key="quote">
            <input type="checkbox" :value="quote" v-model="selectedQuotes">
            {{ quote }}
          </label>
          <button @click="selectAllQuotes" :disabled="availableQuotes.length === 0">Select All</button>
          <button @click="deselectAllQuotes" :disabled="selectedQuotes.length === 0">Deselect All</button>
        </div>
      </div>

      <div v-if="filteredAndSortedTickers.length > 0" class="ticker-grid">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Symbol</th>
              <th>Last Prices</th>
              <th>Change (24h)</th>
              <th>High (24h)</th>
              <th>Low (24h)</th>
              <th>Volume (Base)</th>
              <th>Volume (Quote)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ticker, index) in filteredAndSortedTickers" :key="ticker.symbol">
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
        <p v-if="Object.keys(liveDataStore.tickers).length === 0">Chargement des données...</p> <p v-else-if="selectedQuotes.length > 0 && availableQuotes.length > 0">Aucune donnée ne correspond aux filtres sélectionnés.</p>
        <p v-else>Aucune donnée disponible pour le moment.</p>
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
    color: var(--positive-color);
  }

  .negative-change {
    color: var(--negative-color);
  }

  p {
    text-align: center;
    color: #aaa;
    margin-top: 2rem;
    font-style: italic;
  }
  </style>
