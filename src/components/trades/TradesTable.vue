<!-- src/components/TradeTable.vue -->
<template>
  <div class="table-container">
    <DataTable :value="rows" :rows="itemsPerPage" columnResizeMode="fit" :paginator="true" scrollable :filters="filters" sortField="date" :sortOrder="-1">
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Find Assets</h4>
        </div>
      </template>

      <Column v-for="(col, index) in cols" :key="index" :field="col.field" :header="col.header" sortable></Column>
    </DataTable>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { tradesColumns } from '../../js/columns.js'

const props = defineProps({
  rows: {
    type: Array,
    required: true
  },
  itemsPerPage: {
    type: Number,
    required: true
  },
  filters: {
    type: Object,
    required: true
  }
})

const cols = tradesColumns
</script>

<style scoped>
.table-container {
  margin-bottom: 1rem;
}
</style>
