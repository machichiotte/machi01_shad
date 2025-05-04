// File: src/components/dashboard/DashboardView.vue

<script setup lang="ts">
import { ref, onMounted, computed, shallowRef, watch } from 'vue'
import { useCalculStore } from '../../store/calculStore'
import { useLiveDataStore } from '../../store/liveDataStore';

import { FilterMatchMode } from 'primevue/api'
import Paginator, { type PageState } from 'primevue/paginator';
import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import AssetPanel from './card/AssetPanel.vue'
import CardBalance from './card/CardBalance.vue'
import CardStableCoin from './card/CardStableCoin.vue'
import SearchBar from './SearchBar.vue'
import PlatformSelector from './PlatformSelector.vue'
import UpdateBarSelector from './UpdateBarSelector.vue'
import ActionSelector from './ActionSelector.vue'
import TradesTable from '../trade/TradesTable.vue'
import OrdersTable from '../order/OrdersTable.vue'
import { Filter } from '../../types/filter'
import { Asset, Order, Trade, TradeTransformed } from '../../types/responseData'

const selectedBases = shallowRef<Asset[]>([])
const filters = ref<Filter>({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } })
const selectedPlatforms = shallowRef<string[]>(['binance', 'kucoin', 'htx', 'okx', 'gateio'])
const isLoadingData = ref<boolean>(true);

const calculStore = useCalculStore()
const liveDataStore = useLiveDataStore();

const tradesItems = computed<Trade[]>(() => calculStore.getTrade)
const openOrdersItems = computed<Order[]>(() => calculStore.getOrder)
const dashboardItems = computed<Asset[]>(() => calculStore.getDashboard)

function formatTimestampToDateString(timestamp?: number, fallback?: string): string {
  if (timestamp) {
    const ts = timestamp.toString().length <= 10 ? timestamp * 1000 : timestamp
    const d = new Date(ts)
    return d.toISOString().replace('T', ' ').split('.')[0] // format YYYY-MM-DD HH:mm:ss
  }
  return fallback ?? 'Invalid date'
}

const filteredTrades = computed<TradeTransformed[]>(() => {
  return tradesItems.value
    .filter(item => {
      const searchValue = filters.value.global.value ? filters.value.global.value.toLowerCase() : ''
      return !searchValue ||
        item.pair.toLowerCase().startsWith(searchValue) ||
        item.base.toLowerCase().startsWith(searchValue) ||
        item.quote.toLowerCase().startsWith(searchValue) ||
        item.platform.toLowerCase().startsWith(searchValue)
    })
    .map(item => ({
      ...item,
      dateUTC: formatTimestampToDateString(item.timestamp, item.dateUTC),
      eqUSD: item.eqUSD ?? 0,
      timestampVal: item.timestamp ? (item.timestamp.toString().length <= 10 ? item.timestamp * 1000 : item.timestamp) : 0
    }))
    .sort((a, b) => b.timestampVal - a.timestampVal)
})

const dashboardFilteredItems = computed<Asset[]>(() => {
  const searchValue = filters.value.global.value?.toLowerCase() ?? ''
  const uniqueItems = new Map<string, boolean>()

  return dashboardItems.value.filter(item => {
    const key = `${item.base}-${item.platform}`
    if (uniqueItems.has(key)) return false

    const matchesPlatform = selectedPlatforms.value.includes(item.platform)
    const matchesSearch = !searchValue ||
      item.base.toLowerCase().includes(searchValue) ||
      item.platform.toLowerCase().includes(searchValue) ||
      (item.name && item.name.toLowerCase().includes(searchValue)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchValue)))

    if (matchesPlatform && matchesSearch) {
      uniqueItems.set(key, true)
      return true
    }
    return false
  })
})

const dashboardNonStableItems = computed<Asset[]>(() =>
  dashboardFilteredItems.value.filter(item => !(item.tags && item.tags.includes('stablecoin')))
)

const getData = async (): Promise<void> => {
  isLoadingData.value = true;
  try {
    await calculStore.loadTrade()
    await calculStore.loadOrder()
    await calculStore.loadDashboard()
    console.info('Data retrieved:', {
      trades: tradesItems.value.length,
      orders: openOrdersItems.value.length,
      dashboard: dashboardItems.value.length,
    })
  } catch (error) {
    console.error('An error occurred while retrieving data:', error)
  } finally {
    isLoadingData.value = false;
  }
}

