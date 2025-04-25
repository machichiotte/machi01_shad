<!-- src/components/livedata/Livedata.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useLiveDataStore } from '../../store/liveDataStore';

// Define the structure of the ticker data we expect from the backend
interface TickerData {
  type: string;
  symbol: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string; // Volume de la base currency
  quoteVolume: string; // Volume de la quote currency (USDT ici, celui qu'on veut trier)
  eventTime: number;
  // eventType?: string; // Décommentez si vous avez ajouté cette propriété au backend
}

const ws = ref<WebSocket | null>(null);
const connectionStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
const errorMessage = ref<string | null>(null);

// Use the Pinia store
const liveDataStore = useLiveDataStore();

// Get WebSocket URL from environment variables or use a default
// Make sure VITE_WS_URL is defined in your .env file (e.g., VITE_WS_URL=ws://localhost:10000)
const VITE_WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:10000';

// Computed property for sorted ticker data
const sortedTickers = computed(() => liveDataStore.sortedTickersByVolume);

const connectWebSocket = () => {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    console.log('WebSocket already connected.');
    return;
  }

  console.log(`Attempting to connect WebSocket to ${VITE_WS_URL}...`);
  connectionStatus.value = 'connecting';
  errorMessage.value = null;

  // Cleanup existing socket if necessary (e.g., after an error)
  if (ws.value) {
    ws.value.close();
  }

  ws.value = new WebSocket(VITE_WS_URL);

  ws.value.onopen = () => {
    console.log('WebSocket connected successfully.');
    connectionStatus.value = 'connected';
  };

  ws.value.onmessage = (event) => {
    console.log('Raw message received on frontend:', event.data); // Gardez ce log pour le debug
    try {
      const parsedData = JSON.parse(event.data);

      // Check if the received data is an array
      if (Array.isArray(parsedData)) {
        // If it's an array, process each ticker object inside it
        console.log(`Parsed message: Received array with ${parsedData.length} tickers.`);
        parsedData.forEach((ticker: TickerData) => { // Add type annotation here
          // Make sure the structure of objects in the array matches TickerData
          // You might need to adjust TickerData or map fields if they differ
          // from Binance's !ticker@arr format (e.g., Binance uses 's' for symbol, 'c' for lastPrice)
          // For now, assuming direct compatibility or backend mapping:
          liveDataStore.updateTicker(ticker);
        });
      } else if (typeof parsedData === 'object' && parsedData !== null) {
        // If it's a single object (handle potential future cases or other message types)
        console.log('Parsed message: Received single ticker object.');
        // Ensure it matches the TickerData structure before updating
        // Add validation if necessary
        liveDataStore.updateTicker(parsedData as TickerData); // Type assertion
      } else {
        console.warn('Received unexpected WebSocket message format:', parsedData);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  ws.value.onerror = (error) => {
    console.error('WebSocket error:', error);
    errorMessage.value = 'WebSocket connection error. Check console for details.';
    connectionStatus.value = 'error';
    // Optional: Attempt to reconnect after a delay
    // setTimeout(connectWebSocket, 5000);
  };

  ws.value.onclose = (event) => {
    console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
    // Only set to 'disconnected' if it wasn't an error causing the close
    if (connectionStatus.value !== 'error') {
      connectionStatus.value = 'disconnected';
    }
    ws.value = null; // Clear the ref

    // Optional: Attempt to reconnect if the disconnection was unexpected
    // if (!event.wasClean && connectionStatus.value !== 'error') {
    //   console.log('Unexpected disconnection. Attempting to reconnect in 5 seconds...');
    //   setTimeout(connectWebSocket, 5000);
    // }
  };
};

const disconnectWebSocket = () => {
  if (ws.value) {
    console.log('Disconnecting WebSocket manually...');
    ws.value.close(1000, 'User disconnected'); // Use standard code 1000
    ws.value = null;
    connectionStatus.value = 'disconnected';
  }
};

// Connect when the component mounts
onMounted(() => {
  connectWebSocket();
});

// Disconnect when the component unmounts
onUnmounted(() => {
  disconnectWebSocket();
});

// Helper to format price with fixed decimal places
const formatPrice = (price: string | number | undefined) => {
  if (price === undefined || price === null) return 'N/A';
  const num = Number(price);
  return isNaN(num) ? 'N/A' : num; // Adjust decimal places as needed
};

// Helper to format percentage change
const formatChangePercent = (percent: string | number | undefined) => {
  if (percent === undefined || percent === null) return 'N/A';
  const num = Number(percent);
  return isNaN(num) ? 'N/A' : `${num.toFixed(2)}%`;
};

// Helper to get CSS class based on price change
const getChangeClass = (percent: string | number | undefined) => {
  if (percent === undefined || percent === null) return '';
  const num = Number(percent);
  if (isNaN(num)) return '';
  return num > 0 ? 'positive-change' : num < 0 ? 'negative-change' : '';
};

</script>

<template>
  <div class="live-data-container">
    <h2>Live Binance Ticker Data</h2>

    <div class="status-bar">
      <span>Status: {{ connectionStatus }}</span>
      <button @click="connectWebSocket" v-if="connectionStatus === 'disconnected' || connectionStatus === 'error'">
        Connect
      </button>
      <button @click="disconnectWebSocket" v-if="connectionStatus === 'connected'">
        Disconnect
      </button>
      <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
    </div>

    <div v-if="connectionStatus === 'connected' && sortedTickers.length > 0" class="ticker-grid">
      <table>
        <thead>
          <tr>
            <th>#</th> <!-- Colonne pour le numéro -->
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

            <td>{{ index + 1 }}</td> <!-- Numéro de ligne -->

            <td>{{ ticker.symbol }}</td>
            <td>{{ formatPrice(ticker.lastPrice) }}</td>
            <td :class="getChangeClass(ticker.priceChangePercent)">
              {{ formatChangePercent(ticker.priceChangePercent) }}
            </td>
            <td>{{ formatPrice(ticker.highPrice) }}</td>
            <td>{{ formatPrice(ticker.lowPrice) }}</td>
            <td>{{ Number(ticker.volume).toFixed(2) }}</td>
            <td>{{ Number(ticker.quoteVolume).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="connectionStatus === 'connected'">
      <p>Waiting for data...</p>
    </div>
    <div v-else-if="connectionStatus === 'connecting'">
      <p>Connecting to WebSocket...</p>
    </div>
    <div v-else>
      <p>WebSocket is disconnected. Click 'Connect' to start receiving data.</p>
    </div>
  </div>
</template>

<style scoped>
.live-data-container {
  max-width: 1000px;
  margin: 1rem auto;
  padding: 1rem;
  background-color: #2c2c2c;
  /* Darker background */
  color: #eee;
  /* Lighter text color for container */
  border-radius: 8px;
}

.status-bar {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #333;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-bar button {
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.status-bar button:hover {
  background-color: #0056b3;
}

.error-message {
  color: #ff4d4d;
  font-weight: bold;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #eee;
  /* Lighter text color */
}

.ticker-grid table {
  width: 100%;
  border-collapse: collapse;
  color: #ccc;
  /* Lighter text color for table */
}

.ticker-grid th,
.ticker-grid td {
  border: 1px solid #444;
  /* Darker borders */
  padding: 0.6rem;
  text-align: left;
  font-size: 0.9em;
  /* Slightly smaller font */
  vertical-align: middle;
  /* Align text vertically */
}

.ticker-grid th {
  background-color: #3a3a3a;
  /* Slightly lighter header background */
  color: #eee;
  font-weight: bold;
  position: sticky;
  /* Make header sticky if container scrolls */
  top: 0;
  /* Required for sticky */
}

.ticker-grid tbody tr:nth-child(even) {
  background-color: #333;
  /* Slightly darker even rows */
}

.ticker-grid tbody tr:hover {
  background-color: #454545;
  /* Highlight on hover */
}


/* Classes for price change styling */
.positive-change {
  color: #4caf50;
  /* Green */
}

.negative-change {
  color: #f44336;
  /* Red */
}

/* Style for placeholder messages */
p {
  text-align: center;
  color: #aaa;
  margin-top: 2rem;
  font-style: italic;
}
</style>