<!-- src/components/order/OrdersTable.vue -->
<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { openOrdersTableColumns } from '../../js/columns';
import { Order } from '../../types/responseData';
// Interface pour les filtres 
interface Filters {
  [key: string]: any; // Si tu connais les types des filtres, remplace 'any' par les types exacts
}

// Définir les propriétés avec les types appropriés
const props = defineProps<{
  items: Order[]; // Tableau d'éléments de type 'TradeItem'
  filters?: Filters; // Objet des filtres
}>()

const itemsPerPage = ref(10);

const cols = openOrdersTableColumns

// Filtered items based on search
const filteredItems = ref<Order[]>([])

watchEffect(() => {
  if (Array.isArray(props.items)) {
    // Computing rows based on orders prop
    filteredItems.value = props.items.map((item: Order) => {

      const total = item['amount'] * item['price']
      return {
        platform: item['platform'],
        symbol: item['symbol'],
        side: item['side'],
        amount: item['amount'],
        price: item['price'],
        total,
        _id: item['_id'], // Ajout de la propriété _id
        oId: item['oId'], // Ajout de la propriété oId
        cId: item['cId'], // Ajout de la propriété cId
        type: item['type']
      };
    }).reverse();
  }
})

</script>

<template>
  <div class="table-container">
    <DataTable :value="filteredItems" :rows="itemsPerPage" columnResizeMode="fit" :paginator="true" scrollable
      :filters="filters">
      <Column v-for="(col, index) in cols" :key="index" :field="col.field" :header="col.header"></Column>
    </DataTable>
  </div>
</template>

<style scoped>
.table-container {
  margin-bottom: 1rem;
}
</style>