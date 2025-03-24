<!-- src/components/trades/TradesTable.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { tradesColumns } from '../../js/columns'
import { Trade } from '../../types/responseData'

const props = defineProps<{
  rows: Trade[];      // Les trades déjà filtrés et triés
  itemsPerPage?: number;
}>()

const currentPage = ref(1)
const itemsPerPage = computed(() => props.itemsPerPage ?? 100)
const cols = tradesColumns

// Calcul du nombre total de pages
const totalPages = computed(() => {
  return Math.ceil(props.rows.length / itemsPerPage.value) || 1
})

// Réinitialise la page courante si les données changent et que la page actuelle n'existe plus
watch(() => props.rows, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1
  }
})

// Extraction des éléments pour la page courante
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return props.rows.slice(start, start + itemsPerPage.value)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
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
            {{ row[col.field as keyof Trade] }}
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
  margin-bottom: 1rem;
}

/* Mise en page fixe du tableau pour garantir des largeurs constantes */
.trades-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.trades-table th,
.trades-table td {
  border: 1px solid #ccc;
  padding: 0.2rem;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: small
}

/* Exemple de largeur fixe pour chaque colonne (à adapter selon tradesColumns) */
.trades-table th:nth-child(1),
.trades-table td:nth-child(1) {
  width: 30px;
}

.trades-table th:nth-child(2),
.trades-table td:nth-child(2) {
  width: 70px;
}

.trades-table th:nth-child(3),
.trades-table td:nth-child(3) {
  width: 50px;
}

.trades-table th:nth-child(4),
.trades-table td:nth-child(4) {
  width: 30px;
}

.trades-table th:nth-child(5),
.trades-table td:nth-child(5) {
  width: 30px;
}

.trades-table th:nth-child(6),
.trades-table td:nth-child(6) {
  width: 40px;
}

.trades-table th:nth-child(7),
.trades-table td:nth-child(7) {
  width: 60px;
}

.trades-table th:nth-child(8),
.trades-table td:nth-child(8) {
  width: 60px;
}

.trades-table th:nth-child(9),
.trades-table td:nth-child(9) {
  width: 30px;
}

.trades-table th:nth-child(10),
.trades-table td:nth-child(10) {
  width: 60px;
}

.trades-table th:nth-child(11),
.trades-table td:nth-child(11) {
  width: 30px;
}

.trades-table th:nth-child(12),
.trades-table td:nth-child(12) {
  width: 100px;
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
  border: none;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
</style>
