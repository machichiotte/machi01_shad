<!-- OrdersTable.vue -->
<template>
    <table class="my-table">
        <thead>
            <tr>
                <th>Platform</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Amount</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="order in orders" :key="order._id.$oid">
                <td>{{ order.platform }}</td>
                <td>{{ order.symbol }}</td>
                <td>{{ order.side }}</td>
                <td>{{ order.amount }}</td>
                <td>{{ order.price }}</td>
            </tr>
        </tbody>
    </table>
</template>
  
<script>
export default {
    props: {
        orders: {
            type: Array,
            required: true,
        },
    },
};
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
  