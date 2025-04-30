<!-- src/components/cmc/CmcTable.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { cmcColumns } from '../../constants/columns'
import { usePagination } from '../../composables/usePagination'

// Définition de l'interface pour une ligne de données CMC
interface CmcRow {
    rank: number;
    name: string;
    symbol: string;
    price: number;
    tags: string;
}

// Déclaration des props attendues
const props = defineProps<{
    rows: CmcRow[];
    itemsPerPage?: number;
}>()

// Les colonnes de la table
const cols = computed(() => cmcColumns)

// Création d'un getter pour les lignes afin de les passer au composable
const rowsForPagination = computed(() => props.rows)

// Utilisation du composable de pagination en passant la fonction de récupération
// On ne destructure que les propriétés nécessaires
const {
    currentPage,
    totalPages,
    paginatedItems: paginatedRows,
    prevPage,
    nextPage
} = usePagination(() => rowsForPagination.value, props.itemsPerPage ?? 10)
</script>

<template>
    <div class="table-container">
        <table class="cmc-table">
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
                        {{ row[col.field as keyof CmcRow] }}
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
    margin-top: 1rem;
}

.cmc-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

.cmc-table th:nth-child(1),
.cmc-table td:nth-child(1) {
    width: 30px;
}

.cmc-table th:nth-child(2),
.cmc-table td:nth-child(2) {
    width: 100px;
}

.cmc-table th:nth-child(3),
.cmc-table td:nth-child(3) {
    width: 50px;
}

.cmc-table th:nth-child(4),
.cmc-table td:nth-child(4) {
    width: 80px;
}

.cmc-table th:nth-child(5),
.cmc-table td:nth-child(5) {
    width: 150px;
}

.cmc-table th,
.cmc-table td {
    border: 1px solid var(--table-border);
    padding: 0.5rem;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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
    cursor: pointer;
}

.pagination button:disabled {
    cursor: not-allowed;    
}
</style>
