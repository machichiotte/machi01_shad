<!-- src/components/Cmc.vue -->

<template>
  <div class="page">
    <h1>CMC</h1>
    <div id="table">
      <DataTable
        :value="rows"
        :rows="itemsPerPage"
        :paginator="true"
        scrollable
        columnResizeMode="fit"
        :filters="filters"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 class="m-0">Find Orders</h4>
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>
        <Column
          v-for="(col, index) in cols"
          :key="index"
          :field="col.field"
          :header="col.header"
        ></Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { cmcColumns } from '../js/columns.js'
import { getCmc } from '../js/getter.js'
import { FilterMatchMode } from 'primevue/api'

const items = ref([])
const itemsPerPage = 13
const cols = cmcColumns
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const rows = computed(() => {
  return items.value.map((item) => {
    return {
      rank: item['cmc_rank'],
      name: item['name'],
      symbol: item['symbol']
    }
  })
})

const getData = async () => {
  items.value = await getCmc();
};

onMounted(async () => {
  try {
    await getData()
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error)
    // Affichez un message d'erreur à l'utilisateur si nécessaire
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