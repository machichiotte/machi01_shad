// File: src/components/dashboard/card/AssetPanel.vue

<script setup lang="ts">
import { computed, ref, PropType, onMounted, watch } from 'vue';
import { Asset, Order, Trade, TradeTransformed } from '../../../types/responseData';
import { filterOrdersByAsset, filterTradesByAsset } from '../../../utils/filter';
import AssetPanelHeader from './AssetPanelHeader.vue';
import AssetPanelDetails from './AssetPanelDetail.vue';
import Panel from 'primevue/panel';

function transformRawTrades(tradesToTransform: Trade[]): TradeTransformed[] {
    return tradesToTransform
        .map((item: Trade): TradeTransformed => {
            let date: string;
            let timestampVal = 0;

            // Robust timestamp handling
            if (typeof item.timestamp === 'number' && item.timestamp > 0) {
                timestampVal = item.timestamp < 2e9 ? item.timestamp * 1000 : item.timestamp;
                try {
                    const formattedDate = new Date(timestampVal);
                    if (isNaN(formattedDate.getTime())) {
                        date = 'Invalid timestamp';
                    } else {
                        const year = formattedDate.getFullYear();
                        const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
                        const day = String(formattedDate.getDate()).padStart(2, '0');
                        const hours = String(formattedDate.getHours()).padStart(2, '0');
                        const minutes = String(formattedDate.getMinutes()).padStart(2, '0');
                        const seconds = String(formattedDate.getSeconds()).padStart(2, '0');
                        date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                    }
                } catch (e) {
                    date = 'Date processing error';
                    console.error("Error processing timestamp:", item.timestamp, e);
                }
            } else if (typeof item.dateUTC === 'string' && item.dateUTC) {
                date = item.dateUTC;
            } else {
                date = 'No valid date source';
            }

            // Safe eqUSD handling
            const eqUsd = (typeof item.eqUSD === 'number' && !isNaN(item.eqUSD)) ? item.eqUSD : 0;

            // Return the transformed object
            return {
                base: item.base ?? 'N/A',
                quote: item.quote ?? 'N/A',
                dateUTC: date,
                orderid: item.orderid ?? 'N/A',
                pair: item.pair ?? 'N/A',
                side: item.side ?? 'N/A',
                price: item.price ?? 0,
                amount: item.amount ?? 0,
                total: item.total ?? 0,
                eqUSD: eqUsd,
                fee: item.fee ?? 0,
                feecoin: item.feecoin ?? '',
                platform: item.platform ?? 'N/A',
                timestampVal
            };
        })
        .sort((a, b) => b.timestampVal - a.timestampVal);
}

// Props: Remain the same
const props = defineProps({
    asset: { type: Object as PropType<Asset>, required: true },
    trades: { type: Array as PropType<Trade[]>, required: true },
    orders: { type: Array as PropType<Order[]>, required: true },
    availableMarkets: { type: Array as PropType<string[]>, default: () => [] },
});

// --- State ---
const isExpanded = ref(false);
const selectedMarket = ref<string | null>(null);

// --- Computed Properties ---
const filteredTrades = computed(() => filterTradesByAsset(props.trades, props.asset.base, props.asset.platform));
const filteredOrders = computed(() => filterOrdersByAsset(props.orders, props.asset.base, props.asset.platform));

const transformedTrades = computed<TradeTransformed[]>(() => {
    return transformRawTrades(filteredTrades.value);
});

// --- Methods ---
const handleCollapsedUpdate = (collapsed: boolean) => {
    isExpanded.value = !collapsed;
};

const updateSelectedMarket = (market: string | null) => {
    selectedMarket.value = market;
}

onMounted(() => {
    // Ensure availableMarkets is populated before selecting
    if (props.availableMarkets && props.availableMarkets.length > 0) {
        const priorityMarkets = ['USDT', 'USD', 'FDUSD', 'USDC']; // Add other common quotes if needed
        const defaultMarket = priorityMarkets
            .map(suffix => `${props.asset.base}${suffix}`) // Use template literal
            .find(symbol => props.availableMarkets.includes(symbol));

        selectedMarket.value = defaultMarket ?? props.availableMarkets[0]; // Fallback to the first available
    } else {
        selectedMarket.value = null; // No markets available
    }
});

// --- Watcher (Optional but good practice): If availableMarkets change externally ---
watch(() => props.availableMarkets, (newMarkets) => {
    if (newMarkets && newMarkets.length > 0) {
        // Re-evaluate selectedMarket if current one is no longer available or if none was selected
        if (!selectedMarket.value || !newMarkets.includes(selectedMarket.value)) {
            const priorityMarkets = ['USDT', 'USD', 'FDUSD', 'USDC'];
            const defaultMarket = priorityMarkets
                .map(suffix => `${props.asset.base}${suffix}`)
                .find(symbol => newMarkets.includes(symbol));
            selectedMarket.value = defaultMarket ?? newMarkets[0];
        }
    } else {
        selectedMarket.value = null;
    }
}, { immediate: true });

</script>

<template>
    <Panel :toggleable="true" :collapsed="!isExpanded" @update:collapsed="handleCollapsedUpdate" class="asset-panel">
        <template #header>
            <AssetPanelHeader :asset="props.asset" :orders="filteredOrders" :available-markets="props.availableMarkets"
                :trades="[]" :selected-market="selectedMarket" @update:selected-market="updateSelectedMarket" />
        </template>

        <AssetPanelDetails v-if="isExpanded" :asset="props.asset" :orders="filteredOrders" :trades="transformedTrades"
            :selected-market="selectedMarket" :available-markets="props.availableMarkets" />
        <template #footer>
        </template>

        <template #icons>
        </template>
    </Panel>
</template>

<style scoped>
/* Style the Panel component using :deep() for internal PrimeVue classes */
.asset-panel {
    margin-bottom: 1rem;
    background-color: var(--card-primary-bg);
    border-radius: 15px;
    overflow: hidden;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Customize Panel Header */
:deep(.asset-panel .p-panel-header) {
    padding: 0;
    background-color: transparent;
    border-bottom: 1px solid var(--primary-border);
}

/* Ensure the header content aligns properly */
:deep(.asset-panel .p-panel-header .p-panel-title) {
    display: block;
    width: 100%;
}


/* Customize Panel Content Area */
:deep(.asset-panel .p-panel-content) {
    padding: 0;
    background-color: var(--card-primary-bg);
    border: none;
    border-radius: 0 0 15px 15px;
}

/* Style the toggle icon if needed */
:deep(.asset-panel .p-panel-header .p-panel-header-icon) {
    color: var(--secondary-text);
}

:deep(.asset-panel .p-panel-header .p-panel-header-icon:hover) {
    color: var(--primary-text);
}
</style>