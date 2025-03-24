<!-- src/components/machi/CmcTable.vue -->
<script setup lang="ts">
import { cmcColumns } from '../../js/columns.ts'
import { computed, ref, watch } from 'vue'

interface CmcRow {
    rank: number;
    name: string;
    symbol: string;
    price: number;
    tags: string;
}

const currentPage = ref(1)
const cols = ref(cmcColumns)

const props = defineProps<{
    rows: CmcRow[];
    itemsPerPage?: number;
}>()

const itemsPerPage = computed(() => props.itemsPerPage ?? 100)

const totalPages = computed(() => Math.ceil(props.rows.length / itemsPerPage.value) || 1)

watch(() => props.rows, () => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = 1
    }
})

const paginatedRows = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return props.rows.slice(start, start + itemsPerPage.value)
})

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value -= 1
    }
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value += 1
    }
}
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
    border: 1px solid #ccc;
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
    background-color: #007bff;
    color: #fff;
    cursor: pointer;
}

.pagination button:disabled {
    background-color: #aaa;
    cursor: not-allowed;
}
</style>
