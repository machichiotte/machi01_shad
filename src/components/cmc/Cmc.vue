<!-- src/components/cmc/Cmc.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCalculStore } from '../../store/calculStore'
import { FilterMatchMode } from 'primevue/api'
import SearchBar from "../machi/SearchBar.vue"
import CmcTable from "./CmcTable.vue"
import { Cmc } from '../../types/responseData'
import { applyGlobalFilter } from '../../utils/filter'

// Nombre d'éléments par page
const itemsPerPage = ref(100)

// Définition des filtres avec une valeur globale vide par défaut
const filters = ref({
  global: { value: '', matchMode: FilterMatchMode.CONTAINS }
})

const calculStore = useCalculStore()

// Récupération des données depuis le store
const cmcItems = computed(() => calculStore.getCmc)

// Transformation des données CMC en ligne pour la table
const rows = computed(() => {
  return cmcItems.value.map(item => {
    const types = addTags(item)
    return {
      rank: item['cmc_rank'],
      name: item['name'],
      symbol: item['symbol'],
      price: item.quote.USD.price,
      tags: types.join(', ')
    }
  }).sort((a, b) => a.rank - b.rank)
})

// Application du filtre global en utilisant l'utilitaire
const filteredRows = computed(() => {
  const filterText = filters.value.global.value
  return filterText.trim() === ''
    ? rows.value
    : applyGlobalFilter(rows.value, filterText)
})

// Fonction pour extraire les tags pertinents de l'objet CMC
function addTags(cmc: Cmc | null): string[] {
  const types: string[] = []
  const tagsToCheck = [
    'stablecoin', 'depin', 'gaming', 'memes',
    'ai-big-data', 'real-world-assets', 'music',
    'layer-1', 'layer-2', 'sports', 'iot',
    'nft', 'defi', 'dao', 'bitcoin-ecosystem',
    'ethereum-ecosystem', 'polkadot-ecosystem',
    'solana-ecosystem', 'smart-contracts',
    'centralized-exchange', 'decentralized-exchange-dex-token'
  ]
  tagsToCheck.forEach(tag => {
    if (cmc?.tags.includes(tag)) {
      types.push(tag)
    }
  })
  return types
}

// Récupération des données CMC au montage du composant
const getCmcData = async () => {
  try {
    await calculStore.loadCmc()
  } catch (error) {
    console.error("An error occurred while retrieving data:", error)
  }
}

onMounted(async () => {
  await getCmcData()
})
</script>

<template>
  <div class="page">
    <h2>CMC</h2>
    <div id="card">
      <SearchBar :filters="filters" />
      <CmcTable :rows="filteredRows" :itemsPerPage="itemsPerPage" />
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}
</style>
