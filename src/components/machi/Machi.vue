<!-- File: src/components/machi/Machi.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, shallowRef } from 'vue'
import { useCalculStore } from '../../store/calculStore'
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

// Définition des bases sélectionnées avec les types appropriés
const selectedBases = shallowRef<Asset[]>([])

// Définition des filtres avec une structure bien définie
const filters = ref<Filter>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

// Définition du tableau de plateformes
const selectedPlatforms = shallowRef(['binance', 'kucoin', 'htx', 'okx', 'gateio'])

// Accès au store Pinia
const calculStore = useCalculStore()

// Propriétés calculées pour récupérer les données du store
const tradesItems = computed(() => calculStore.getTrade)
const openOrdersItems = computed(() => calculStore.getOrder)
const machiItems = computed(() => calculStore.getMachi)

// Transformation des trades en TradeTransformed pour le tableau des trades
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
        // Si le timestamp est en secondes, le convertir en millisecondes
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
        timestampVal // utilisé pour le tri
      } as TradeTransformed
    })
    .sort((a, b) => b.timestampVal - a.timestampVal) // Tri décroissant
})

// Filtrage des Machi items par plateforme et recherche (unicité sur base et plateforme)
const filteredMachiItems = computed(() => {
  const searchValue = filters.value.global.value?.toLowerCase() ?? '';
  const uniqueItems = new Map(); // Utiliser Map au lieu de Set pour de meilleures performances

  return machiItems.value.filter(item => {
    const uniqueKey = `${item.base}-${item.platform}`;
    if (uniqueItems.has(uniqueKey)) return false;

    const matchesPlatform = selectedPlatforms.value.includes(item.platform);
    const matchesSearch = !searchValue ||
      Object.values(item).some(value => String(value).toLowerCase().includes(searchValue));

    if (matchesPlatform && matchesSearch) {
      uniqueItems.set(uniqueKey, true);
      return true;
    }
    return false;
  });
});

// Fonction pour récupérer les données du store de façon asynchrone
const getData = async (): Promise<void> => {
  try {
    await calculStore.loadTrade();
    await calculStore.loadOrder();
    await calculStore.loadMachi();
    console.info("Data retrieved:", {
      trades: tradesItems.value.length,
      orders: openOrdersItems.value.length,
      machi: machiItems.value.length,
    });
  } catch (error) {
    console.error("An error occurred while retrieving data:", error)
  }
}

// Chargement des données lors du montage du composant
onMounted(async () => {
  await getData()
})

// Gestion de l'action de suppression (à implémenter)
const handleDeleteAction = (): void => {
  // TODO: Implémenter la suppression
};

// Mise à jour des bases sélectionnées
const updateSelectedBases = (newSelection: Asset[]): void => {
  selectedBases.value = newSelection
}

// Mise à jour des plateformes sélectionnées
const updateSelectedPlatforms = (newPlatforms: string[]): void => {
  selectedPlatforms.value = newPlatforms
}

// Gestion de l'expansion/repli des sections
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

// Pagination des Machi items
const itemsPerPage = 10;
const currentPage = ref(1);
const loading = ref(false);
const paginatedMachiItems = computed(() => {
  const start = 0;
  return filteredMachiItems.value.slice(start, currentPage.value * itemsPerPage);
});
const hasMoreItems = computed(() => {
  return currentPage.value * itemsPerPage < filteredMachiItems.value.length;
});
const loadMore = () => {
  if (!loading.value && hasMoreItems.value) {
    loading.value = true;
    currentPage.value++;
    loading.value = false;
  }
};

const handleScroll = debounce(() => {
  if (loading.value) return;

  const scrollPosition = window.innerHeight + window.scrollY;
  const threshold = document.body.offsetHeight - 200;

  if (scrollPosition >= threshold && hasMoreItems.value) {
    loadMore();
  }
}, 200);

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

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
          <!-- Boutons ou éléments supplémentaires -->
        </template>
      </Toolbar>

      <CardBalance :assets="filteredMachiItems" />
      <CardStableCoin :assets="filteredMachiItems" />

      <!-- Conteneur de cartes -->
      <div class="asset-card-container">
        <CardAsset v-for="item in paginatedMachiItems" :key="`${item.base}-${item.platform}`" :asset="item"
          :trades="tradesItems" :orders="openOrdersItems" @update:selectedBases="updateSelectedBases" />
        <div v-if="loading">Loading more items...</div>
      </div>
    </div>

    <!-- Fixed Bottom Tab Container -->
    <div class="bottom-tab-container" :class="{ expanded: isBottomExpanded }">
      <div class="tab-header">
        <Button label="Trades" @click="activeTab = 'trades'" :class="{ active: activeTab === 'trades' }" />
        <Button label="Orders" @click="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }" />
        <Button icon="pi pi-chevron-up" @click="toggleExpandCollapse" class="expand-collapse-button" />
      </div>
      <div class="tab-content">
        <!-- Passage de TradeTransformed au composant TradesTable -->
        <TradesTable v-if="activeTab === 'trades'" :rows="filteredTrades" :filters="filters" />
        <OrdersTable v-if="activeTab === 'orders'" :rows="openOrdersItems" :filters="filters" />
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
  padding: 0;
  border-radius: 4px;
  flex-grow: 1;
  overflow-y: auto;
  height: calc(100vh - 60px - 44px);
  transition: height 0.3s ease;
  background-color: darkorchid;
}

.asset-card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background-color: var(--surface-ground);
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
  align-items: center;
  padding: 4px 0;
}

.tab_menu {
  display: flex;
  justify-content: center;
  flex-grow: 1;
}

.search-bar {
  margin-left: auto;
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

@media (max-width: 768px) {
  .asset-card-container {
    grid-template-columns: 1fr;
  }

  .top-tab-container.expanded {
    height: 150px;
  }
}
</style>
