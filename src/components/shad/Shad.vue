<template>
  <div class="shad-container">
    <!-- Top Expandable Container -->
    <div class="top-tab-container" :class="{ expanded: isTopExpanded }">
      <div class="tab-header">
        <Button label="Platform Selector" @click="activeTopTab = 'platforms'" :class="{ active: activeTopTab === 'platforms' }" />
        <Button label="Update data" @click="activeTopTab = 'fetch'" :class="{ active: activeTopTab === 'fetch' }" />
        <Button icon="pi pi-chevron-down" @click="toggleTopExpandCollapse" class="expand-collapse-button" />
      </div>
      <div class="tab-content">
        <PlatformSelector v-if="activeTopTab === 'platforms'" :initialSelectedPlatforms="selectedPlatforms" @update:selectedPlatforms="updateSelectedPlatforms" />
        <UpdateBarSelector v-if="activeTopTab === 'fetch'" />
      </div>
    </div>

    <!-- Main Shad Data Table -->
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <MyBunchSellButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length" :model="allRows" />
          <MyEmergencySellButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length" :model="allRows" />
          <MyBuyButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length" :model="allRows" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedAssets || !selectedAssets.length" />
        </template>
        <template #end>
          <div class="flex justify-content-end">
            <SearchBar :filters="filters" />
          </div>
        </template>
      </Toolbar>
      <ShadDataTable :items="filteredShadItems" :filters="filters" @update:selectedAssets="updateSelectedAssets" />
    </div>

    <!-- Fixed Bottom Tab Container -->
    <div class="bottom-tab-container" :class="{ expanded: isBottomExpanded }">
      <div class="tab-header">
        <Button label="Trades" @click="activeTab = 'trades'" :class="{ active: activeTab === 'trades' }" />
        <Button label="Orders" @click="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }" />
        <Button label="Buy Calculator" @click="activeTab = 'buyCalculator'" :class="{ active: activeTab === 'buyCalculator' }" />
        <Button icon="pi pi-chevron-up" @click="toggleExpandCollapse" class="expand-collapse-button" />
      </div>
      <div class="tab-content">
        <TradesTable v-if="activeTab === 'trades'" :items="tradesItems" :filters="filters" />
        <OrdersTable v-if="activeTab === 'orders'" :items="openOrdersItems" :filters="filters" />
        <BuyCalculator v-if="activeTab === 'buyCalculator'" :selectedAssets="selectedAssets" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { FilterMatchMode } from 'primevue/api'
import MyEmergencySellButton from '../buttons/MyEmergencySellButton.vue'
import MyBunchSellButton from '../buttons/MyBunchSellButton.vue'
import MyBuyButton from '../buttons/MyBuyButton.vue'
import ShadDataTable from './ShadDataTable.vue'
import SearchBar from './SearchBar.vue'
import TradesTable from '../trades/TradesTable.vue'
import OrdersTable from '../orders/OrdersTable.vue'
import PlatformSelector from './PlatformSelector.vue'
import UpdateBarSelector from './UpdateBarSelector.vue'
import BuyCalculator from './BuyCalculator.vue'

import {
  FETCH_SHAD, FETCH_TRADES, FETCH_ORDERS,
  GET_ORDERS, GET_SHAD, GET_TRADES
} from '../../store/storeconstants'

const store = useStore()

const selectedAssets = ref([])
const shad = ref([])
const trades = ref([])
const openOrders = ref([])

const showOverlay = ref(false)
const selectedAsset = ref()
const allRows = ref()
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const selectedPlatforms = ref(['binance', 'kucoin', 'htx', 'okx', 'gateio'])

const shadItems = computed(() => shad.value && shad.value.length > 0 ? shad.value : [])

const filteredShadItems = computed(() => shadItems.value.filter(item => selectedPlatforms.value.includes(item.platform)))

const tradesItems = computed(() => trades.value && trades.value.length > 0 ? trades.value : [])

const openOrdersItems = computed(() => openOrders.value && openOrders.value.length > 0 ? openOrders.value : [])

onMounted(async () => {
  try {
    await store.dispatch('calcul/' + FETCH_SHAD)
    await store.dispatch('calcul/' + FETCH_TRADES)
    await store.dispatch('calcul/' + FETCH_ORDERS)
    shad.value = await store.getters['calcul/' + GET_SHAD]
    trades.value = await store.getters['calcul/' + GET_TRADES]
    openOrders.value = await store.getters['calcul/' + GET_ORDERS]
    console.log("Données Shad récupérées:", shad.value.length)
    console.log("Données Trades récupérées:", trades.value.length)
    console.log("Données Orders récupérées:", openOrders.value.length)
  } catch (e) {
    console.error("Une erreur s'est produite lors de la récupération des données :", e)
  }
})

const confirmDeleteSelected = () => {
  deleteProductsDialog.value = true
}

function updateSelectedAssets(newSelection) {
  selectedAssets.value = newSelection
}

function updateSelectedPlatforms(newPlatforms) {
  selectedPlatforms.value = newPlatforms
}

const isBottomExpanded = ref(false)
const activeTab = ref('trades')

function toggleExpandCollapse() {
  isBottomExpanded.value = !isBottomExpanded.value
}

const isTopExpanded = ref(false)
const activeTopTab = ref('platforms')

function toggleTopExpandCollapse() {
  isTopExpanded.value = !isTopExpanded.value
}
</script>

<style scoped>
.shad-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.card {
  background: var(--surface-card);
  padding: 0rem;
  border-radius: 4px;
  flex-grow: 1;
  overflow: auto;
  /* Adjust height dynamically based on top and bottom containers' expansion */
  height: calc(100vh - 40px - 40px); /* Default height when both are collapsed */
  transition: height 0.3s ease;
}

.top-tab-container {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--border-color);
  transition: height 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.top-tab-container.expanded {
  height: 100px;
}

.top-tab-container:not(.expanded) {
  height: 40px;
}

.bottom-tab-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--surface-card);
  border-top: 1px solid var(--border-color);
  transition: height 0.3s ease;
  overflow: hidden;
}

.bottom-tab-container.expanded {
  height: 300px;
}

.bottom-tab-container:not(.expanded) {
  height: 40px;
}

.expand-collapse-button {
  margin-left: auto;
}
</style>
