<script setup lang="ts">
import { ref, onMounted, computed, shallowRef, watch } from 'vue' // Removed onBeforeUnmount
import { useCalculStore } from '../../store/calculStore'
import { useLiveDataStore } from '../../store/liveDataStore';

import { FilterMatchMode } from 'primevue/api'
import Paginator, { type PageState } from 'primevue/paginator'; // Import Paginator and PageState type
import Button from 'primevue/button'; // Assuming Button is used, ensure it's imported
import Toolbar from 'primevue/toolbar'; // Assuming Toolbar is used
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
import { Asset, Order, Trade, TradeTransformed } from '../../types/responseData' // Add Order type if needed by OrdersTable

// --- Component State ---
const selectedBases = shallowRef<Asset[]>([])
const filters = ref<Filter>({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } })
const selectedPlatforms = shallowRef<string[]>(['binance', 'kucoin', 'htx', 'okx', 'gateio'])
const isLoadingData = ref<boolean>(true); // Added for initial loading state message

// --- Stores ---
const calculStore = useCalculStore()
const liveDataStore = useLiveDataStore();

// --- Data from Store ---
const tradesItems = computed<Trade[]>(() => calculStore.getTrade)
const openOrdersItems = computed<Order[]>(() => calculStore.getOrder) // Assuming Order type
const machiItems = computed<Asset[]>(() => calculStore.getMachi)

// --- Filtered Trades (example, assuming full logic exists) ---
const filteredTrades = computed<TradeTransformed[]>(() => {
  return tradesItems.value
    .filter(item => {
      const searchValue = filters.value.global.value ? filters.value.global.value.toLowerCase() : ''
      // Example filter logic: Adjust based on your actual needs
      return !searchValue ||
        item.pair.toLowerCase().startsWith(searchValue) ||
        item.base.toLowerCase().startsWith(searchValue) ||
        item.quote.toLowerCase().startsWith(searchValue) ||
        item.platform.toLowerCase().startsWith(searchValue)
    })
    .map((item: Trade): TradeTransformed => { // Explicit return type
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
      } // Removed 'as TradeTransformed' by adding explicit return type
    })
    .sort((a, b) => b.timestampVal - a.timestampVal)
})

// --- Filtered Machi Items based on platform and search ---
const filteredMachiItems = computed<Asset[]>(() => {
  const searchValue = filters.value.global.value?.toLowerCase() ?? ''
  const uniqueItems = new Map<string, boolean>()

  return machiItems.value.filter(item => {
    const key = `${item.base}-${item.platform}` // Ensure unique key combination
    if (uniqueItems.has(key)) return false // Skip duplicates based on base+platform

    const matchesPlatform = selectedPlatforms.value.includes(item.platform)
    const matchesSearch = !searchValue ||
                          item.base.toLowerCase().includes(searchValue) ||
                          item.platform.toLowerCase().includes(searchValue) ||
                          (item.name && item.name.toLowerCase().includes(searchValue)) || // Optional: search in name if exists
                          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchValue))); // Optional: search in tags

    if (matchesPlatform && matchesSearch) {
       uniqueItems.set(key, true)
       return true
    }
    return false
  })
})

// --- Non-Stable Machi Items (to be paginated) ---
const nonStableMachiItems = computed<Asset[]>(() =>
  filteredMachiItems.value.filter(item => !(item.tags && item.tags.includes('stablecoin')))
)

// --- Data Fetching ---
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
    // Handle error display to user if necessary
  } finally {
    isLoadingData.value = false;
  }
}

onMounted(async () => { await getData() })

// --- Action Handlers ---
const handleDeleteAction = (): void => {
  console.log('Delete action triggered');
  // Implement actual delete logic here
}
const updateSelectedBases = (newSelection: Asset[]): void => {
  selectedBases.value = newSelection
}
const updateSelectedPlatforms = (newPlatforms: string[]): void => {
  selectedPlatforms.value = newPlatforms
}

// --- Expand/Collapse State for Tabs ---
const isBottomExpanded = ref<boolean>(false)
const activeBottomTab = ref<'trades' | 'orders'>('trades')
const isTopExpanded = ref<boolean>(false)
const activeTopTab = ref<'platforms' | 'fetch' | 'action'>('platforms')

// --- Pagination State ---
const itemsPerPage = ref<number>(100); // Rows per page
const firstRecordIndex = ref<number>(0); // Index of the first item on the current page

// --- Total Items for Pagination ---
const totalMachiItems = computed<number>(() => nonStableMachiItems.value.length);

// --- Paginated Items Calculation (Current Page Only) ---
const paginatedMachiItems = computed<Asset[]>(() => {
  const start = firstRecordIndex.value;
  const end = start + itemsPerPage.value;
  return nonStableMachiItems.value.slice(start, end);
});

// --- Page Change Handler ---
const onPage = (event: PageState): void => {
  // PageState provides { first: number, rows: number, page: number, pageCount: number }
  firstRecordIndex.value = event.first;
  itemsPerPage.value = event.rows;
};

