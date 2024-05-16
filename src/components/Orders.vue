<!-- src/components/Orders.vue -->

<template>
  <div class="page">
    <h1>Ordres en cours</h1>
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
          sortable
        ></Column>
        <template #selected-row-actions>
          <MySellButtonVue :model="allRows" />
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ordersColumns } from '../js/columns.js'
import { getOrders } from '../js/getter.js'
import MySellButtonVue from './MySellButton.vue'
import { FilterMatchMode } from 'primevue/api'

// Variables réactives
const items = ref([]) // Utilisez ref pour les variables réactives
const itemsPerPage = 13
const cols = ordersColumns
const allRows = ref([])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
//const selectedColumns = ref(columns.value);


// Fonction calculée pour transformer les données
const rows = computed(() => {
  return items.value.map((item) => {
    return {
      oId: item['oId'],
      platform: item['platform'],
      symbol: item['symbol'],
      type: item['type'],
      side: item['side'],
      amount: item['amount'],
      price: item['price']
    }
  })
})

const getData = async () => {
  items.value = await getOrders()
}

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