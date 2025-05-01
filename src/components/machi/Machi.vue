<script setup lang="ts">
import { ref, onMounted, computed, shallowRef, watch } from 'vue'
import { useCalculStore } from '../../store/calculStore'
import { useLiveDataStore } from '../../store/liveDataStore';

import { FilterMatchMode } from 'primevue/api'
import Paginator, { type PageState } from 'primevue/paginator';
import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
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
import { Asset, Order, Trade, TradeTransformed } from '../../types/responseData'

const selectedBases = shallowRef<Asset[]>([])
const filters = ref<Filter>({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } })
const selectedPlatforms = shallowRef<string[]>(['binance', 'kucoin', 'htx', 'okx', 'gateio'])
const isLoadingData = ref<boolean>(true);

const calculStore = useCalculStore()
const liveDataStore = useLiveDataStore();

const tradesItems = computed<Trade[]>(() => calculStore.getTrade)
const openOrdersItems = computed<Order[]>(() => calculStore.getOrder)
const machiItems = computed<Asset[]>(() => calculStore.getMachi)

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
    .map((item: Trade): TradeTransformed => {
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
      }
    })
    .sort((a, b) => b.timestampVal - a.timestampVal)
})

const filteredMachiItems = computed<Asset[]>(() => {
  const searchValue = filters.value.global.value?.toLowerCase() ?? ''
  const uniqueItems = new Map<string, boolean>()

  return machiItems.value.filter(item => {
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

const nonStableMachiItems = computed<Asset[]>(() =>
  filteredMachiItems.value.filter(item => !(item.tags && item.tags.includes('stablecoin')))
)

const getData = async (): Promise<void> => {
  isLoadingData.value = true;
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

const isBottomExpanded = ref<boolean>(false)
const activeBottomTab = ref<'trades' | 'orders'>('trades')
const isTopExpanded = ref<boolean>(false)
const activeTopTab = ref<'platforms' | 'fetch' | 'action'>('platforms')

const itemsPerPage = ref<number>(100);
const firstRecordIndex = ref<number>(0);

const totalMachiItems = computed<number>(() => nonStableMachiItems.value.length);

const paginatedMachiItems = computed<Asset[]>(() => {
  const start = firstRecordIndex.value;
  const end = start + itemsPerPage.value;
  return nonStableMachiItems.value.slice(start, end);
});

const onPage = (event: PageState): void => {
  firstRecordIndex.value = event.first;
  itemsPerPage.value = event.rows;
};

watch([filters, selectedPlatforms, machiItems], () => {
    const newTotalPages = Math.ceil(nonStableMachiItems.value.length / itemsPerPage.value);
    const currentPageNum = Math.floor(firstRecordIndex.value / itemsPerPage.value);
    if (currentPageNum >= newTotalPages && newTotalPages > 0) {
        firstRecordIndex.value = Math.max(0, newTotalPages - 1) * itemsPerPage.value;
    } else if (firstRecordIndex.value !== 0 && nonStableMachiItems.value.length > 0 && paginatedMachiItems.value.length === 0) {
         firstRecordIndex.value = 0;
    } else if (nonStableMachiItems.value.length === 0) {
        firstRecordIndex.value = 0;
    }
}, { deep: true });

const emit = defineEmits(['top-toggle-details', 'bottom-toggle-details'])

function toggleTopExpandCollapse(): void {
  isTopExpanded.value = !isTopExpanded.value
  emit('top-toggle-details', isTopExpanded.value)
}

function toggleBottomExpandCollapse(): void {
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
            @click="toggleTopExpandCollapse" aria-label="Toggle top panel"/>
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

       <div v-if="isLoadingData" class="p-p-3 text-center text-color-secondary">
         Chargement des données...
       </div>

       <div v-else>

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
            </div>

            <div v-if="!isLoadingData && totalMachiItems === 0" class="p-p-3 text-center text-color-secondary">
                Aucun asset à afficher correspondant aux filtres actuels.
           </div>
            <div v-else-if="!isLoadingData && totalMachiItems > 0 && paginatedMachiItems.length === 0" class="p-p-3 text-center text-color-secondary">
                Aucun asset à afficher sur cette page.
           </div>


            <Paginator
                v-if="totalMachiItems > itemsPerPage"
                :rows="itemsPerPage"
                :totalRecords="totalMachiItems"
                :first="firstRecordIndex"
                @page="onPage"
                :rowsPerPageOptions="[10, 20, 50, 100]"
                template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} assets"
                class="p-mt-3 surface-ground"
            />
       </div>
    </div>

    <div class="bottom-tab-container" :class="{ expanded: isBottomExpanded }">
      <div class="bottom-tab-header">
        <div class="bottom-tab-menu">
          <Button label="Trades" @click="activeBottomTab = 'trades'" :class="{ active: activeBottomTab === 'trades' }" />
          <Button label="Orders" @click="activeBottomTab = 'orders'" :class="{ active: activeBottomTab === 'orders' }" />
          <Button :icon="isBottomExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" class="expand-collapse-button"
            @click="toggleBottomExpandCollapse" aria-label="Toggle bottom panel"/>
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

.card-container > * {
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
  --top-bar-height: 60px;
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

.top-tab-header > .p-inputgroup {
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

.text-center {
    text-align: center;
}
.text-color-secondary {
    color: var(--secondary-text);
}
.p-p-3 {
    padding: 1rem; 
}
.p-mb-3 {
    margin-bottom: 1rem;
}
.p-mt-3 {
    margin-top: 1rem;
}
</style>
