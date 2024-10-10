<!-- src/components/machi/NextSellsTable.vue -->
<template>
  <table class="my-table">
    <thead>
      <tr>
        <th>Amount</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(nextSell, index) in data" :key="index">
        <td>{{ nextSell.amount }}</td>
        <td>{{ nextSell.price }}</td>
        <td>{{ nextSell.total }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
interface NextSell {
  amount: number;
  price: number;
  total: number;
}

const props = defineProps<{
  data: NextSell[];
}>()

export { props }
</script>

<style scoped>
.my-table {
  width: 100%;
  border-collapse: collapse;
}

.my-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.my-table th {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  background-color: #f2f2f2;
}
</style>