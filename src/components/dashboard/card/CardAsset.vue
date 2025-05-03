// File: src/components/dashboard/card/CardAsset.vue

<script setup lang="ts">
import { computed, ref, PropType } from 'vue';
import { Asset, Order, Trade, TradeTransformed } from '../../../types/responseData';
import { filterOrdersByAsset, filterTradesByAsset } from '../../../utils/filter';
// Consider moving transformation logic to a separate utility file
import CardAssetHeader from './CardAssetHeader.vue';
import CardAssetDetail from './CardAssetDetail.vue'; // Uses TabView internally as per previous step
import Panel from 'primevue/panel'; // Import Panel

function transformRawTrades(tradesToTransform: Trade[]): TradeTransformed[] {
    return tradesToTransform
        .map((item: Trade): TradeTransformed => { // Explicit return type for clarity
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
                timestampVal // Keep for sorting
            };
        })
        .sort((a, b) => b.timestampVal - a.timestampVal); // Sort descending
}

// Props: Remain the same
const props = defineProps({
    asset: { type: Object as PropType<Asset>, required: true },
    trades: { type: Array as PropType<Trade[]>, required: true }, // Expecting full list
    orders: { type: Array as PropType<Order[]>, required: true }, // Expecting full list
    availableMarkets: { type: Array as PropType<string[]>, default: () => [] },
});

// --- State ---
// Controls the expanded/collapsed state of the Panel
const isExpanded = ref(false); // Default to collapsed

// --- Computed Properties ---
// Filter trades and orders based on the *incoming* full lists and the current asset/platform
const filteredTrades = computed(() => filterTradesByAsset(props.trades, props.asset.base, props.asset.platform));
const filteredOrders = computed(() => filterOrdersByAsset(props.orders, props.asset.base, props.asset.platform));

// Transformation des trades en TradeTransformed - Use filteredTrades and the utility function
const transformedTrades = computed<TradeTransformed[]>(() => {
    // Call the dedicated transformer function
    return transformRawTrades(filteredTrades.value);
});

// --- Methods ---
// Method to sync Panel's collapsed state with our local isExpanded ref
// The 'collapsed' event payload from Panel is true if it *became* collapsed
const handleCollapsedUpdate = (collapsed: boolean) => {
    isExpanded.value = !collapsed;
};

</script>

<template>
    <Panel :toggleable="true" :collapsed="!isExpanded" @update:collapsed="handleCollapsedUpdate" class="asset-panel">
        <template #header>
            <CardAssetHeader :asset="props.asset" :orders="filteredOrders" :available-markets="props.availableMarkets"
                :trades="[]" />
        </template>

        <CardAssetDetail v-if="isExpanded" :asset="props.asset" :orders="filteredOrders" :trades="transformedTrades" />
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