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

const itemsPerPage = ref(10);

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  filters: {
    type: Object,
    required: true
  }
})

const cols = tradesColumns

// Filtered items based on search
const filteredItems = ref([])

watchEffect(() => {
  if (Array.isArray(props.items)) {
    filteredItems.value = props.items.map((item) => {
      let date
      if (typeof item['date'] === 'string') {
        date = item['date']
      } else {
        const timestamp = parseFloat(item['timestamp'])
        const formattedDate = new Date(timestamp)

        const year = formattedDate.getFullYear()
        const month = String(formattedDate.getMonth() + 1).padStart(2, '0')
        const day = String(formattedDate.getDate()).padStart(2, '0')
        const hours = String(formattedDate.getHours()).padStart(2, '0')
        const minutes = String(formattedDate.getMinutes()).padStart(2, '0')
        const seconds = String(formattedDate.getSeconds()).padStart(2, '0')

        date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
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
.table-container {
  margin-bottom: 1rem;
}
</style>
