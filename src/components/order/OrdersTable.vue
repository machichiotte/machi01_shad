<!-- src/components/order/OrdersTable.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { openOrdersTableColumns } from '../../constants/columns'
import { Order } from '../../types/responseData'
import { usePagination } from '../../composables/usePagination'

// Déclaration des props attendues
const props = defineProps<{
  rows: Order[];
  itemsPerPage?: number;
}>()

// Les colonnes de la table
const cols = computed(() => openOrdersTableColumns)

// Création d'une computed property pour fournir les lignes au composable
const rowsForPagination = computed(() => props.rows)

// Utilisation du composable de pagination en passant la fonction qui retourne les lignes
const {
  currentPage,
  totalPages,
  paginatedItems: paginatedRows,
  prevPage,
  nextPage
} = usePagination(() => rowsForPagination.value, props.itemsPerPage ?? 20)
</script>

<template>
  <div class="table-container">
    <table class="orders-table">
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
            {{ row[col.field as keyof Order] }}
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
.table-container {
  margin-bottom: 0.2rem;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.orders-table th,
.orders-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Largeurs optimisées des colonnes */
.orders-table th:nth-child(1),
.orders-table td:nth-child(1) {
  width: 50px;
}

.orders-table th:nth-child(2),
.orders-table td:nth-child(2) {
  width: 80px;
}

.orders-table th:nth-child(3),
.orders-table td:nth-child(3),
.orders-table th:nth-child(6),
.orders-table td:nth-child(6) {
  width: 40px;
}

.orders-table th:nth-child(4),
.orders-table td:nth-child(4),
.orders-table th:nth-child(5),
.orders-table td:nth-child(5) {
  width: 50px;
}

.orders-table th:nth-child(7),
.orders-table td:nth-child(7) {
  width: 140px;
}

.orders-table th:nth-child(8),
.orders-table td:nth-child(8),
.orders-table th:nth-child(9),
.orders-table td:nth-child(9) {
  width: 100px;
}

.orders-table th:nth-child(10),
.orders-table td:nth-child(10) {
  width: 40px;
}

.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  color: #fff;
  cursor: pointer;
}

.pagination button:disabled {
  cursor: not-allowed;
}
</style>
