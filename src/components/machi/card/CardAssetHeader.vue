<!-- src/components/machi/card/CardAssetHeader.vue -->
<script setup lang="ts">
// 1: Import necessary modules and types
import { computed, ref } from 'vue'
import { Asset, Order, Trade } from '../../../types/responseData'
import { formatPrice } from '../../../utils/format'

// 2: Define component props
const props = defineProps<{
  asset: Asset,
  orders: Order[],
  trades: Trade[]
}>()

// 3: Alias for easier access to asset prop
const asset = props.asset

// 4: Computed property for formatting Total Buy price
const formattedTotalBuy = computed(() => formatPrice(asset.orders.trade.totalBuy || 0))
// 5: Computed property for formatting Total Sell price
const formattedTotalSell = computed(() => formatPrice(asset.orders.trade.totalSell || 0))

// 6: Computed property for calculating In Order amount
const inOrderAmount = computed(() => {
  return props.orders.reduce((total, order) => total + (order.amount || 0), 0)
})

// 7: Computed property for formatting crypto percent change to 2 decimals
const formattedCryptoPercentChange = computed(() => {
  return asset.cmc.cryptoPercentChange24h !== undefined
    ? asset.cmc.cryptoPercentChange24h.toFixed(2)
    : "0.00"
})

// 8: Computed property for formatting profit percentage to 2 decimals
const formattedProfit = computed(() => {
  return asset.profit !== undefined
    ? asset.profit.toFixed(2)
    : "0.00"
})

// 9: Ref for toggling details visibility
const isDetailsVisible = ref(false)

// 10: Define component emits
const emit = defineEmits(['toggle-details'])

// 11: Function to toggle details visibility and emit event
function toggleDetails() {
  isDetailsVisible.value = !isDetailsVisible.value
  emit('toggle-details', isDetailsVisible.value)
}
</script>

<template>
  <div class="card-header">
    <!-- Left Section (50% width) -->
    <div class="left-section">
      <!-- Top Row: Logo, Asset Info, and Market Selector -->
      <div class="top-row">
        <div class="logo-container">
          <img :src="asset.iconUrl" alt="Logo" class="logo" />
        </div>
        <div class="asset-info">
          <div class="asset-name">{{ asset.name }}</div>
          <div class="asset-base-rank">{{ asset.base }} #{{ asset.cmc.rank }}</div>
        </div>
        <div class="market-selector">
          <!-- Placeholder selector for markets -->
          <select>
            <option>Market 1</option>
            <option>Market 2</option>
          </select>
        </div>
      </div>

      <!-- Middle Row: Current Price centered in large text -->
      <div class="middle-row">
        <div class="current-price">{{ formatPrice(asset.liveData.currentPrice) }}</div>
      </div>

      <!-- Bottom Row: CMC Data with percentage limited to 2 decimals -->
      <div class="bottom-row">
        <div class="cmc-data" :class="{
          'positive': asset.cmc.cryptoPercentChange24h > 0,
          'negative': asset.cmc.cryptoPercentChange24h < 0,
          'neutral': asset.cmc.cryptoPercentChange24h === 0
        }">
          {{ formattedCryptoPercentChange }}%
        </div>
      </div>
    </div>

    <!-- Right Section (50% width) -->
    <div class="right-section">
      <!-- Current Possession in dollars -->
      <div class="current-possession">
        {{ formatPrice(asset.liveData.currentPossession) }}$
      </div>
      <!-- Profit difference with entry price info (only percentage is colored) -->
      <div class="profit-difference">
        <span :class="{
          'positive': asset.profit > 0,
          'negative': asset.profit < 0,
          'neutral': asset.profit === 0
        }">
          {{ formattedProfit }}%
        </span>
        <span> (entry price: {{ asset.orders.trade.averageEntryPrice }}$)</span>
      </div>
      <!-- Total Buy value (smaller text) -->
      <div class="total-buy">
        Total Buy: {{ formattedTotalBuy }}$
      </div>
      <!-- Total Sell value (smaller text) -->
      <div class="total-sell">
        Total Sell: {{ formattedTotalSell }}$
      </div>
      <!-- Total Amount in asset base (smaller text) -->
      <div class="total-amount">
        Total Amount: {{ asset.orders.trade.totalAmountBuy }} {{ asset.base }}
      </div>
      <!-- In Order amount in asset base (smaller text) -->
      <div class="in-order">
        In Order: {{ inOrderAmount }} {{ asset.base }}
      </div>
      <!-- Button to toggle details -->
      <div class="details-button">
        <Button :icon="isDetailsVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="expand-button"
          @click="toggleDetails" />
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
</style>
