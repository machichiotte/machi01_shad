<!-- src/components/machi/Machi.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useCalculStore } from '../../store/calculStore'; // Import the Pinia store
import { FilterMatchMode } from 'primevue/api'
import AssetCard from './AssetCard.vue'
import BalanceCard from './BalanceCard.vue'
import SearchBar from './SearchBar.vue'

import PlatformSelector from './PlatformSelector.vue'
import UpdateBarSelector from './UpdateBarSelector.vue'
import ActionSelector from './ActionSelector.vue'

import TradesTable from '../trade/TradesTable.vue';
import OrdersTable from '../order/OrdersTable.vue';
import BuyCalculator from './BuyCalculator.vue';

import { Filter } from '../../types/filter'
import { Asset } from '../../types/responseData'
import StableCoinCard from './StableCoinCard.vue';

// Define the selected bases with proper types
const selectedBases = ref<Asset[]>([])

// Filters with a well-defined structure
const filters = ref<Filter>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

// Define the platforms array with string types
const selectedPlatforms = ref(['binance', 'kucoin', 'htx', 'okx', 'gateio'])

// Access the Pinia store
const calculStore = useCalculStore();

// Computed properties with appropriate types
const tradesItems = computed(() => calculStore.getTrade);
const openOrdersItems = computed(() => calculStore.getOrder);
const machiItems = computed(() => calculStore.getMachi);

// Filtered Machi items by platform and search query, ensuring uniqueness of `base`
const filteredMachiItems = computed(() => {
  const searchValue = filters.value.global.value ? filters.value.global.value.toLowerCase() : '';

  // Utiliser un Set pour garder les éléments uniques
  const uniqueItems = new Set();

  return machiItems.value.filter(item => {
    // Filtrer par plateforme
    const matchesPlatformFilter = selectedPlatforms.value.includes(item.platform);

    // Filtrer par recherche
    const matchesSearchFilter = searchValue
      ? Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchValue)
      )
      : true;

    // Ajouter à l'ensemble si l'élément est unique par `base`
    const isUnique = !uniqueItems.has(`${item.base}-${item.platform}`);
    if (matchesPlatformFilter && matchesSearchFilter && isUnique) {
      uniqueItems.add(item.base); // Ajouter la `base` unique à l'ensemble
      return true;
    }
    return false;
  });
});


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

// Function to update selected bases
const updateSelectedBases = (newSelection: Asset[]): void => {
  selectedBases.value = newSelection
}

// Function to update selected platforms
const updateSelectedPlatforms = (newPlatforms: string[]): void => {
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

const itemsPerPage = 10; // Number of items to display per page
const currentPage = ref(1);
const loading = ref(false);

// Computed property for paginated items
const paginatedMachiItems = computed(() => {
  const start = 0; // Commencer à partir du début
  return filteredMachiItems.value.slice(start, currentPage.value * itemsPerPage);
});

// Check if there are more items to load
const hasMoreItems = computed(() => {
  return currentPage.value * itemsPerPage < filteredMachiItems.value.length;
});

// Function to load more items
const loadMore = () => {
  if (!loading.value && hasMoreItems.value) {
    loading.value = true;
    currentPage.value++;
    loading.value = false;
  }
};

const handleScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const threshold = document.body.offsetHeight - 200; // Seuil pour charger plus d'éléments
  if (scrollPosition >= threshold) {
    loadMore();
  }
};

// Ajouter l'écouteur d'événements lors du montage
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

// Nettoyer l'écouteur d'événements lors de la destruction
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="main-container">
    <!-- Top Expandable Container -->
    <div class="top-tab-container" :class="{ expanded: isTopExpanded }">
      <div class="tab-header">
        <div class="tab_menu">
          <Button label="Platform Selector" @click="activeTopTab = 'platforms'"
            :class="{ active: activeTopTab === 'platforms' }" />
          <Button label="Update data" @click="activeTopTab = 'fetch'" :class="{ active: activeTopTab === 'fetch' }" />
          <Button label="Actions" @click="activeTopTab = 'action'" :class="{ active: activeTopTab === 'action' }" />
          <Button icon="pi pi-chevron-down" @click="toggleTopExpandCollapse" class="expand-collapse-button" />

        </div>
        <SearchBar :filters="filters" />

      </div>
      <div class="tab-content">
        <PlatformSelector v-if="activeTopTab === 'platforms'" :initialSelectedPlatforms="selectedPlatforms"
          @update:selectedPlatforms="updateSelectedPlatforms" />
        <UpdateBarSelector v-if="activeTopTab === 'fetch'" />
        <ActionSelector v-if="activeTopTab === 'action'" :selectedBases="selectedBases" :filters="filters"
          @delete:action="handleDeleteAction" />

      </div>
    </div>

    <div class="content-container">
      <Toolbar class="mb-4">
        <template #end>

        </template>
      </Toolbar>

      <BalanceCard :assets="filteredMachiItems" />
      <StableCoinCard :assets="filteredMachiItems" />

      <!-- Conteneur de cartes -->
      <div class="asset-card-container">
        <AssetCard v-for="item in paginatedMachiItems" :key="item.base" :assets="item" :trades="tradesItems"
          :orders="openOrdersItems" @update:selectedBases="updateSelectedBases" />
        <div v-if="loading">Loading more items...</div>
      </div>
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
        <BuyCalculator v-if="activeTab === 'buyCalculator'" :selectedBases="selectedBases" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  background-color: darkolivegreen;
  flex-direction: column;
  height: 100vh;
}

.content-container {
  background: var(--surface-card);
  padding: 0rem;
  border-radius: 4px;
  flex-grow: 1;
  overflow-y: auto;

  /* Adjust height dynamically based on top and bottom containers' expansion */
  height: calc(100vh - 60px - 44px);
  /* Default height when both are collapsed */
  transition: height 0.3s ease;
  background-color: darkorchid;
}

.asset-card-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* 2 colonnes */
  gap: 1rem;
  /* Espace entre les cartes */
  grid-auto-rows: min-content;
  /* Hauteur minimale pour chaque carte */
  align-items: start;
  background-color: darkseagreen
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
  background-color: red;
}

.top-tab-container.expanded {
  height: 100px;
  padding-bottom: 4px;
}

.top-tab-container:not(.expanded) {
  height: 50px;
}

.tab-header {
  display: flex;
  /* Ajoute flexbox pour organiser les éléments */
  align-items: center;
  /* Aligne verticalement les éléments au centre */
  padding-top: 4px;
  padding-bottom: 4px;
}

.tab_menu {
  display: flex;
  /* Utiliser flexbox pour la mise en page */
  justify-content: center;
  /* Centre horizontalement les éléments du menu */
  flex-grow: 1;
  /* Permet au menu de prendre tout l'espace disponible */
}

.search-bar {
  margin-left: auto;
  /* Pousse la barre de recherche tout à droite */
}

.tab-content {
  padding-top: 4px;
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
</style>
