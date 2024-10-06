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
        <ActionSelector v-if="activeTopTab === 'action'" :selectedAssets="selectedAssets" :filters="filters"
          @delete-action="handleDeleteAction" />
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
      <ShadDataTable :items="filteredShadItems" :filters="filters" @update:selectedAssets="updateSelectedAssets" />
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
import { useCalculStore } from '@store/calculStore'; // Import the Pinia store

import { FilterMatchMode } from 'primevue/api'
import ShadDataTable from '@components/shad/ShadDataTable.vue'
import SearchBar from '@components/shad/SearchBar.vue'

import PlatformSelector from '@components/shad/PlatformSelector.vue'
import UpdateBarSelector from '@components/shad/UpdateBarSelector.vue'
import ActionSelector from '@components/shad/ActionSelector.vue'

import TradesTable from '@components/trades/TradesTable.vue'
import OrdersTable from '@components/orders/OrdersTable.vue'
import BuyCalculator from '@components/shad/BuyCalculator.vue'


// Définition des types
interface Filter {
  global: {
    value: string | null;
    matchMode: FilterMatchMode;
  };
}

interface Item {
  platform: string;
}

// Références
const selectedAssets = ref < Array < any >> ([]);
const filters = ref < Filter > ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const selectedPlatforms = ref < Array < string >> (['binance', 'kucoin', 'htx', 'okx', 'gateio']);
const calculStore = useCalculStore();

// Computed properties
const tradesItems = computed < Array < any >> (() => calculStore.getTrades);
const openOrdersItems = computed < Array < any >> (() => calculStore.getOrders);
const shadItems = computed < Array < any >> (() => calculStore.getShad);
const filteredShadItems = computed < Array < any >> (() => {
  return shadItems.value.filter((item: Item) => selectedPlatforms.value.includes(item.platform));
});

// Fonction asynchrone pour récupérer les données
const getData = async (): Promise<void> => {
  try {
    await calculStore.loadTrades();
    await calculStore.loadOrders();
    await calculStore.loadShad();

    console.log("Trades data retrieved:", tradesItems.value.length);
    console.log("Orders data retrieved:", openOrdersItems.value.length);
    console.log("Shad data retrieved:", shadItems.value.length);
  } catch (error) {
    console.error("An error occurred while retrieving data:", error);
  }
};

onMounted(async () => {
  await getData();
});

// Fonction pour gérer la suppression d'une action
const handleDeleteAction = (): void => {
  console.log('Delete action received from grandchild component');
  // Perform the delete action here
  deleteProductsDialog.value = true; // Assurez-vous que deleteProductsDialog est défini
};

// Fonction pour mettre à jour les actifs sélectionnés
function updateSelectedAssets(newSelection: Array<any>): void {
  selectedAssets.value = newSelection;
}

// Fonction pour mettre à jour les plateformes sélectionnées
function updateSelectedPlatforms(newPlatforms: Array<string>): void {
  console.log('updateSelectedPlatforms', newPlatforms);
  selectedPlatforms.value = newPlatforms;
}

// État pour l'expansion des onglets
const isBottomExpanded = ref < boolean > (false);
const activeTab = ref < string > ('trades');

// Fonction pour basculer l'expansion
function toggleExpandCollapse(): void {
  isBottomExpanded.value = !isBottomExpanded.value;
}

const isTopExpanded = ref < boolean > (false);
const activeTopTab = ref < string > ('platforms');

// Fonction pour basculer l'expansion du haut
function toggleTopExpandCollapse(): void {
  isTopExpanded.value = !isTopExpanded.value;
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