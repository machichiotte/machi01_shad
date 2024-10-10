<!-- src/components/machi/Machi.vue -->
<template>
  <div class="main-container">
    <!-- Top Expandable Container -->
    <div class="top-tab-container" :class="{ expanded: isTopExpanded }">
      <div class="tab-header">
        <Button label="Platform Selector" @click="activeTopTab = 'platforms'"
          :class="{ active: activeTopTab === 'platforms' }" />
        <Button label="Update data" @click="activeTopTab = 'fetch'" :class="{ active: activeTopTab === 'fetch' }" />
        <Button label="Actions" @click="activeTopTab = 'action'" :class="{ active: activeTopTab === 'action' }" />
        <Button icon="pi pi-chevron-down" @click="toggleTopExpandCollapse" class="expand-collapse-button" />
      </div>
      <div class="tab-content">
        <PlatformSelector v-if="activeTopTab === 'platforms'" :initialSelectedPlatforms="selectedPlatforms"
          @update:selectedPlatforms="updateSelectedPlatforms" />
        <UpdateBarSelector v-if="activeTopTab === 'fetch'" />
        <ActionSelector v-if="activeTopTab === 'action'" :selectedAssets="selectedAssets" :filters="filters"
          @delete-action="handleDeleteAction" />
      </div>
    </div>

    <!-- Main Data Table -->
    <div class="card">
      <Toolbar class="mb-4">
        <template #end>
          <div class="flex justify-content-end">
            <SearchBar :filters="filters" />
          </div>
        </template>
      </Toolbar>
      <MachiDataTable :items="filteredMachiItems" @update:selectedAssets="updateSelectedAssets" />
    </div>

    <!-- Fixed Bottom Tab Container -->
    <div class="bottom-tab-container" :class="{ expanded: isBottomExpanded }">
      <div class="tab-header">
        <Button label="Trades" @click="activeTab = 'trades'" :class="{ active: activeTab === 'trades' }" />
        <Button label="Orders" @click="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }" />
        <Button label="Buy Calculator" @click="activeTab = 'buyCalculator'"
          :class="{ active: activeTab === 'buyCalculator' }" />
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

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useCalculStore } from '../../store/calculStore'; // Import the Pinia store
import { FilterMatchMode } from 'primevue/api'
import MachiDataTable from './MachiDataTable.vue'
import SearchBar from './SearchBar.vue'

import PlatformSelector from './PlatformSelector.vue'
import UpdateBarSelector from './UpdateBarSelector.vue'
import ActionSelector from './ActionSelector.vue'

import TradesTable from '../trade/TradesTable.vue';
import OrdersTable from '../order/OrdersTable.vue';
import BuyCalculator from './BuyCalculator.vue';

import { Filter } from '../../types/filter'
import { Trade, Order, Machi } from '../../types/responseData'

// Define the selected assets with proper types
const selectedAssets = ref<Machi[]>([])

// Filters with a well-defined structure
const filters = ref<Filter>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

// Define the platforms array with string types
const selectedPlatforms = ref<string[]>(['binance', 'kucoin', 'htx', 'okx', 'gateio'])

// Access the Pinia store
const calculStore = useCalculStore();

// Computed properties with appropriate types
const tradesItems = computed<Trade[]>(() => calculStore.getTrade);
const openOrdersItems = computed<Order[]>(() => calculStore.getOrder);
const machiItems = computed<Machi[]>(() => calculStore.getMachi);

// Filtered Machi items by platform
const filteredMachiItems = computed<Machi[]>(() => {
  return machiItems.value.filter(item => selectedPlatforms.value.includes(item.platform))
})

// Function to fetch data from the store asynchronously
const getData = async (): Promise<void> => {
  try {
    await calculStore.loadTrade();
    await calculStore.loadOrder();
    await calculStore.loadMachi();

    console.log("Trades data retrieved:", tradesItems.value.length)
    console.log("Orders data retrieved:", openOrdersItems.value.length)
    console.log("Machi data retrieved:", machiItems.value.length)

  } catch (error) {
    console.error("An error occurred while retrieving data:", error)
  }
}

// Call data fetching function when component is mounted
onMounted(async () => {
  await getData()
})

// Function to handle action deletion
const handleDeleteAction = (): void => {
  console.log('Delete action received from grandchild component');
  // Perform the delete action here
  //TODO faire focntionner ca
  //deleteProductsDialog.value = true
};

// Function to update selected assets
const updateSelectedAssets = (newSelection: Machi[]): void => {
  selectedAssets.value = newSelection
}

// Function to update selected platforms
const updateSelectedPlatforms = (newPlatforms: string[]): void => {
  console.log('updateSelectedPlatforms', newPlatforms)
  selectedPlatforms.value = newPlatforms
}

// Handling expand/collapse states with boolean types
const isBottomExpanded = ref<boolean>(false)
const activeTab = ref<'trades' | 'orders' | 'buyCalculator'>('trades')

const toggleExpandCollapse = (): void => {
  isBottomExpanded.value = !isBottomExpanded.value
}

const isTopExpanded = ref<boolean>(false)
const activeTopTab = ref<'platforms' | 'fetch' | 'action'>('platforms')

const toggleTopExpandCollapse = (): void => {
  isTopExpanded.value = !isTopExpanded.value
}
</script>

<style scoped>
.main-container {
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
  height: calc(100vh - 40px - 40px);
  /* Default height when both are collapsed */
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
