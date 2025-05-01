<!-- src/components/cmc/CmcTable.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { cmcColumns } from '../../constants/columns'
import { usePagination } from '../../composables/usePagination'

interface CmcRow {
    rank: number;
    name: string;
    symbol: string;
    price: number;
    tags: string;
}

const props = defineProps<{
    rows: CmcRow[];
    itemsPerPage?: number;
}>()

const cols = computed(() => cmcColumns)

const rowsForPagination = computed(() => props.rows)

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
.table th:nth-child(1),
.table td:nth-child(1) {
    width: 30px;
}

.table th:nth-child(2),
.table td:nth-child(2) {
    width: 100px;
}

.table th:nth-child(3),
.table td:nth-child(3) {
    width: 50px;
}

.table th:nth-child(4),
.table td:nth-child(4) {
    width: 80px;
}

.table th:nth-child(5),
.table td:nth-child(5) {
    width: 150px;
}
</style>