// --- Watch for filter changes to reset pagination ---
watch([filters, selectedPlatforms, machiItems], () => {
    // Reset to first page whenever the underlying data or filters change
    // Check if current page becomes invalid
    const newTotalPages = Math.ceil(nonStableMachiItems.value.length / itemsPerPage.value);
    const currentPageNum = Math.floor(firstRecordIndex.value / itemsPerPage.value);
    if (currentPageNum >= newTotalPages && newTotalPages > 0) {
        // If current page is now out of bounds, go to the new last page
        firstRecordIndex.value = Math.max(0, newTotalPages - 1) * itemsPerPage.value;
    } else if (firstRecordIndex.value !== 0 && nonStableMachiItems.value.length > 0 && paginatedMachiItems.value.length === 0) {
        // Or simply reset to page 0 if the current page ends up empty (e.g., going from many items to few)
         firstRecordIndex.value = 0;
    } else if (nonStableMachiItems.value.length === 0) {
        // Handle case where filters result in zero items
        firstRecordIndex.value = 0;
    }
    // If filters change but current page is still valid, we might choose *not* to reset,
    // but resetting is usually safer UX. Let's reset:
    // firstRecordIndex.value = 0; // Uncomment this line for strict reset on every filter change

}, { deep: true }); // Use deep watch for filters object

// --- Emit Definitions ---
const emit = defineEmits(['top-toggle-details', 'bottom-toggle-details'])

// --- Toggle Functions ---
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
/* Deep selectors for PrimeVue components */
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

/* Paginator specific styling */
:deep(.p-paginator.surface-ground) {
  background-color: var(--surface-ground) !important; /* Match asset container background */
  border: none !important; /* Remove border if desired */
  border-radius: 0 !important; /* Remove border-radius if needed */
}
/* Optional: Style paginator elements if needed for theme consistency */
:deep(.p-paginator .p-paginator-current),
:deep(.p-paginator .p-dropdown .p-dropdown-label),
:deep(.p-paginator .p-paginator-page),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last),
:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev) {
    color: var(--text-color-secondary); /* Example: Adjust color */
}
:deep(.p-paginator .p-paginator-page.p-highlight) {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--primary-color-text);
}

/* Layout Styles */
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
}

.content-container {
  background: var(--surface-card);
  border-radius: 4px;
  flex: 1; /* Takes remaining vertical space */
  overflow-y: auto; /* Allows content scrolling */
  /* Adjusted height calculation might not be needed if flex: 1 works */
  /* height: calc(100vh - var(--top-bar-height) - var(--bottom-bar-height)); */
  transition: height var(--transition-duration) ease-in-out; /* Smooth height transition */
  display: flex;
  flex-direction: column; /* Ensure paginators stay at top/bottom */
}


.card-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem; /* Add some padding */
  flex-wrap: wrap; /* Allow wrapping if space is limited */
}

.card-container > * {
  flex: 0 0 400px; /* Maintain fixed width for balance/stablecoin cards */
   max-width: 100%; /* Ensure they don't overflow container */
}

.asset-card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(800px, 1fr));
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--surface-ground);
  flex-grow: 1; /* Allow grid to take available space if content is short */
  min-height: 200px; /* Prevent collapsing when empty */
}

/* Sticky Tab Containers */
.top-tab-container,
.bottom-tab-container {
  position: sticky; /* Make tabs stick */
  z-index: 10;
  width: 100%;
  background: var(--surface-card);
  border: 1px solid var(--border-color, #444); /* Added default border color */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: max-height 0.3s ease-in-out; /* Smoother transition */
  flex-shrink: 0; /* Prevent tabs from shrinking */
}

.top-tab-container {
  top: 0;
  border-bottom: 1px solid var(--border-color, #444);
  --top-bar-height: 60px; /* Example fixed height for collapsed */
  max-height: var(--top-bar-height);
}

.top-tab-container.expanded {
  --top-bar-expanded-height: 180px; /* Example expanded height */
  max-height: var(--top-bar-expanded-height);
}

.bottom-tab-container {
  bottom: 0;
  border-top: 1px solid var(--border-color, #444);
   --bottom-bar-height: 56px; /* Example fixed height for collapsed */
  max-height: var(--bottom-bar-height);
}

.bottom-tab-container.expanded {
   --bottom-bar-expanded-height: 350px; /* Example expanded height */
  max-height: var(--bottom-bar-expanded-height);
}

.top-tab-header,
.bottom-tab-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem; /* Added horizontal padding */
  justify-content: space-between;
  flex-shrink: 0; /* Prevent header from shrinking */
   min-height: var(--bottom-bar-height); /* Ensure header has minimum height */
}
.top-tab-header {
    min-height: var(--top-bar-height);
}


.top-tab-menu, /* Combined selector */
.bottom-tab-menu {
  display: flex;
  gap: 0.5rem;
  flex-grow: 1; /* Allow menu to take space */
  justify-content: flex-start; /* Align buttons to the start */
}

.top-tab-header > .p-inputgroup { /* Target SearchBar container more specifically */
   max-width: 300px; /* Limit search bar width */
   flex-shrink: 1;
}

.top-tab-content, /* Combined selector */
.bottom-tab-content {
  padding: 0.5rem 1rem; /* Added horizontal padding */
  overflow-y: auto; /* Allow content within tabs to scroll if needed */
  flex-grow: 1; /* Allow content to fill expanded space */
}

/* Button styles within headers */
.expand-collapse-button {
    margin-left: auto; /* Push expand/collapse button to the right */
}

.expand-collapse-button .pi {
  transition: transform 0.3s;
}

/* Rotate chevron icons when expanded */
.top-tab-container.expanded .expand-collapse-button .pi-chevron-down,
.bottom-tab-container.expanded .expand-collapse-button .pi-chevron-up {
  transform: rotate(180deg);
}


/* Utility classes (assuming these are defined globally or add them here) */
.text-center {
    text-align: center;
}
.text-color-secondary {
    color: var(--text-color-secondary);
}
.p-p-3 {
    padding: 1rem; /* Adjust based on your theme's spacing */
}
.p-mb-3 {
    margin-bottom: 1rem;
}
.p-mt-3 {
    margin-top: 1rem;
}
</style>