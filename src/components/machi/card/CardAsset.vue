<!-- src/components/machi/card/CardAsset.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import { Asset, Order, Trade, TradeTransformed } from '../../../types/responseData';
import { filterOrdersByAsset, filterTradesByAsset } from '../../../utils/filter';
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

// Transformation des trades en TradeTransformed
const transformedTrades = computed<TradeTransformed[]>(() => {
    return trades
        .map((item: Trade) => {
            let date: string;
            let timestampVal = 0;
            if (item.timestamp) {
                // Si le timestamp est en secondes, le convertir en millisecondes
                timestampVal =
                    item.timestamp.toString().length <= 10 ? item.timestamp * 1000 : item.timestamp;
                const formattedDate = new Date(timestampVal);
                const year = formattedDate.getFullYear();
                const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
                const day = String(formattedDate.getDate()).padStart(2, '0');
                const hours = String(formattedDate.getHours()).padStart(2, '0');
                const minutes = String(formattedDate.getMinutes()).padStart(2, '0');
                const seconds = String(formattedDate.getSeconds()).padStart(2, '0');
                date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            } else if (typeof item.dateUTC === 'string') {
                date = item.dateUTC;
            } else {
                date = 'Invalid date';
            }
            const eqUsd = item.eqUSD !== null ? item.eqUSD : 0;
            return {
                base: item.base,
                quote: item.quote,
                dateUTC: date,
                orderid: item.orderid,
                pair: item.pair,
                side: item.side,
                price: item.price,
                amount: item.amount,
                total: item.total,
                eqUSD: eqUsd,
                fee: item.fee,
                feecoin: item.feecoin,
                platform: item.platform,
                timestampVal // propriété utilisée pour le tri
            } as TradeTransformed;
        })
        .sort((a, b) => b.timestampVal - a.timestampVal); // Tri décroissant
});

</script>

<template>
    <div class="card">
        <CardAssetHeader :asset="asset" :orders="orders" :trades="trades" :is-details-visible="isDetailsVisible"
            @toggle-details="toggleDetails" />
        <CardAssetDetail v-if="isDetailsVisible" :asset="asset" :orders="orders" :trades="transformedTrades" />
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