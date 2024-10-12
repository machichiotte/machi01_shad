<!-- src/components/trades/TradesTable.vue -->
<template>
  <div class="table-container">
    <DataTable :value="filteredItems" :rows="itemsPerPage" columnResizeMode="fit" :paginator="true" scrollable
      :filters="filters" sortField="date" :sortOrder="-1">
      <Column v-for="(col, index) in cols" :key="index" :field="col.field" :header="col.header" sortable></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { tradesColumns } from '../../js/columns.js'
import { Trade } from '../../types/responseData';

// Interface pour les filtres
interface Filters {
  [key: string]: any; // Si tu connais les types des filtres, remplace 'any' par les types exacts
}

// Définir les propriétés avec les types appropriés
const props = defineProps<{
  items: Trade[]; // Tableau d'éléments de type 'TradeItem'
  filters: Filters; // Objet des filtres
}>()

const itemsPerPage = ref<number>(10);

const cols = tradesColumns

// Filtered items based on search
const filteredItems = ref<Trade[]>([])

watchEffect(() => {
  if (Array.isArray(props.items)) {
    filteredItems.value = props.items.map((item: Trade) => {
      let date: string;

      if (typeof item['date'] === 'string') {
        date = item['date'];
      } else if (item['timestamp']) {
        const timestamp = item['timestamp'];
        const formattedDate = new Date(timestamp);

        const year = formattedDate.getFullYear();
        const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
        const day = String(formattedDate.getDate()).padStart(2, '0');
        const hours = String(formattedDate.getHours()).padStart(2, '0');
        const minutes = String(formattedDate.getMinutes()).padStart(2, '0');
        const seconds = String(formattedDate.getSeconds()).padStart(2, '0');

        date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } else {
        date = 'Invalid date'; // Cas où 'timestamp' serait manquant ou invalide
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
      } as Trade; // Cast explicite pour s'assurer que le retour est bien de type TradeItem
    });
  }
});
</script>

<style scoped>
.table-container {
  margin-bottom: 1rem;
}
</style>
