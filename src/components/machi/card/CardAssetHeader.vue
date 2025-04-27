<!-- src/components/machi/card/CardAssetHeader.vue -->
<script setup lang="ts">
import { computed, ref, PropType, onMounted } from 'vue';
import { Asset, Order, Trade } from '../../../types/responseData';
import { formatPrice, formatNumberWithDynamicPrecision } from '../../../utils/formatter';
import { useLiveDataStore } from '../../../store/liveDataStore';

import {
  getQuoteCurrency,
  getCurrencySymbol,
  formatMarketSymbolForDisplay,
  getPriceDisplayPrecision,
  getChangeStatusClass
} from '../../../utils/marketUtils';

const props = defineProps({
  asset: { type: Object as PropType<Asset>, required: true },
  orders: { type: Array as PropType<Order[]>, required: true },
  trades: { type: Array as PropType<Trade[]>, required: true },
  isDetailsVisible: { type: Boolean, required: true },
  availableMarkets: { type: Array as PropType<string[]>, default: () => [] }
});

const liveDataStore = useLiveDataStore();

const asset = props.asset;
const selectedMarket = ref<string | null>(null);

const formattedTotalBuy = computed(() => formatPrice(asset.orders?.trade?.totalBuy || 0));
const formattedTotalSell = computed(() => formatPrice(asset.orders?.trade?.totalSell || 0));

const inOrderAmount = computed(() => {
  return props.orders.reduce((total, order) => total + (order.amount || 0), 0);
});

const displayPrice = computed(() => {
  if (!selectedMarket.value) {
    return '...';
  }

  const price = liveDataStore.getCurrentPrice(selectedMarket.value);

  if (typeof price !== 'number' || isNaN(price)) {
    return '...';
  }

  const precision = getPriceDisplayPrecision(quoteCurrency.value);
  return formatNumberWithDynamicPrecision(price, precision);
});

const liveChangePercentValue = computed(() => {
  if (!selectedMarket.value) return undefined;
  return liveDataStore.getChangePercent(selectedMarket.value);
});

const formattedLiveChangePercent = computed(() => {
  const change = liveChangePercentValue.value;
  return change !== undefined ? change.toFixed(2) : "N/A";
});

const liveChangeClass = computed(() => {
  return getChangeStatusClass(liveChangePercentValue.value);
});

const formattedProfit = computed(() => {
  return asset.profit !== undefined
    ? asset.profit.toFixed(2)
    : "0.00";
});

const currentPossessionValue = computed(() => {
  const currentRawPrice = selectedMarket.value
    ? liveDataStore.getCurrentPrice(selectedMarket.value)
    : undefined;

  const currentAmount = asset.liveData?.currentPossession;

  if (typeof currentRawPrice === 'number' && typeof currentAmount === 'number' && !isNaN(currentRawPrice) && !isNaN(currentAmount)) {
    const totalValue = currentRawPrice * currentAmount;
    const precision = getPriceDisplayPrecision(quoteCurrency.value);

    return formatNumberWithDynamicPrecision(totalValue, precision);

  } else {
    return 'N/A';
  }
});

const quoteCurrency = computed(() => getQuoteCurrency(selectedMarket.value));
const quoteCurrencySymbol = computed(() => getCurrencySymbol(quoteCurrency.value));

const emit = defineEmits(['toggle-details']);

function handleToggleDetailsClick() {
  emit('toggle-details');
}

onMounted(() => {
  const defaultMarket = props.availableMarkets.find(m => m === asset.base + 'USDT');
  selectedMarket.value = defaultMarket ?? props.availableMarkets[0] ?? null;
});

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
              {{ formatMarketSymbolForDisplay(market) }}
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
        {{ currentPossessionValue }} {{ quoteCurrencySymbol }} </div>
      <div class="profit-difference">
        <span :class="getChangeStatusClass(asset.profit)">
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
        <Button :icon="isDetailsVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="expand-button"
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
  border: 1px solid #aaa;
  /* Slightly darker border */
  background-color: white;
  min-width: 100px;
  /* Ensure minimum width */
  cursor: pointer;
  color: #333;
}

/* Ensure right-section items have consistent bottom margin */
.right-section>div:not(:last-child) {
  margin-bottom: 0.3rem;
  /* Adjust spacing */
}

.right-section>div:last-child {
  margin-bottom: 0;
  /* No margin for the button container */
}

/* Ensure button aligns well */
.details-button {
  line-height: 1;
  /* Adjust button alignment if needed */
  margin-top: auto;
  /* Push button towards the bottom if needed */
}

.expand-button {
  padding: 0.2rem;
  /* Add some padding if needed */
}

/* Add optional styling for positive/negative/neutral in profit difference */
.profit-difference .positive {
  color: #4caf50;
}

.profit-difference .negative {
  color: #ff4c4c;
}

.profit-difference .neutral {
  color: #636963;
}
</style>
