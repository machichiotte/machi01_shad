<!-- src/components/machi/BuyCalculator.vue -->
<template>
    <div class="buy-calculator">
        <h3>Buy Calculator</h3>

        <!-- Loop over each selected base and display inputs and results -->
        <div v-for="(base, index) in reactiveBases" :key="base.base" class="base-row">
            <h4>{{ base.base }}</h4>

            <!-- Afficher le totalBuy et le prix d'entrée moyen avant l'investissement -->
            <h4>Total Buy : {{ formatSignificantDigits(base.totalBuy, 2) }} (avant invest : {{
                formatSignificantDigits(base.totalBuyBeforeInvest, 2) }})</h4>
            <h4>AVG : {{ formatSignificantDigits(base.averageEntryPrice, base.significantPriceDigits) }} (avant invest
                : {{ formatSignificantDigits(base.averageEntryPriceBeforeInvest, 2) }})</h4>

            <!-- Inputs for Fee and Investment -->
            <div class="input-group">
                <label for="fee">Fee (%)</label>
                <input type="number" :id="'fee-' + index" v-model.number="base.fee" @input="calculateResults(base)"
                    min="0" step="0.01" />

                <label for="invest">Investment</label>
                <input type="number" :id="'invest-' + index" v-model.number="base.invest"
                    @input="calculateResults(base)" min="0" step="0.01" />
            </div>

            <!-- Display Results -->
            <div class="results">
                <p>Total Buy: {{ formatSignificantDigits(base.totalFuturBuy, 2) }}</p>
                <p>Average Entry Price: {{ formatSignificantDigits(base.avgWithFee, base.significantPriceDigits) }}
                </p>
                <p>Amount to Sell: {{ formatSignificantDigits(base.amountToSell, base.significantAmountDigits) }}</p>
                <p>Entry Price Decrease: {{ formatSignificantDigits(base.baissePrixEntree, 2) }}%</p>
                <p>Next TP: {{ formatSignificantDigits(base.nextTp, 2) }}%</p>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, reactive, watch } from 'vue';

// Props to receive selected bases
const props = defineProps({
    selectedBases: {
        type: Array,
        required: true,
    },
});

const reactiveBases = ref([]);
watch(
    () => props.selectedBases,
    (newBases) => {
        // Reset reactiveBases with new bases
        reactiveBases.value = newBases.map((base) =>
            reactive({
                fee: base.fee !== undefined ? base.fee : 0.1, // Default fee value
                invest: base.invest !== undefined ? base.invest : 995, // Initial investment
                avgWithFee: base.avgWithFee,
                amountToSell: base.amountToSell,
                baissePrixEntree: base.baissePrixEntree,
                totalFuturBuy: base.totalFuturBuy,
                nextTp: base.nextTp,
                significantPriceDigits: base.significantPriceDigits,
                significantAmountDigits: base.significantAmountDigits,
                totalBuyBeforeInvest: base.totalBuy, // Ajout de la valeur avant l'investissement
                averageEntryPriceBeforeInvest: base.averageEntryPrice, // Ajout de la valeur avant l'investissement
                ...base,
            })
        );

        // Recalculate results for each base
        reactiveBases.value.forEach((base) => calculateResults(base));
    },
    { deep: true, immediate: true } // Deep watch to detect all changes
);

// Calculate results on each modification
function calculateResults(base) {
    base.significantPriceDigits = getSignificantDigits(base.currentPrice);
    base.significantAmountDigits = getSignificantDigits(base.balance);

    base.amountBuyFromInvest = calculateAmountBuyFromInvest(base);
    base.totalAmountBuy = calculateFuturTotalAmountBuy(base);
    base.totalFuturBuy = calculateFuturTotalBuy(base);
    base.avgWithFee = calculateFuturAvgWithFee(base);
    base.amountToSell = calculateFuturAmountToSell(base);
    base.baissePrixEntree = calculateBaissePrixEntree(base);
    base.nextTp = calculateNextTp(base);
}

function calculateDepense(base) {
    return base.invest ? base.invest - calculateFee(base) : 0;
}


function calculateFee(base) {
    return (base.fee / 100) * base.invest;
}


function calculateAmountBuyFromInvest(base) {
    return calculateDepense(base) / base.currentPrice;
}

function calculateFuturTotalAmountBuy(base) {
    return calculateAmountBuyFromInvest(base) + base.balance;
}

function calculateFuturTotalBuy(base) {
    return base.invest + base.totalBuy - base.totalSell;
}

function calculateFuturAvg(base) {
    return calculateFuturTotalBuy(base) / calculateFuturTotalAmountBuy(base);
}

function calculateFuturAvgWithFee(base) {
    return calculateFuturAvg(base) + (base.fee / 100) * calculateFuturAvg(base);
}

function calculateFuturAmountToSell(base) {
    return ((calculateFuturTotalBuy(base) - base.maxExposition) * calculateFuturTotalAmountBuy(base) / calculateFuturTotalBuy(base));
}

function calculateBaissePrixEntree(base) {
    return 100 * ((calculateFuturAvgWithFee(base) - base.averageEntryPrice) / base.averageEntryPrice);
}

function calculateNextTp(base) {
    return 100 * ((calculateFuturAvgWithFee(base) - base.currentPrice) / base.currentPrice);
}

function getSignificantDigits(value) {
    if (!value || typeof value !== 'number') return 2;
    const valueStr = value.toString();
    if (valueStr.includes('.')) {
        return valueStr.split('.')[1].length;
    }
    return 0;
}

function formatSignificantDigits(value, digits) {
    return parseFloat(value).toFixed(digits);
}
</script>

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
    /* Use Flexbox for horizontal layout */
    align-items: center;
    /* Vertically align items to the center */
    gap: 1rem;
    /* Spacing between elements */
    margin-bottom: 1rem;
    padding: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    flex-wrap: wrap;
    /* Allow wrapping to next line if space is insufficient */
}

.input-group {
    display: flex;
    /* Flexbox to align inputs horizontally */
    gap: 0.5rem;
    /* Reduce spacing between inputs */
    flex: 1;
    /* Allow inputs to resize to fit available space */
    min-width: 200px;
    /* Minimum width for inputs */
}

.input-group input {
    width: 70px;
    /* Adjust width of input fields */
}

.results {
    display: flex;
    /* Flexbox for horizontal layout */
    gap: 1rem;
    /* Spacing between results */
    flex-wrap: wrap;
    /* Allow wrapping to next line if space is insufficient */
    flex: 2;
    /* Allow results to occupy more space than inputs */
}

.results p {
    margin: 0;
}
</style>