<!-- src/components/shad/Shad.vue -->
<template>
  <div class="shad-container">
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
        <ActionSelector v-if="activeTopTab === 'action'" :selectedAssets="selectedAssets" :allRows="allRows"
          :filters="filters" @delete-action="handleDeleteAction" />
      </div>
    </div>

    <!-- Main Shad Data Table -->
    <div class="card">
      <Toolbar class="mb-4">
        <template #end>
          <div class="flex justify-content-end">
            <SearchBar :filters="filters" />
          </div>
        </template>
      </Toolbar>
      <ShadDataTable :items="shadItems" :filters="filters" @update:selectedAssets="updateSelectedAssets" />
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

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCalculStore } from '@/store/calcul'; // Importer le store Pinia

import { FilterMatchMode } from 'primevue/api'
import ShadDataTable from './ShadDataTable.vue'
import SearchBar from './SearchBar.vue'
import TradesTable from '../trades/TradesTable.vue'
import OrdersTable from '../orders/OrdersTable.vue'
import PlatformSelector from './PlatformSelector.vue'
import UpdateBarSelector from './UpdateBarSelector.vue'
import ActionSelector from './ActionSelector.vue'
import BuyCalculator from './BuyCalculator.vue'

const selectedAssets = ref([])

const showOverlay = ref(false)
const selectedAsset = ref()
const allRows = ref()
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const selectedPlatforms = ref(['binance', 'kucoin', 'htx', 'okx', 'gateio'])

// Utiliser le store Pinia
const calculStore = useCalculStore();
const tradesItems = computed(() => calculStore.getTrades);
const openOrdersItems = computed(() => calculStore.getOrders);
const shadItems = computed(() => calculStore.getShad);

const getData = async () => {
  try {
    await calculStore.fetchShad();
    await calculStore.fetchTrades();
    await calculStore.fetchOrders();
    console.log("DonnéfetchCalculécupérées:", shadItems.value.length)
    console.log("Données Trades récupérées:", tradesItems.value.length)
    console.log("Données Orders récupérées:", openOrdersItems.value.length)
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error)
  }
}

onMounted(async () => {
  await getData()
})

const handleDeleteAction = () => {
  console.log('Delete action received from grandchild component');
  // Effectuer ici l'action de suppression
  deleteProductsDialog.value = true

};

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
