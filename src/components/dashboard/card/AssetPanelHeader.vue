// File: src/components/dashboard/card/AssetPanelHeader.vue

<script setup lang="ts">
import { computed, PropType } from 'vue';
import { Asset, Order, Trade } from '../../../types/responseData'; // Keep Trade if used, remove if not
import { formatNumberWithDynamicPrecision } from '../../../utils/formatter';
import { useLiveDataStore } from '../../../store/liveDataStore';
import {
    getQuoteCurrency,
    getCurrencySymbol,
    formatMarketSymbolForDisplay,
    getPriceDisplayPrecision,
    getChangeStatusClass
} from '../../../utils/marketUtils';

const emit = defineEmits(['update:selectedMarket']);

const props = defineProps({
    asset: { type: Object as PropType<Asset>, required: true },
    orders: { type: Array as PropType<Order[]>, required: true },
    availableMarkets: { type: Array as PropType<string[]>, default: () => [] },
    trades: { type: Array as PropType<Trade[]>, required: false, default: () => [] },
    selectedMarket: { type: String as PropType<string | null>, required: true }
});

const liveDataStore = useLiveDataStore();
const asset = props.asset;

// --- Computed properties remain the same ---
const inOrderAmount = computed(() => {
    return props.orders.reduce((total, order) => total + (order.amount || 0), 0);
});

const quoteCurrency = computed(() => getQuoteCurrency(props.selectedMarket));
const quoteCurrencySymbol = computed(() => getCurrencySymbol(quoteCurrency.value));

const displayPrice = computed(() => {
    if (!props.selectedMarket) return '...';
    const price = liveDataStore.getCurrentPrice(props.selectedMarket);
    if (typeof price !== 'number' || isNaN(price)) return '...';
<<<<<<< HEAD
    return price;
=======
    const precision = getPriceDisplayPrecision(quoteCurrency.value);
    return formatNumberWithDynamicPrecision(price, precision);
>>>>>>> 233dfa5cb34235d296464c3f1a2f6bca2c61f328
});

const liveChangePercentValue = computed(() => {
    if (!props.selectedMarket) return undefined;
    return liveDataStore.getChangePercent(props.selectedMarket);
});

const formattedLiveChangePercent = computed(() => {
    const change = liveChangePercentValue.value;
    return change !== undefined ? change.toFixed(2) : "--";
});

const liveChangeClass = computed(() => {
    return getChangeStatusClass(liveChangePercentValue.value);
});

const formattedProfit = computed(() => {
    return asset.profit !== undefined ? asset.profit.toFixed(2) : "--";
});

const profitClass = computed(() => {
    return getChangeStatusClass(asset.profit);
});

const currentPossessionValue = computed(() => {
    const currentRawPrice = props.selectedMarket
        ? liveDataStore.getCurrentPrice(props.selectedMarket)
        : undefined;
    const currentAmount = asset.liveData?.balance;

    if (typeof currentRawPrice === 'number' && typeof currentAmount === 'number' && !isNaN(currentRawPrice) && !isNaN(currentAmount)) {
        const totalValue = currentRawPrice * currentAmount;
        const precision = getPriceDisplayPrecision(quoteCurrency.value);
        return formatNumberWithDynamicPrecision(totalValue, precision);
    } else {
        return '...';
    }
});

// --- Event Handler for Select Change ---
const handleMarketChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    emit('update:selectedMarket', target.value || null); // Emit the selected value
}

</script>

