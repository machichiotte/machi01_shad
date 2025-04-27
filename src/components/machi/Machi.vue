<!-- File: src/components/machi/Machi.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, shallowRef } from 'vue'
import { useCalculStore } from '../../store/calculStore'
import { useLiveDataStore } from '../../store/liveDataStore';

import { FilterMatchMode } from 'primevue/api'
import CardAsset from './card/CardAsset.vue'
import CardBalance from './card/CardBalance.vue'
import CardStableCoin from './card/CardStableCoin.vue'
import SearchBar from './SearchBar.vue'
import PlatformSelector from './PlatformSelector.vue'
import UpdateBarSelector from './UpdateBarSelector.vue'
import ActionSelector from './ActionSelector.vue'
import TradesTable from '../trade/TradesTable.vue'
import OrdersTable from '../order/OrdersTable.vue'
import { Filter } from '../../types/filter'
import { Asset, Trade, TradeTransformed } from '../../types/responseData'
import { debounce } from 'lodash-es'

const selectedBases = shallowRef<Asset[]>([])
const filters = ref<Filter>({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } })
const selectedPlatforms = shallowRef(['binance', 'kucoin', 'htx', 'okx', 'gateio'])

const calculStore = useCalculStore()
const liveDataStore = useLiveDataStore(); // Use the live data store

const tradesItems = computed(() => calculStore.getTrade)
const openOrdersItems = computed(() => calculStore.getOrder)
const machiItems = computed(() => calculStore.getMachi)

const filteredTrades = computed<TradeTransformed[]>(() => {
  return tradesItems.value
    .filter(item => {
      const searchValue = filters.value.global.value ? filters.value.global.value.toLowerCase() : ''
      return item.pair.toLowerCase().startsWith(searchValue) ||
        item.base.toLowerCase().startsWith(searchValue) ||
        item.quote.toLowerCase().startsWith(searchValue) ||
        item.platform.toLowerCase().startsWith(searchValue)
    })
    .map((item: Trade) => {
      let date: string
      let timestampVal = 0
      if (item.timestamp) {
        timestampVal = item.timestamp.toString().length <= 10 ? item.timestamp * 1000 : item.timestamp
        const formattedDate = new Date(timestampVal)
        const year = formattedDate.getFullYear()
        const month = String(formattedDate.getMonth() + 1).padStart(2, '0')
        const day = String(formattedDate.getDate()).padStart(2, '0')
        const hours = String(formattedDate.getHours()).padStart(2, '0')
        const minutes = String(formattedDate.getMinutes()).padStart(2, '0')
        const seconds = String(formattedDate.getSeconds()).padStart(2, '0')
        date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } else if (typeof item.dateUTC === 'string') {
        date = item.dateUTC
      } else {
        date = 'Invalid date'
      }
      const eqUsd = item.eqUSD !== null ? item.eqUSD : 0
      return {
        base: item.base,
        quote: item.quote,
        dateUTC: date,
        orderid: item.orderid,
        pair: item.pair,
        side: item.side,
        price: item.price,
        amount: item.amount,
        total: item.total,
        eqUSD: eqUsd,
        fee: item.fee,
        feecoin: item.feecoin,
        platform: item.platform,
        timestampVal
      } as TradeTransformed
    })
    .sort((a, b) => b.timestampVal - a.timestampVal)
})

const filteredMachiItems = computed(() => {
  const searchValue = filters.value.global.value?.toLowerCase() ?? ''
  const uniqueItems = new Map<string, boolean>()

  return machiItems.value.filter(item => {
    const key = `${item.base}-${item.platform}`
    if (uniqueItems.has(key)) return false
    const matchesPlatform = selectedPlatforms.value.includes(item.platform)
    const matchesSearch = !searchValue || Object.values(item).some(v => String(v).toLowerCase().includes(searchValue))
    if (matchesPlatform && matchesSearch) {
      uniqueItems.set(key, true)
      return true
    }
    return false
  })
})

const nonStableMachiItems = computed(() =>
  filteredMachiItems.value.filter(item => !item.tags.includes('stablecoin'))
)

const getData = async (): Promise<void> => {
  try {
    await calculStore.loadTrade()
    await calculStore.loadOrder()
    await calculStore.loadMachi()
    console.info('Data retrieved:', {
      trades: tradesItems.value.length,
      orders: openOrdersItems.value.length,
      machi: machiItems.value.length,
    })
  } catch (error) {
    console.error('An error occurred while retrieving data:', error)
  }
}

onMounted(async () => { await getData() })
const handleDeleteAction = (): void => { }
const updateSelectedBases = (newSelection: Asset[]): void => { selectedBases.value = newSelection }
const updateSelectedPlatforms = (newPlatforms: string[]): void => { selectedPlatforms.value = newPlatforms }

const isBottomExpanded = ref(false)
const activeBottomTab = ref<'trades' | 'orders'>('trades')

const isTopExpanded = ref(false)
const activeTopTab = ref<'platforms' | 'fetch' | 'action'>('platforms')

const itemsPerPage = 10
const currentPage = ref(1)
const loading = ref(false)

