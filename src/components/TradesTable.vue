<!-- OrdersTable.vue -->
<template>
    <table class="my-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Pair</th>
                <th>Type</th>
                <th>Price</th>
                <th>Amount</th>
                <th>Total</th>
                <th>Total (USDT)</th>
                <th>Fee</th>
                <th>Platform</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="trade in trades" :key="trade._id.$oid">
                <td>{{ trade.date }}</td>
                <td>{{ trade.pair }}</td>
                <td>{{ trade.type }}</td>
                <td>{{ parseFloat(trade.price).toFixed(6) }}</td>
                <td>{{ trade.amount }}</td>
                <td>{{ trade.total }}</td>
                <td>{{ trade.totalUSDT }}</td>
                <td>{{ trade.fee }} {{ trade.feecoin }}</td>
                <td>{{ trade.platform }}</td>
            </tr>
        </tbody>
    </table>
</template>
  
<script>
export default {
    props: {
        trades: {
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
  