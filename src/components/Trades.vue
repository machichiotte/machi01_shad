<template>
  <div class="page">
    <h1>Liste des trades</h1>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button label="Add New Trade" icon="pi pi-cart-plus" severity="info" class="mr-2" @click="showDialog = true" />
        </template>
      </Toolbar>

      <!-- DataTable avec les données des trades -->
      <DataTable :value="rows" :rows="itemsPerPage" columnResizeMode="fit" :paginator="true" scrollable
        :filters="filters" sortField="date" :sortOrder="-1">
        <!-- En-tête des colonnes -->
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 class="m-0">Find Assets</h4>
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>

        <!-- Colonnes -->
        <Column v-for="(col, index) in cols" :key="index" :field="col.field" :header="col.header" sortable></Column>
      </DataTable>

      <TradesForm v-model:visible="showDialog" />

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { tradesColumns } from '../js/columns.js'
import { getTrades } from '../js/getter.js'
import { FilterMatchMode } from 'primevue/api'
import TradesForm from "@/components/TradesForm.vue";

const items = ref([])
const itemsPerPage = 13
const cols = tradesColumns
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const rows = computed(() => {
  return items.value.map((item) => {
    return {
      altA: item['altA'],
      altB: item['altB'],
      date: item['date'],
      pair: item['pair'],
      type: item['type'],
      price: item['price'],
      amount: item['amount'],
      total: item['total'],
      totalUSDT: item['totalUSDT'],
      fee: item['fee'],
      feecoin: item['feecoin'],
      platform: item['platform']
    }
  })
})

const getData = async () => {
  items.value = await getTrades()
}

onMounted(async () => {
  try {
    await getData()
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error)
    // Affichez un message d'erreur à l'utilisateur si nécessaire
  }
})

// État pour gérer l'ouverture et la fermeture du dialogue
const showDialog = ref(false)
</script>

<style scoped>
.page {
  overflow-x: auto;
}

.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}
</style>