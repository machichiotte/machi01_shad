<!-- src/components/machi/card/CardAssetHeader.vue -->
<script setup lang="ts">
import { computed, ref, PropType, onMounted } from 'vue'; // Import PropType, onMounted
import { Asset, Order, Trade } from '../../../types/responseData';
import { formatPrice } from '../../../utils/formatter'; // Assuming this utility exists
import { QUOTE_CURRENCIES } from '../../../constants/assets';

// 2: Define component props - Add new ones
const props = defineProps({
  asset: { type: Object as PropType<Asset>, required: true },
  orders: { type: Array as PropType<Order[]>, required: true }, // Use filtered from parent
  trades: { type: Array as PropType<Trade[]>, required: true }, // Use filtered from parent
  isDetailsVisible: { type: Boolean, required: true },         // <-- Prop controls visibility
  availableMarkets: { type: Array as PropType<string[]>, default: () => [] }, // <-- Live markets
  livePrice: { type: Number, default: undefined },                            // <-- Live price
  liveChangePercent: { type: Number, default: undefined },                    // <-- Live change %
});

// 3: Alias for easier access to asset prop
const asset = props.asset;
// Ref for the selected market in the dropdown
const selectedMarket = ref<string | null>(null);

// --- Computed Properties ---

// 4: Total Buy (uses data within the asset prop, assuming calculated upstream)
const formattedTotalBuy = computed(() => formatPrice(asset.orders?.trade?.totalBuy || 0));
// 5: Total Sell (uses data within the asset prop)
const formattedTotalSell = computed(() => formatPrice(asset.orders?.trade?.totalSell || 0));

// 6: In Order Amount (calculated from the filtered orders passed as prop)
const inOrderAmount = computed(() => {
  return props.orders.reduce((total, order) => total + (order.amount || 0), 0);
});

// 7: Use live data prop for price, fallback to asset data if not available
const displayPrice = computed(() => {
    // Prioritize live price for the *selected* market? Or always show default?
    // For now, using the passed livePrice (likely for BASE/USDT)
    return props.livePrice !== undefined
        ? formatPrice(props.livePrice)
        // Fallback to potentially less up-to-date price from asset object
        : formatPrice(asset.liveData?.currentPrice);
});

// 8: Use live data prop for change percentage
const formattedLiveChangePercent = computed(() => {
  // Similarly, prioritize live change percentage
  return props.liveChangePercent !== undefined
    ? props.liveChangePercent.toFixed(2)
    // Fallback to CMC data from asset object
    : asset.cmc?.cryptoPercentChange24h !== undefined
        ? asset.cmc.cryptoPercentChange24h.toFixed(2)
        : "0.00";
});

// Determine CSS class based on live change percentage
const liveChangeClass = computed(() => {
    const change = props.liveChangePercent ?? asset.cmc?.cryptoPercentChange24h; // Prioritize live prop
    if (change === undefined) return 'neutral';
    return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
});


// 9: Profit percentage (from asset prop, assumed calculated upstream)
const formattedProfit = computed(() => {
  return asset.profit !== undefined
    ? asset.profit.toFixed(2)
    : "0.00";
});

// --- Refs ---
// Removed local isDetailsVisible ref

// --- Emits ---
// 10: Define component emits
const emit = defineEmits(['toggle-details']);

// --- Methods ---
// 11: Function to ONLY emit the toggle event. Parent handles state.
function handleToggleDetailsClick() {
  emit('toggle-details'); // Let the parent handle the visibility change
}

// Helper to format symbol for display (e.g., BTCUSDT -> BTC/USDT)
const formatMarketSymbol = (symbol: string): string => {
  const quote = QUOTE_CURRENCIES.find(q => symbol.endsWith(q));
  if (quote) {
    const base = symbol.slice(0, symbol.length - quote.length);
    return `${base}/${quote}`;
  }
  return symbol;
};

onMounted(() => {
  const defaultMarket = props.availableMarkets.find(m => m === asset.base + 'USDT');
  selectedMarket.value = defaultMarket ?? props.availableMarkets[0] ?? null;
});

// Watch for changes in the selected market to potentially update displayed price/change?
// watch(selectedMarket, (newMarketSymbol) => {
//   if (newMarketSymbol) {
//      // Fetch/find live data for the newMarketSymbol from the store?
//      // This would require more logic, potentially passing the whole store
//      // or specific getter functions down, or emitting an event upwards.
//      console.log("Selected market changed to:", newMarketSymbol);
//   }
// });

</script>

