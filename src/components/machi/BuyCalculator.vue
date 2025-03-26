<!-- src/components/machi/BuyCalculator.vue -->
<script setup lang="ts">
import { ref, reactive, watch, defineProps } from 'vue';

// Définition des types
interface BaseAsset {
    base: string;
    fee?: number;
    invest?: number;
    avgWithFee?: number;
    amountToSell?: number;
    baissePrixEntree?: number;
    totalFuturBuy?: number;
    nextTp?: number;
    significantPriceDigits?: number;
    significantAmountDigits?: number;
    currentPrice: number;
    balance: number;
    totalBuy: number;
    totalSell: number;
    maxExposition: number;
    averageEntryPrice: number;
    totalBuyBeforeInvest?: number; // Ajout
    averageEntryPriceBeforeInvest?: number; // Ajout
}

// Props
const props = defineProps<{ selectedBases: BaseAsset[] }>();

const reactiveBases = ref<BaseAsset[]>([]);

watch(
    () => props.selectedBases,
    (newBases) => {
        reactiveBases.value = newBases.map((base) =>
            reactive({
                ...base,
                fee: base.fee ?? 0.1,
                invest: base.invest ?? 995,
                totalBuyBeforeInvest: base.totalBuy, // Correction
                averageEntryPriceBeforeInvest: base.averageEntryPrice, // Correction
            })
        );
        reactiveBases.value.forEach((base) => calculateResults(base));
    },
    { deep: true, immediate: true }
);

// Fonctions de calcul
function calculateResults(base: BaseAsset): void {
    base.significantPriceDigits = getSignificantDigits(base.currentPrice);
    base.significantAmountDigits = getSignificantDigits(base.balance);
    base.amountToSell = calculateFuturAmountToSell(base);
    base.totalFuturBuy = calculateFuturTotalBuy(base);
    base.avgWithFee = calculateFuturAvgWithFee(base);
    base.baissePrixEntree = calculateBaissePrixEntree(base);
    base.nextTp = calculateNextTp(base);
}

function calculateDepense(base: BaseAsset): number {
    return (base.invest ?? 0) - calculateFee(base);
}

function calculateFee(base: BaseAsset): number {
    return ((base.fee ?? 0) / 100) * (base.invest ?? 0);
}

function calculateFuturTotalBuy(base: BaseAsset): number {
    return (base.invest ?? 0) + base.totalBuy - base.totalSell;
}

function calculateFuturTotalAmountBuy(base: BaseAsset): number {
    return calculateDepense(base) / base.currentPrice + base.balance;
}

function calculateFuturAvg(base: BaseAsset): number {
    return calculateFuturTotalBuy(base) / calculateFuturTotalAmountBuy(base);
}

function calculateFuturAvgWithFee(base: BaseAsset): number {
    return calculateFuturAvg(base) + ((base.fee ?? 0) / 100) * calculateFuturAvg(base);
}

function calculateFuturAmountToSell(base: BaseAsset): number {
    return ((calculateFuturTotalBuy(base) - base.maxExposition) *
        calculateFuturTotalAmountBuy(base)) / calculateFuturTotalBuy(base);
}

function calculateBaissePrixEntree(base: BaseAsset): number {
    return 100 * ((calculateFuturAvgWithFee(base) - base.averageEntryPrice) / base.averageEntryPrice);
}

function calculateNextTp(base: BaseAsset): number {
    return 100 * ((calculateFuturAvgWithFee(base) - base.currentPrice) / base.currentPrice);
}

function getSignificantDigits(value: number): number {
    if (!value || typeof value !== 'number') return 2;
    const valueStr = value.toString();
    return valueStr.includes('.') ? valueStr.split('.')[1].length : 0;
}

function formatSignificantDigits(value: number | undefined, digits: number): string {
    if (value === undefined || isNaN(value)) return '0';
    return value.toFixed(digits);
}
</script>

<template>
    <div class="buy-calculator">
        <h3>Buy Calculator</h3>

        <div v-for="(base, index) in reactiveBases" :key="base.base" class="base-row">
            <h4>{{ base.base }}</h4>

            <h4>Total Buy : {{ formatSignificantDigits(base.totalBuy, 2) }} (avant invest :
                {{ formatSignificantDigits(base.totalBuyBeforeInvest, 2) }})
            </h4>
            <h4>AVG : {{ formatSignificantDigits(base.averageEntryPrice, base.significantPriceDigits ?? 2) }}
                (avant invest : {{ formatSignificantDigits(base.averageEntryPriceBeforeInvest, 2) }})
            </h4>

            <div class="input-group">
                <label for="fee">Fee (%)</label>
                <input type="number" :id="'fee-' + index" v-model.number="base.fee" @input="calculateResults(base)"
                    min="0" step="0.01" />

                <label for="invest">Investment</label>
                <input type="number" :id="'invest-' + index" v-model.number="base.invest"
                    @input="calculateResults(base)" min="0" step="0.01" />
            </div>

            <div class="results">
                <p>Total Buy: {{ formatSignificantDigits(base.totalFuturBuy, 2) }}</p>
                <p>Average Entry Price: {{ formatSignificantDigits(base.avgWithFee, base.significantPriceDigits ?? 2) }}
                </p>
                <p>Amount to Sell: {{ formatSignificantDigits(base.amountToSell, base.significantAmountDigits ?? 2) }}
                </p>
                <p>Entry Price Decrease: {{ formatSignificantDigits(base.baissePrixEntree, 2) }}%</p>
                <p>Next TP: {{ formatSignificantDigits(base.nextTp, 2) }}%</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.buy-calculator {
    padding: 1rem;
    background: var(--surface-card);
    border-radius: 8px;
    margin-top: 1rem;
    color: black;
}

.base-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    flex-wrap: wrap;
}

.input-group {
    display: flex;
    gap: 0.5rem;
    flex: 1;
    min-width: 200px;
}

.input-group input {
    width: 70px;
}

.results {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    flex: 2;
}

.results p {
    margin: 0;
}
</style>
