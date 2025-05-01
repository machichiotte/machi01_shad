<!-- src/components/trades/TradesTable.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { tradesColumns } from '../../constants/columns'
import { TradeTransformed } from '../../types/responseData'
import { usePagination } from '../../composables/usePagination'

const props = defineProps<{
  rows: TradeTransformed[]; 
  itemsPerPage?: number;
}>()

const cols = computed(() => tradesColumns)

const rowsForPagination = computed(() => props.rows)

const {
  currentPage,
  totalPages,
  paginatedItems: paginatedRows,
  prevPage,
  nextPage
} = usePagination(() => rowsForPagination.value, props.itemsPerPage ?? 100)
</script>

<template>
  <div class="table-container">
    <table class="table">
      <thead>
        <tr>
          <th v-for="(col, index) in cols" :key="index">
            {{ col.header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in paginatedRows" :key="index">
          <td v-for="(col, idx) in cols" :key="idx">
            {{ row[col.field as keyof TradeTransformed] }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<style scoped>
/* Largeurs des colonnes optimisées */
.table th:nth-child(1),
.table td:nth-child(1) {
  width: 30px;
}

/* ID */
.table th:nth-child(2),
.table td:nth-child(2) {
  width: 70px;
}

/* Date */
.table th:nth-child(3),
.table td:nth-child(3) {
  width: 50px;
}

/* Symbol */
.table th:nth-child(4),
.table td:nth-child(4),
.table th:nth-child(5),
.table td:nth-child(5) {
  width: 30px;
}

/* Side, Type */
.table th:nth-child(6),
.table td:nth-child(6) {
  width: 40px;
}

/* Price */
.table th:nth-child(7),
.table td:nth-child(7),
.table th:nth-child(8),
.table td:nth-child(8) {
  width: 60px;
}

/* Amount, Total */
.table th:nth-child(9),
.table td:nth-child(9) {
  width: 30px;
}

/* Fee */
.table th:nth-child(10),
.table td:nth-child(10) {
  width: 60px;
}

/* Fee Currency */
.table th:nth-child(11),
.table td:nth-child(11) {
  width: 30px;
}

/* Status */
.table th:nth-child(12),
.table td:nth-child(12) {
  width: 100px;
}


</style>