<template>
    <div class="card-header-content compact">
        <div class="asset-market-section">
            <div class="asset-identity">
                <img v-if="asset.iconUrl" :src="asset.iconUrl" alt="" class="logo"
                    @error="($event.target as HTMLImageElement).style.display = 'none'" />
                <div class="asset-info">
                    <span class="asset-name">{{ asset.name }}</span>
                    <span class="asset-base-rank">
                        {{ asset.base }} {{ asset.cmc?.rank ? '#' + asset.cmc.rank : '' }}
                    </span>
                </div>
            </div>
            <div class="market-selector">
                <select :value="selectedMarket" @change="handleMarketChange">
                    <option :value="null" disabled v-if="!selectedMarket && availableMarkets.length === 0">...</option>
                    <option :value="null" disabled v-else-if="!selectedMarket">Select Market</option>
                    <option v-for="market in availableMarkets" :key="market" :value="market">
                        {{ formatMarketSymbolForDisplay(market) }}
                    </option>
                </select>
            </div>
        </div>

        <div class="price-change-section">
            <div class="current-price">
                <span class="value fixed-width">{{ displayPrice }}</span>
                <span class="currency">{{ quoteCurrencySymbol }}</span>
            </div>
            <div class="change-percent fixed-width" :class="liveChangeClass">
                {{ formattedLiveChangePercent }}%
            </div>
        </div>

        <div class="possession-profit-section">
            <div class="current-possession">
                <span class="value fixed-width">{{ currentPossessionValue }}</span>
                <span class="currency">{{ quoteCurrencySymbol }}</span>
            </div>
            <div class="profit-percent fixed-width" :class="profitClass">
                {{ formattedProfit }}%
            </div>
        </div>

        <div class="balance-order-section">
            <span class="label">Balance:</span>
            <span class="value fixed-width">{{ formatNumberWithDynamicPrecision(asset.liveData?.balance ?? 0, 8)
<<<<<<< HEAD
                }}</span>
=======
            }}</span>
>>>>>>> 233dfa5cb34235d296464c3f1a2f6bca2c61f328
            <span class="base">{{ asset.base }}</span>

            <template v-if="inOrderAmount > 0">
                <span class="label">Order:</span>
                <span class="value fixed-width">{{ formatNumberWithDynamicPrecision(inOrderAmount, 4) }}</span>
                <span class="base">{{ asset.base }}</span>
            </template>
        </div>

    </div>
</template>

<style scoped>
.card-header-content.compact {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 0.4rem 0.6rem;
    gap: 0.8rem;
    min-height: 45px;
    width: 100%;
}

/* Sections Principales */
.asset-market-section,
.price-change-section,
.possession-profit-section,
.balance-order-section {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
    white-space: nowrap;
}

.balance-order-section {
    flex-shrink: 1;
    overflow: hidden;
    min-width: 100px;
}

/* Section Identité & Marché */
.asset-identity {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.logo {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
}

.asset-info {
    line-height: 1.2;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.asset-name {
    font-size: 0.9rem;
    font-weight: 600;
}

.asset-base-rank {
    font-size: 0.75rem;
    color: var(--secondary-text);
}

.market-selector select {
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
    border: 1px solid var(--primary-border);
    background-color: var(--selector-bg);
    font-size: 0.75rem;
    color: var(--primary-text);
    max-width: 100px;
}

/* Section Prix & Changement */
.price-change-section {
    font-weight: 600;
}

.current-price {
    font-size: 1.05rem;
}

.current-price .value {
    margin-right: 0.1rem;
}

.current-price .currency {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--secondary-text);
    margin-left: 1px;
}

.change-percent {
    font-size: 0.8rem;
    font-weight: 600;
}

/* Section Possession & Profit */
.possession-profit-section {
    font-weight: 600;
    margin-left: auto;
    /* Keep pushing this right */
}

.current-possession {
    font-size: 1.05rem;
}

.current-possession .value {
    margin-right: 0.1rem;
}

.current-possession .currency {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--secondary-text);
    margin-left: 1px;
}

.profit-percent {
    font-size: 0.8rem;
    font-weight: 600;
}

/* Section Balance & Ordres */
.balance-order-section {
    font-size: 0.8rem;
    color: var(--primary-text);
    margin-left: 1rem;
    /* Add some space */
}

.balance-order-section .label {
    font-size: 0.7rem;
    margin-right: 0.1rem;
}

.balance-order-section .value {
    color: var(--secondary-text);
    font-weight: 500;
    margin-right: 0.3rem;
}

.balance-order-section .base {
    color: var(--secondary-text);
    font-size: 0.7rem;
}

/* Remove details-button styles */

/* Couleurs Positif/Négatif/Neutre */
.change-percent.positive,
.profit-percent.positive {
    color: var(--positive-color);
}

.change-percent.negative,
.profit-percent.negative {
    color: var(--negative-color);
}

.change-percent.neutral,
.profit-percent.neutral {
    color: var(--neutral-color);
}

.fixed-width {
    min-width: 60px;
    display: inline-block;
    text-align: right;
    font-family: monospace;
}
</style>