onMounted(async () => { await getData() })

const handleDeleteAction = (): void => {
  console.log('Delete action triggered');
}
const updateSelectedBases = (newSelection: Asset[]): void => {
  selectedBases.value = newSelection
}
const updateSelectedPlatforms = (newPlatforms: string[]): void => {
  selectedPlatforms.value = newPlatforms
}

const isBottomPanelExpanded = ref<boolean>(false)
const activeBottomPanelTab = ref<'trades' | 'orders'>('trades')
const isTopPanelExpanded = ref<boolean>(false)
const activeTopPanelTab = ref<'platforms' | 'fetch' | 'action'>('platforms')

const itemsPerPage = ref<number>(100);
const firstRecordIndex = ref<number>(0);

const dashboardTotalItems = computed<number>(() => dashboardNonStableItems.value.length);

const dashboardPaginatedItems = computed<Asset[]>(() => {
  const start = firstRecordIndex.value;
  const end = start + itemsPerPage.value;
  return dashboardNonStableItems.value.slice(start, end);
});

const onPage = (event: PageState): void => {
  firstRecordIndex.value = event.first;
  itemsPerPage.value = event.rows;
};

watch([filters, selectedPlatforms, dashboardItems], () => {
  const newTotalPages = Math.ceil(dashboardNonStableItems.value.length / itemsPerPage.value);
  const currentPageNum = Math.floor(firstRecordIndex.value / itemsPerPage.value);
  if (currentPageNum >= newTotalPages && newTotalPages > 0) {
    firstRecordIndex.value = Math.max(0, newTotalPages - 1) * itemsPerPage.value;
  } else if (firstRecordIndex.value !== 0 && dashboardNonStableItems.value.length > 0 && dashboardPaginatedItems.value.length === 0) {
    firstRecordIndex.value = 0;
  } else if (dashboardNonStableItems.value.length === 0) {
    firstRecordIndex.value = 0;
  }
}, { deep: true });

const emit = defineEmits<{
  (e: 'top-toggle-details', value: boolean): void
  (e: 'bottom-toggle-details', value: boolean): void
}>()

function toggleTopExpandCollapse(): void {
  isTopPanelExpanded.value = !isTopPanelExpanded.value
  emit('top-toggle-details', isTopPanelExpanded.value)
}

function toggleBottomExpandCollapse(): void {
  isBottomPanelExpanded.value = !isBottomPanelExpanded.value
  emit('bottom-toggle-details', isBottomPanelExpanded.value)
}
</script>

