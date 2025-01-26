<!-- src/components/machi/card/CardAsset.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { Asset, Order, Trade } from '../../../types/responseData';
import { filterOrdersByAsset, filterTradesByAsset } from '../../../js/utils/filter';
import CardAssetHeader from './CardAssetHeader.vue';
import CardAssetDetail from './CardAssetDetail.vue';

// Props
const props = defineProps<{
    asset: Asset;
    trades: Trade[];
    orders: Order[];
}>();

// Données locales
const asset = props.asset;
const trades = filterTradesByAsset(props.trades, asset.base, asset.platform);
const orders = filterOrdersByAsset(props.orders, asset.base, asset.platform);

// Gestion des détails
const isDetailsVisible = ref(false);
const toggleDetails = () => (isDetailsVisible.value = !isDetailsVisible.value);

</script>

<template>
    <div class="card">
        <CardAssetHeader
            :asset="asset"
            :orders="orders"
            :trades="trades"
            :is-details-visible="isDetailsVisible"
            @toggle-details="toggleDetails"
        />
        <CardAssetDetail
            v-if="isDetailsVisible"
            :asset="asset"
            :orders="orders"
            :trades="trades"
        />
    </div>
</template>

<style scoped>

/* Variables CSS pour des couleurs et styles réutilisables */
:root {
    --primary-bg: #f4f4f4;
    --secondary-bg: #eaeaea;
    --highlight-color: #4caf50;
    --danger-color: #ff4c4c;
    --neutral-color: #777;
    --font-main: 'Roboto', sans-serif;
    --transition-duration: 0.3s;
}

.card {
    background-color: #ddd;
    color: #666;
    border-radius: 15px;
    margin: 1rem;
    padding: 0.5rem;
    cursor: pointer;
    max-width: 100%;
    overflow: hidden;
    font-family: 'Roboto', sans-serif;
    transition: box-shadow 0.3s;
}

.card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

small {
    font-size: 0.8rem;
    color: #777;
}

</style>