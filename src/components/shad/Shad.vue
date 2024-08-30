<!-- src/components/Shad.vue -->
<template>
  <div class="shad-container">
    <div class="card">
      <!-- Toolbar at the top -->
      <Toolbar class="mb-4">
        <template #start>
          <MyBunchSellButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length" :model="allRows" />
          <MyEmergencySellButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length" :model="allRows" />
          <MyBuyButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length" :model="allRows" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedAssets || !selectedAssets.length" />
          <MultiSelect v-model="selectedPlatforms" :options="platformOptions" optionLabel="name" optionValue="id" placeholder="Select Platforms" class="ml-2" display="chip" :panelClass="'platforms-multiselect-panel'">
            <template #item="slotProps">
              <Checkbox v-model="slotProps.checked" :label="slotProps.option.name" />
              <span>{{ slotProps.option.name }}</span>
            </template>
          </MultiSelect>
        </template>
        <template #end>
          <div class="flex justify-content-end">
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>
      </Toolbar>

      <!-- Main Shad Data Table -->
      <ShadDataTable :items="items" :filters="filters" @update:selectedAssets="updateSelectedAssets" />

    </div>

    <!-- Fixed Bottom Tab Container -->
    <div class="bottom-tab-container" :class="{ expanded: isExpanded }">
      <div class="tab-header">
        <!-- Tabs for switching between Trades and Orders -->
        <Button label="Trades" @click="activeTab = 'trades'" :class="{ active: activeTab === 'trades' }" />
        <Button label="Orders" @click="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }" />
        <Button icon="pi pi-chevron-up" @click="toggleExpandCollapse" class="expand-collapse-button" />
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <Trades v-if="activeTab === 'trades'" />
        <Orders v-if="activeTab === 'orders'" />
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
import Trades from '../trades/Trades.vue'
import Orders from '../orders/Orders.vue'

import {
  FETCH_SHAD, GET_SHAD
} from '../../store/storeconstants'

const store = useStore()

const selectedAssets = ref([])
const shad = ref([])

const showOverlay = ref(false)
const selectedAsset = ref()
const allRows = ref()
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const platformOptions = computed(() => {
  return [
    { id: 'binance', name: 'Binance' },
    { id: 'kucoin', name: 'KuCoin' },
    { id: 'htx', name: 'HTX' },
    { id: 'okx', name: 'OKX' },
    { id: 'gateio', name: 'Gate.io' }
  ]
})
const selectedPlatforms = ref(platformOptions.value.map(platform => platform.id))

const items = computed(() => {
  return shad.value && shad.value.length > 0 ? shad.value : []
})

onMounted(async () => {
  try {
    await store.dispatch('calcul/' + FETCH_SHAD)
    shad.value = await store.getters['calcul/' + GET_SHAD]
    console.log("Données Shad récupérées:", shad.value)  // Check retrieved data
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

// Responsive tab management
const isExpanded = ref(false)
const activeTab = ref('trades')

function toggleExpandCollapse() {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.shad-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}

.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  flex-grow: 1;
  overflow: auto;
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
  height: 300px; /* Adjust to desired height when expanded */
}

.bottom-tab-container:not(.expanded) {
  height: 40px; /* Height of the tab header when collapsed */
}

.tab-header {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
}

.tab-header .active {
  font-weight: bold;
}

.tab-content {
  height: calc(100% - 40px); /* Adjust height based on header */
  overflow: auto;
}

.expand-collapse-button {
  margin-left: auto;
}

.platforms-multiselect-panel {
  min-width: 200px;
}
</style>