<template>
  <div class="main-container">
    <div class="top-tab-container" :class="{ expanded: isTopPanelExpanded }">
      <div class="top-tab-header">
        <div class="top-tab-menu">
          <Button label="Platform Selector" @click="activeTopPanelTab = 'platforms'"
            :class="{ active: activeTopPanelTab === 'platforms' }" />
          <Button label="Update data" @click="activeTopPanelTab = 'fetch'" :class="{ active: activeTopPanelTab === 'fetch' }" />
          <Button label="Actions" @click="activeTopPanelTab = 'action'" :class="{ active: activeTopPanelTab === 'action' }" />

          <Button :icon="isTopPanelExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="expand-collapse-button"
            @click="toggleTopExpandCollapse" aria-label="Toggle top panel" />
        </div>
        <SearchBar :filters="filters" />
      </div>
      <div class="top-tab-content">
        <PlatformSelector v-if="activeTopPanelTab === 'platforms'" :initialSelectedPlatforms="selectedPlatforms"
          @update:selectedPlatforms="updateSelectedPlatforms" />
        <UpdateBarSelector v-if="activeTopPanelTab === 'fetch'" />
        <ActionSelector v-if="activeTopPanelTab === 'action'" :selectedBases="selectedBases" :filters="filters"
          @delete:action="handleDeleteAction" />
      </div>
    </div>

    <div class="content-container">
      <Toolbar class="mb-4"><template #end></template></Toolbar>
      <div class="card-container">
        <CardBalance :assets="dashboardFilteredItems" />
        <CardStableCoin :assets="dashboardFilteredItems" />
      </div>

      <div v-if="isLoadingData" class="p-p-3">
        <Message severity="info" :closable="false" class="info-message">
          <span>Chargement des données...</span>
        </Message>
      </div>

      <div v-else>

        <Paginator v-if="dashboardTotalItems > itemsPerPage" :rows="itemsPerPage" :totalRecords="dashboardTotalItems"
          :first="firstRecordIndex" @page="onPage" :rowsPerPageOptions="[10, 20, 50, 100]"
          template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} assets"
          class="p-mt-3" />

        <div class="asset-card-container">
          <AssetPanel v-for="item in dashboardPaginatedItems" :key="`${item.base}-${item.platform}`" :asset="item"
            :trades="tradesItems" :orders="openOrdersItems"
            :available-markets="liveDataStore.getMarketsForBase(item.base)"
            @update:selectedBases="updateSelectedBases" />
        </div>

        <div v-if="!isLoadingData && dashboardTotalItems === 0" class="p-p-3">
          <Message severity="error" :closable="false" class="error-message">
            <span>Aucun asset à afficher correspondant aux filtres actuels.</span>
          </Message>
        </div>
        <div v-else-if="!isLoadingData && dashboardTotalItems > 0 && dashboardPaginatedItems.length === 0"
          class="p-p-3">
          <Message severity="error" :closable="false" class="error-message">
            <span>Aucun asset à afficher sur cette page.</span>
          </Message>
          
        </div>

        
      </div>
    </div>

    <div class="bottom-tab-container" :class="{ expanded: isBottomPanelExpanded }">
      <div class="bottom-tab-header">
        <div class="bottom-tab-menu">
          <Button label="Trades" @click="activeBottomPanelTab = 'trades'"
            :class="{ active: activeBottomPanelTab === 'trades' }" />
          <Button label="Orders" @click="activeBottomPanelTab = 'orders'"
            :class="{ active: activeBottomPanelTab === 'orders' }" />
          <Button :icon="isBottomPanelExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" class="expand-collapse-button"
            @click="toggleBottomExpandCollapse" aria-label="Toggle bottom panel" />
        </div>
      </div>
      <div class="bottom-tab-content">
        <TradesTable v-if="activeBottomPanelTab === 'trades'" :rows="filteredTrades" :filters="filters" />
        <OrdersTable v-if="activeBottomPanelTab === 'orders'" :rows="openOrdersItems" :filters="filters" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content-container {
  border-radius: 4px;
  flex: 1;
  overflow-y: auto;
  transition: var(--transition-duration) ease-in-out;
  display: flex;
  flex-direction: column;
}

.card-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  flex-wrap: wrap;
}

.card-container>* {
  flex: 0 0 400px;
  max-width: 100%;
}

.asset-card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(800px, 1fr));
  gap: 0.5rem;
  padding: 0.5rem;
  flex-grow: 1;
  min-height: 200px;
}

.top-tab-container,
.bottom-tab-container {
  position: sticky;
  z-index: 10;
  width: 100%;
  background: var(--tab-bg);
  border: 1px solid var(--tab-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: max-height 0.3s ease-in-out;
  flex-shrink: 0;
}

.top-tab-container {
  top: 0;
  border-bottom: 1px solid var(--tab-border);
  max-height: var(--top-bar-height);
}

.top-tab-container.expanded {
  max-height: var(--top-bar-expanded-height);
}

.bottom-tab-container {
  bottom: 0;
  border-top: 1px solid var(--tab-border);
  max-height: var(--bottom-bar-height);
}

.bottom-tab-container.expanded {
  max-height: var(--bottom-bar-expanded-height);
}

.top-tab-header,
.bottom-tab-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  justify-content: space-between;
  flex-shrink: 0;
  min-height: var(--bottom-bar-height);
}

.top-tab-header {
  min-height: var(--top-bar-height);
}

.top-tab-menu,
.bottom-tab-menu {
  display: flex;
  gap: 0.5rem;
  flex-grow: 1;
  justify-content: flex-start;
}

.top-tab-header>.p-inputgroup {
  max-width: 300px;
  flex-shrink: 1;
}

.top-tab-content,
.bottom-tab-content {
  padding: 0.5rem 1rem;
  overflow-y: auto;
  flex-grow: 1;
}

.expand-collapse-button {
  margin-left: auto;
}

.expand-collapse-button .pi {
  transition: transform var(--transition-duration) ease-in-out;
}

.top-tab-container.expanded .expand-collapse-button .pi-chevron-down,
.bottom-tab-container.expanded .expand-collapse-button .pi-chevron-up {
  transform: rotate(180deg);
}
</style>
