<!-- src/components/cmc/Cmc.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCalculStore } from '../../store/calculStore.ts'
import { FilterMatchMode } from 'primevue/api'
import SearchBar from "../machi/SearchBar.vue"
import CmcTable from "./CmcTable.vue"
import { Cmc } from '../../types/responseData.ts'

const itemsPerPage = ref(100)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const calculStore = useCalculStore()

const cmcItems = computed(() => calculStore.getCmc)

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

const filteredRows = computed(() => {
  if (!filters.value.global || !filters.value.global.value) {
    return rows.value
  }
  const filterText = String(filters.value.global.value).toLowerCase()
  return rows.value.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(filterText)
    )
  )
})

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

const getCmcData = async () => {
  try {
    await calculStore.loadCmc()
  } catch (error) {
    console.error("An error occurred while retrieving data:", error)
  }
}

onMounted(async () => {
  try {
    await getCmcData()
  } catch (error) {
    console.error("An error occurred while retrieving data:", error)
  }
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
