<!-- src/components/order/OrdersTable.vue -->
<script setup lang="ts">
import { watch, computed, ref } from 'vue';
import { openOrdersTableColumns } from '../../js/columns';
import { Order } from '../../types/responseData';

const currentPage = ref(1);
const cols = ref(openOrdersTableColumns)

const props = defineProps<{
  rows: Order[];
  globalFilter?: string;
  itemsPerPage?: number;
}>()

const itemsPerPage = computed(() => props.itemsPerPage ?? 20);

const filteredRows = computed(() => {
  // On transforme toujours les rows pour calculer le total
  const transformedRows = props.rows.map((item: Order) => {
    const total = (item.amount * item.price).toFixed(2);
    return {
      platform: item.platform,
      symbol: item.symbol,
      side: item.side,
      amount: item.amount,
      price: item.price,
      total,
      _id: item._id,
      oId: item.oId,
      cId: item.cId,
      type: item.type
    };
  }).reverse();

  // Si aucun filtre global n'est appliqué, on renvoie directement le tableau transformé
  if (!props.globalFilter || props.globalFilter.trim() === '') {
    return transformedRows;
  }

  // Sinon, on applique le filtre sur le tableau transformé
  const filterText = props.globalFilter.toLowerCase();
  return transformedRows.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(filterText)
    )
  );
});


const totalPages = computed(() => {
  return Math.ceil(filteredRows.value.length / itemsPerPage.value) || 1;
});

watch(filteredRows, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
});

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredRows.value.slice(start, start + itemsPerPage.value);
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
  }
};

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
  margin-top: 1rem;
}

/* Mise en page fixe du tableau */
.orders-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.orders-table th:nth-child(1),
.orders-table td:nth-child(1) {
  width: 50px;
}

.orders-table th:nth-child(2),
.orders-table td:nth-child(2) {
  width: 80px;
}

.orders-table th:nth-child(3),
.orders-table td:nth-child(3) {
  width: 40px;
}

.orders-table th:nth-child(4),
.orders-table td:nth-child(4) {
  width: 50px;
}

.orders-table th:nth-child(5),
.orders-table td:nth-child(5) {
  width: 50px;
}

.orders-table th:nth-child(6),
.orders-table td:nth-child(6) {
  width: 40px;
}

.orders-table th:nth-child(7),
.orders-table td:nth-child(7) {
  width: 140px;
}

.orders-table th:nth-child(8),
.orders-table td:nth-child(8) {
  width: 100px;
}

.orders-table th:nth-child(9),
.orders-table td:nth-child(9) {
  width: 100px;
}

.orders-table th:nth-child(10),
.orders-table td:nth-child(10) {
  width: 40px;
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
