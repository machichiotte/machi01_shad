<!-- src/components/trades/TradesTable.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { tradesColumns } from '../../js/columns.js'
import { Trade } from '../../types/responseData';

// Interface pour les filtres 
interface Filters {
  [key: string]: any; // Si tu connais les types des filtres, remplace 'any' par les types exacts
}

// Définir les propriétés avec les types appropriés
const props = defineProps<{
  items: Trade[]; // Tableau d'éléments de type 'TradeItem'
  filters?: Filters; // Objet des filtres
}>()

const itemsPerPage = ref<number>(100);

const cols = tradesColumns

</script>

<template>
  <div class="table-container">
    <DataTable :value="props.items" :rows="itemsPerPage" columnResizeMode="fit" :paginator="true" scrollable
      :filters="filters" sortField="dateUTC" :sortOrder="-1">
      <Column v-for="(col, index) in cols" :key="index" :field="col.field" :header="col.header" sortable></Column>
    </DataTable>
  </div>
</template>

<style scoped>
.table-container {
  margin-bottom: 1rem;
  width: 100%;
}
</style>
