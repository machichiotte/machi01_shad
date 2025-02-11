<!-- src/components/cmc/Cmc.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCalculStore } from '../../store/calculStore.ts';
import { FilterMatchMode } from 'primevue/api'
import SearchBar from "../machi/SearchBar.vue";
import CmcTable from "./CmcTable.vue";
import { Cmc } from '../../types/responseData.ts'
const itemsPerPage = ref(100)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const calculStore = useCalculStore();

const rows = computed(() => {
  return cmcItems.value.map((item) => {
    const types = addTags(item);
    return {
      rank: item['cmc_rank'],
      name: item['name'],
      symbol: item['symbol'],
      price: item.quote.USD.price,
      tags: types.join(', ')
    }
  }).sort((a, b) => a.rank - b.rank);
})

function addTags(cmc: Cmc | null): string[] {
  const types: string[] = [];
  const tagsToCheck = [
    'stablecoin', 'depin', 'gaming', 'memes',
    'ai-big-data', 'real-world-assets', 'music',
    'layer-1', 'layer-2', 'sports', 'iot',
    'nft', 'defi', 'dao', 'bitcoin-ecosystem',
    'ethereum-ecosystem', 'polkadot-ecosystem',
    'solana-ecosystem', 'smart-contracts',
    'centralized-exchange', 'decentralized-exchange-dex-token'
  ];

  tagsToCheck.forEach(tag => {
    if (cmc?.tags.includes(tag)) {
      types.push(tag);
    }
  });

  return types;
}

const cmcItems = computed(() => calculStore.getCmc)

const getCmcData = async () => {
  try {
    await calculStore.loadCmc();
  } catch (error) {
    console.error("An error occurred while retrieving data:", error)
  }
};

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
    <h1>CMC</h1>
    <SearchBar :filters="filters" />
    <div id="table">
      <CmcTable :rows="rows" :globalFilter="filters.global.value || ''" :itemsPerPage="itemsPerPage" />
    </div>
  </div>
</template>

<style scoped>
.page {
  overflow-x: auto;
}
</style>