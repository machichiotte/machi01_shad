<!-- src/components/trades/TradesTable.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { tradesColumns } from '../../constants/columns'
import { TradeTransformed } from '../../types/responseData'
import { usePagination } from '../../composables/usePagination'

// Déclaration des props attendues
const props = defineProps<{
  rows: TradeTransformed[];      // Les trades déjà filtrés et triés
  itemsPerPage?: number;
}>()

// Les colonnes à afficher dans la table
const cols = computed(() => tradesColumns)

// Création d'une computed property pour fournir les lignes au composable
const rowsForPagination = computed(() => props.rows)

// Utilisation du composable de pagination
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
    <table class="trades-table">
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
.table-container {
  margin-bottom: 0.2rem;
}

/* Mise en page fixe du tableau pour garantir des largeurs constantes */
.trades-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.trades-table th,
.trades-table td {
  border: 1px solid var(--table-border);
  padding: 0.2rem;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: small;
}

/* Largeurs des colonnes optimisées */
.trades-table th:nth-child(1),
.trades-table td:nth-child(1) {
  width: 30px;
}

/* ID */
.trades-table th:nth-child(2),
.trades-table td:nth-child(2) {
  width: 70px;
}

/* Date */
.trades-table th:nth-child(3),
.trades-table td:nth-child(3) {
  width: 50px;
}

/* Symbol */
.trades-table th:nth-child(4),
.trades-table td:nth-child(4),
.trades-table th:nth-child(5),
.trades-table td:nth-child(5) {
  width: 30px;
}

/* Side, Type */
.trades-table th:nth-child(6),
.trades-table td:nth-child(6) {
  width: 40px;
}

/* Price */
.trades-table th:nth-child(7),
.trades-table td:nth-child(7),
.trades-table th:nth-child(8),
.trades-table td:nth-child(8) {
  width: 60px;
}

/* Amount, Total */
.trades-table th:nth-child(9),
.trades-table td:nth-child(9) {
  width: 30px;
}

/* Fee */
.trades-table th:nth-child(10),
.trades-table td:nth-child(10) {
  width: 60px;
}

/* Fee Currency */
.trades-table th:nth-child(11),
.trades-table td:nth-child(11) {
  width: 30px;
}

/* Status */
.trades-table th:nth-child(12),
.trades-table td:nth-child(12) {
  width: 100px;
}

/* Actions */

.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.pagination button:disabled {
  cursor: not-allowed;
}
</style>