const paginatedMachiItems = computed(() => nonStableMachiItems .value.slice(0, currentPage.value * itemsPerPage))
const hasMoreItems = computed(() => currentPage.value * itemsPerPage < nonStableMachiItems .value.length)
const loadMore = () => { if (!loading.value && hasMoreItems.value) { loading.value = true; currentPage.value++; loading.value = false } }
const handleScroll = debounce(() => {
  if (loading.value) return
  const pos = window.innerHeight + window.scrollY
  const threshold = document.body.offsetHeight - 200
  if (pos >= threshold && hasMoreItems.value) loadMore()
}, 200)
onMounted(() => window.addEventListener('scroll', handleScroll))
onBeforeUnmount(() => window.removeEventListener('scroll', handleScroll))

const emit = defineEmits(['top-toggle-details', 'bottom-toggle-details'])

function toggleTopExpandCollapse() {
  isTopExpanded .value = !isTopExpanded .value
  emit('top-toggle-details', isTopExpanded .value)
}

function toggleBottomExpandCollapse() {
  isBottomExpanded.value = !isBottomExpanded.value
  emit('bottom-toggle-details', isBottomExpanded.value)
}
</script>

<template>
  <div class="main-container">
    <div class="top-tab-container" :class="{ expanded: isTopExpanded }">
      <div class="top-tab-header">
        <div class="top-tab-menu">
          <Button label="Platform Selector" @click="activeTopTab = 'platforms'"
            :class="{ active: activeTopTab === 'platforms' }" />
          <Button label="Update data" @click="activeTopTab = 'fetch'" :class="{ active: activeTopTab === 'fetch' }" />
          <Button label="Actions" @click="activeTopTab = 'action'" :class="{ active: activeTopTab === 'action' }" />

          <Button :icon="isTopExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="expand-collapse-button"
            @click="toggleTopExpandCollapse" />
        </div>
        <SearchBar :filters="filters" />
      </div>
      <div class="top-tab-content">
        <PlatformSelector v-if="activeTopTab === 'platforms'" :initialSelectedPlatforms="selectedPlatforms"
          @update:selectedPlatforms="updateSelectedPlatforms" />
        <UpdateBarSelector v-if="activeTopTab === 'fetch'" />
        <ActionSelector v-if="activeTopTab === 'action'" :selectedBases="selectedBases" :filters="filters"
          @delete:action="handleDeleteAction" />
      </div>
    </div>

    <div class="content-container">
      <Toolbar class="mb-4"><template #end></template></Toolbar>
      <div class="card-container">
          <CardBalance :assets="filteredMachiItems" />
          <CardStableCoin :assets="filteredMachiItems" />
      </div>
      <div class="asset-card-container">
          <CardAsset
          v-for="item in paginatedMachiItems"
          :key="`${item.base}-${item.platform}`"
          :asset="item"
          :trades="tradesItems"
          :orders="openOrdersItems"
          :available-markets="liveDataStore.getMarketsForBase(item.base)"
          @update:selectedBases="updateSelectedBases"
        />
        <div v-if="loading">Loading more items...</div>
      </div>
    </div>

    <div class="bottom-tab-container" :class="{ expanded: isBottomExpanded }">
      <div class="bottom-tab-header">
        <div class="bottom-tab-menu">
          <Button label="Trades" @click="activeBottomTab = 'trades'" :class="{ active: activeBottomTab === 'trades' }" />
          <Button label="Orders" @click="activeBottomTab = 'orders'" :class="{ active: activeBottomTab === 'orders' }" />
          <Button :icon="isBottomExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" class="expand-collapse-button"
            @click="toggleBottomExpandCollapse" />

        </div>
      </div>
      <div class="bottom-tab-content">
        <TradesTable v-if="activeBottomTab === 'trades'" :rows="filteredTrades" :filters="filters" />
        <OrdersTable v-if="activeBottomTab === 'orders'" :rows="openOrdersItems" :filters="filters" />
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-button) {
  background-color: var(--surface-card) !important;
  border-color: var(--surface-card) !important;
  color: var(--text-color) !important;
  box-shadow: none;
}

:deep(.p-button.active) {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: var(--primary-color-text) !important;
}

.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content-container {
  background: var(--surface-card);
  border-radius: 4px;
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - var(--top-bar-height) - var(--bottom-bar-height));
  transition: height 0.3s;
}


.card-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.card-container>* {
  flex: 0 0 400px;
}

.asset-card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--surface-ground);
}

.top-tab-container,
.bottom-tab-container {
  position: sticky;
  z-index: 10;
  width: 100%;
  background: var(--surface-card);
  border: 1px solid var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: max-height 0.3s;
}

.top-tab-container {
  top: 0;
  --bar-height: var(--top-bar-height);
  max-height: var(--top-bar-height, 80px);
}

.top-tab-container.expanded {
  max-height: var(--top-bar-height, 160px);
}

.bottom-tab-container {
  bottom: 0;
  --bar-height: var(--bottom-bar-height);
  max-height: var(--bottom-bar-height, 56px);
}

.bottom-tab-container.expanded {
  max-height: var(--bottom-bar-height, 300px);
}

.top-tab-header,
.bottom-tab-header {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  justify-content: space-between;
}

.top-tab-menu .bottom-tab-menu {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.top-tab-content .bottom-tab-content {
  padding: 0.5rem;
  overflow-y: auto;
  flex: 1;
}

.expand-collapse-button .pi {
  transition: transform 0.3s;
}

.top-tab-container.expanded .expand-collapse-button .pi,
.bottom-tab-container.expanded .expand-collapse-button .pi {
  transform: rotate(180deg);
}
</style>
