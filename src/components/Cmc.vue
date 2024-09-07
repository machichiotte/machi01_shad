<!-- src/components/Cmc.vue -->
<template>
  <div class="page">
    <h1>CMC</h1>
    <SearchBar :filters="filters" />
    <div id="table">
      <DataTable :value="rows" :rows="itemsPerPage" :paginator="true" scrollable columnResizeMode="fit"
        :filters="filters">
        <Column v-for="(col, index) in cols" :key="index" :field="col.field" :header="col.header"></Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCalculStore } from '../store/calcul'; // Importer le store Pinia
import { cmcColumns } from '../js/columns.js'
import { FilterMatchMode } from 'primevue/api'
import SearchBar from "./shad/SearchBar.vue";

const itemsPerPage = 13
const cols = cmcColumns
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const calculStore = useCalculStore();

const rows = computed(() => {
  return cmcItems.value.map((item) => {
    return {
      rank: item['cmc_rank'],
      name: item['name'],
      symbol: item['symbol'],
      price: item.quote.USD.price,
    }
  })
})

const cmcItems = computed(() => calculStore.getCmc)

const getCmcData = async () => {
  try {
    await calculStore.fetchCmc();
    console.log("Données CMC récupérées:", calculStore.getCmc)
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error)
  }
};

onMounted(async () => {
  try {
    await getCmcData()
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error)
  }
})
</script>

<style scoped>
.page {
  overflow-x: auto;
}

#table {
  height: 700px;
  width: auto;
}
</style>