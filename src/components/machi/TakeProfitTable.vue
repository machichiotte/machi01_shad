<!-- src/components/machi/TakeProfitTable.vue -->
<script setup lang="ts">
import { Machi, Order } from '../../types/responseData';

const props = defineProps<{
    item: Machi;
    orders: Order[];
}>();

const item = props.item;
//const trades = props.trades;
//const orders = props.orders;
// Ajouter la logique pour gérer l'affichage des données
</script>

<template>
    <div>
        <h3>Take Profit Details for {{ item.base }}</h3>
        <p>Platform: {{ item.platform }}</p>


    </div>
</template>

<style scoped>
h3 {
    margin-bottom: 1rem;
}
</style>
