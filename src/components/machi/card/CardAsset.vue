// File: src/components/machi/card/CardAsset.vue

<script setup lang="ts">
import { computed, ref, PropType } from 'vue'; // Import PropType
import { Asset, Order, Trade, TradeTransformed } from '../../../types/responseData';
import { filterOrdersByAsset, filterTradesByAsset } from '../../../utils/filter';
import CardAssetHeader from './CardAssetHeader.vue';
import CardAssetDetail from './CardAssetDetail.vue'; // Corrected import name

// Props: Add the new props
const props = defineProps({
    asset: { type: Object as PropType<Asset>, required: true },
    trades: { type: Array as PropType<Trade[]>, required: true }, // Expecting full list
    orders: { type: Array as PropType<Order[]>, required: true }, // Expecting full list
    availableMarkets: { type: Array as PropType<string[]>, default: () => [] }, // <-- New prop
});

// Données locales - Keep your filtering
const asset = props.asset;
// Filter trades and orders based on the *incoming* full lists and the current asset/platform
const filteredTrades = computed(() => filterTradesByAsset(props.trades, asset.base, asset.platform));
const filteredOrders = computed(() => filterOrdersByAsset(props.orders, asset.base, asset.platform));

// Gestion des détails - Keep your toggle logic
const isDetailsVisible = ref(false);
const toggleDetails = () => (isDetailsVisible.value = !isDetailsVisible.value);

// Transformation des trades en TradeTransformed - Use filteredTrades
const transformedTrades = computed<TradeTransformed[]>(() => {
    return filteredTrades.value // Use the filtered list here
        .map((item: Trade) => {
            let date: string;
            let timestampVal = 0;
            if (item.timestamp) {
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
                timestampVal
            } as TradeTransformed;
        })
        .sort((a, b) => b.timestampVal - a.timestampVal);
});

</script>

<template>
    <div class="card">
        <CardAssetHeader :asset="asset" :orders="filteredOrders" :trades="filteredTrades"
            :is-details-visible="isDetailsVisible" :available-markets="props.availableMarkets"
            @toggle-details="toggleDetails" />
        <CardAssetDetail v-if="isDetailsVisible" :asset="asset" :orders="filteredOrders" :trades="transformedTrades" />
    </div>
</template>

<style scoped>
/* Your existing styles */
.card {
    background-color: var(--card-primary-bg);
    color: var(--primary-text);
    border-radius: 15px;
    margin: 0rem;
    padding: 0.5rem;
    cursor: pointer;
    max-width: 100%;
    overflow: hidden;
}

</style> 

