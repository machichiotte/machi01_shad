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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCalculStore } from '../store/calculStore';
import { cmcColumns } from '../js/columns.ts'
import { FilterMatchMode } from 'primevue/api'
import SearchBar from "./machi/SearchBar.vue";

const itemsPerPage = ref(13)
const cols = ref(cmcColumns)
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
    await calculStore.loadCmc();
    console.log("CMC data retrieved:", calculStore.getCmc)
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

<style scoped>
.page {
  overflow-x: auto;
}

#table {
  height: 700px;
  width: auto;
}
</style>../store/calculStoreStore