<!-- src/components/machi/TakeProfitTable.vue -->
<script setup lang="ts">
import { Machi, Order } from '../../types/responseData';

// Déclaration des props
const props = defineProps<{
    item: Machi;
    orders: Order[];
}>();

const item = props.item;
const orders = props.orders;

// Génération des données pour le tableau des Take Profits
const tpData = [
    { tp: 'TP1', price: item.priceTp1, amount: item.amountTp1, total: item.recupTp1 },
    { tp: 'TP2', price: item.priceTp2, amount: item.amountTp2, total: item.recupTpX },
    { tp: 'TP3', price: item.priceTp3, amount: item.amountTp3, total: item.recupTpX },
    { tp: 'TP4', price: item.priceTp4, amount: item.amountTp4, total: item.recupTpX },
    { tp: 'TP5', price: item.priceTp5, amount: item.amountTp5, total: item.recupTpX }
];

// Fonction pour formater le total avec deux décimales
const formatTotal = (total: number) => {
    return total.toFixed(2);
};

// Fonction pour déterminer le statut basé sur les ordres
const getStatus = (tpAmount: number, tpPrice: number) => {
    const matchingOrder = orders.find(order => order.amount === tpAmount && order.price === tpPrice);
    return matchingOrder ? 'OK' : 'NOK';
};

// Transformation des données avec formatage du total et définition du statut
const tpDataWithStatus = tpData.map(tp => ({
    ...tp,
    total: formatTotal(tp.total), // Formater le total avec deux décimales
    status: getStatus(tp.amount, tp.price) // Déterminer le statut
}));
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