<template>
  <div class="card-header">
    <div class="left-section">
      <div class="top-row">
        <div class="logo-container">
          <img :src="asset.iconUrl" alt="Logo" class="logo" />
        </div>
        <div class="asset-info">
          <div class="asset-name">{{ asset.name }}</div>
          <div class="asset-base-rank">{{ asset.base }} {{ asset.cmc?.rank ? '#' + asset.cmc.rank : '' }}</div>
        </div>
        <div class="market-selector">
          <select v-model="selectedMarket">
             <option :value="null" disabled v-if="!selectedMarket && availableMarkets.length === 0">Loading...</option>
             <option :value="null" disabled v-else-if="!selectedMarket">Select Market</option>
            <option v-for="market in availableMarkets" :key="market" :value="market">
              {{ formatMarketSymbol(market) }}
            </option>
          </select>
        </div>
      </div>

      <div class="middle-row">
        <div class="current-price">{{ displayPrice }}</div>
      </div>

      <div class="bottom-row">
        <div class="cmc-data" :class="liveChangeClass">
          {{ formattedLiveChangePercent }}%
        </div>
      </div>
    </div>

    <div class="right-section">
       <div class="current-possession">
          {{ formatPrice(asset.liveData?.currentPossession) }}$ </div>
       <div class="profit-difference">
          <span :class="{
              'positive': asset.profit > 0,
              'negative': asset.profit < 0,
              'neutral': asset.profit === 0
          }">
              {{ formattedProfit }}%
          </span>
          <span> (entry price: {{ formatPrice(asset.orders?.trade?.averageEntryPrice) }}$)</span>
      </div>
       <div class="total-buy">
          Total Buy: {{ formattedTotalBuy }}$
       </div>
       <div class="total-sell">
          Total Sell: {{ formattedTotalSell }}$
       </div>
       <div class="total-amount">
          Total Amount: {{ asset.orders?.trade?.totalAmountBuy }} {{ asset.base }}
       </div>
       <div class="in-order">
          In Order: {{ inOrderAmount.toFixed(8) }} {{ asset.base }} </div>
       <div class="details-button">
          <Button
             :icon="isDetailsVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
             class="expand-button"
             @click="handleToggleDetailsClick" />
       </div>
    </div>
  </div>
</template>

<style scoped>
/* 1: Card header layout */
.card-header {
  display: flex;
  justify-content: space-between;
  background-color: #ddd;
  padding: 0.5rem;
}

/* 2: Left section styling */
.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 0.5rem;
}

/* 3: Right section styling */
.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 0.5rem;
  text-align: right;
}

/* 4: Top row layout */
.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

/* 5: Logo container styling */
.logo-container {
  flex-shrink: 0;
}

/* 6: Logo image styling */
.logo {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
}

/* 7: Asset info styling */
.asset-info {
  margin-left: 0.5rem;
}

/* 8: Asset name styling */
.asset-name {
  font-size: 1.2rem;
  font-weight: bold;
}

/* 9: Asset base and rank styling */
.asset-base-rank {
  font-size: 1rem;
  color: #555;
}

/* 10: Market selector styling */
.market-selector {
  margin-left: auto;
}

/* 11: Middle row for current price */
.middle-row {
  text-align: center;
  margin-bottom: 0.5rem;
}

/* 12: Current price styling */
.current-price {
  font-size: 2rem;
  font-weight: bold;
}

/* 13: Bottom row styling for CMC data */
.bottom-row {
  text-align: center;
}

/* 14: CMC data styling with conditional coloring */
.cmc-data {
  font-size: 1rem;
  font-weight: bold;
}

.cmc-data.positive {
  color: #4caf50;
}

.cmc-data.negative {
  color: #ff4c4c;
}

.cmc-data.neutral {
  color: #636963;
}

/* 15: Spacing for each div in right section */
.right-section>div {
  margin-bottom: 0.5rem;
}

/* 16: Current possession styling */
.current-possession {
  font-size: 2rem;
  font-weight: bold;
}

/* 17: Profit difference styling */
.profit-difference {
  font-size: 1rem;
  font-weight: bold;
}

/* 18: Smaller text for total and order info */
.total-buy,
.total-sell,
.total-amount,
.in-order {
  font-size: 0.8rem;
}

/* 19: Details button styling */
.details-button {
  text-align: right;
}

/* 20: Expand button styling */
.expand-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}


/* Style the select dropdown */
.market-selector select {
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  border: 1px solid #aaa; /* Slightly darker border */
  background-color: white;
  min-width: 100px; /* Ensure minimum width */
  cursor: pointer;
  color: #333;
}

/* Ensure right-section items have consistent bottom margin */
.right-section > div:not(:last-child) {
    margin-bottom: 0.3rem; /* Adjust spacing */
}
.right-section > div:last-child {
    margin-bottom: 0; /* No margin for the button container */
}

/* Ensure button aligns well */
.details-button {
    line-height: 1; /* Adjust button alignment if needed */
    margin-top: auto; /* Push button towards the bottom if needed */
}
.expand-button {
  padding: 0.2rem; /* Add some padding if needed */
}

/* Add optional styling for positive/negative/neutral in profit difference */
.profit-difference .positive { color: #4caf50; }
.profit-difference .negative { color: #ff4c4c; }
.profit-difference .neutral { color: #636963; }
</style>
