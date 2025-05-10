<!-- src/components/dashboard/TakeProfitTable.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { Order, TakeProfits } from '../../types/responseData';

// Déclaration des props
const props = defineProps<{
    takeProfits: TakeProfits;
    orders: Order[];
}>();

// Fonction pour formater le total avec deux décimales
const formatTotal = (total: number) => {
    return total.toFixed(2);
};

// Fonction pour déterminer le statut basé sur les ordres
const getStatus = (tpAmount: number, tpPrice: number) => {
    const matchingOrder = props.orders.find(order => order.amount === tpAmount && order.price === tpPrice);
    return matchingOrder ? 'OK' : 'NOK';
};

// Transformation des données avec formatage du total et définition du statut
const tpDataWithStatus = computed(() => {
    return [
        { tp: 'TP1', price: props.takeProfits.tp1.price, amount: props.takeProfits.tp1.amount, total: formatTotal(props.takeProfits.tp1.price * props.takeProfits.tp1.amount), status: getStatus(props.takeProfits.tp1.amount, props.takeProfits.tp1.price) },
        { tp: 'TP2', price: props.takeProfits.tp2.price, amount: props.takeProfits.tp2.amount, total: formatTotal(props.takeProfits.tp2.price * props.takeProfits.tp2.amount), status: getStatus(props.takeProfits.tp2.amount, props.takeProfits.tp2.price) },
        { tp: 'TP3', price: props.takeProfits.tp3.price, amount: props.takeProfits.tp3.amount, total: formatTotal(props.takeProfits.tp3.price * props.takeProfits.tp3.amount), status: getStatus(props.takeProfits.tp3.amount, props.takeProfits.tp3.price) },
        { tp: 'TP4', price: props.takeProfits.tp4.price, amount: props.takeProfits.tp4.amount, total: formatTotal(props.takeProfits.tp4.price * props.takeProfits.tp4.amount), status: getStatus(props.takeProfits.tp4.amount, props.takeProfits.tp4.price) },
        { tp: 'TP5', price: props.takeProfits.tp5.price, amount: props.takeProfits.tp5.amount, total: formatTotal(props.takeProfits.tp5.price * props.takeProfits.tp5.amount), status: getStatus(props.takeProfits.tp5.amount, props.takeProfits.tp5.price) }
    ];
});
</script>

<template>
    <div>
        <div class="table-container">
            <table class="take-profit-table">
                <thead>
                    <tr>
                        <th>TP</th>
                        <th>Price</th>
                        <th>Amount</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(tp, index) in tpDataWithStatus" :key="index">
                        <td>{{ tp.tp }}</td>
                        <td>{{ tp.price }}</td>
                        <td>{{ tp.amount }}</td>
                        <td>{{ tp.total }}</td>
                        <td>{{ tp.status }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.table-container {
    margin-top: 1rem;
}

.take-profit-table {
    width: 100%;
    border-collapse: collapse;
}

.take-profit-table th,
.take-profit-table td {
    border: 1px solid black;
    padding: 0.5rem;
    text-align: center;
}
</style>
