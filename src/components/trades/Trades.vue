<template>
  <div class="page">
    <h1>Liste des trades</h1>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button label="Add New Trade" icon="pi pi-cart-plus" severity="info" class="mr-2"
            @click="showDialog = true" />
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
import { ref, watchEffect, onMounted } from 'vue'
import { useStore } from 'vuex'
import { FilterMatchMode } from 'primevue/api'

import { tradesColumns } from '../../js/columns.js'
import TradesForm from "../../components/forms/TradesForm.vue";
import { FETCH_BALANCES, FETCH_TRADES, GET_BALANCES, GET_TRADES } from '../../store/storeconstants'

const store = useStore()

// État pour gérer l'ouverture et la fermeture du dialogue
const showDialog = ref(false)

const items = ref([])
const itemsPerPage = 13
const cols = tradesColumns
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const rows = ref([]) // Déclaration de rows

const fetchData = async (fetchAction, getter, type) => {
  try {
    await store.dispatch('calcul/' + fetchAction);
  } catch (error) {
    console.error(`Une erreur s'est produite lors de la récupération des données de ${type} :`, error);
  }
  return store.getters['calcul/' + getter];
}

const getTradesData = async () => {
  items.value = await fetchData(FETCH_TRADES, GET_TRADES, 'trades');
}

const getBalancesData = async () => {
  items.value = await fetchData(FETCH_BALANCES, GET_BALANCES, 'balances');
}

onMounted(async () => {
  await getBalancesData()
  await getTradesData()
})

// Observer les changements dans `items` et mettre à jour `rows`
watchEffect(() => {
  if (Array.isArray(items.value)) {
    rows.value = items.value.map((item) => {
      let date;
      // Vérifier si la date est une chaîne de caractères
      if (typeof item['date'] === 'string') {
        date = item['date']; // Utiliser directement la date si elle est déjà au format attendu
      } else {
        // Si la date est un timestamp, convertir en objet Date
        const timestamp = parseFloat(item['timestamp']);
        const formattedDate = new Date(timestamp);

        // Formater la date au format YYYY-MM-DD HH:mm:ss
        const year = formattedDate.getFullYear();
        const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
        const day = String(formattedDate.getDate()).padStart(2, '0');
        const hours = String(formattedDate.getHours()).padStart(2, '0');
        const minutes = String(formattedDate.getMinutes()).padStart(2, '0');
        const seconds = String(formattedDate.getSeconds()).padStart(2, '0');

        date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

      return {
        base: item['base'],
        quote: item['quote'],
        date: date,
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
  }
})
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