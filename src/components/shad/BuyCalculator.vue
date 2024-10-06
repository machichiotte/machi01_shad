<!-- src/components/shad/BuyCalculator.vue -->
<template>
    <div class="buy-calculator">
        <h3>Buy Calculator</h3>

        <!-- Loop over each selected asset and display inputs and results -->
        <div v-for="(asset, index) in reactiveAssets" :key="asset.asset" class="asset-row">
            <h4>{{ asset.asset }}</h4>

            <!-- Afficher le totalBuy et le prix d'entrée moyen avant l'investissement -->
            <h4>Total Buy : {{ formatSignificantDigits(asset.totalBuy, 2) }} (avant invest : {{
            formatSignificantDigits(asset.totalBuyBeforeInvest, 2) }})</h4>
            <h4>AVG : {{ formatSignificantDigits(asset.averageEntryPrice, asset.significantPriceDigits) }} (avant invest
                : {{ formatSignificantDigits(asset.averageEntryPriceBeforeInvest, 2) }})</h4>

            <!-- Inputs for Fee and Investment -->
            <div class="input-group">
                <label for="fee">Fee (%)</label>
                <input type="number" :id="'fee-' + index" v-model.number="asset.fee" @input="calculateResults(asset)"
                    min="0" step="0.01" />

                <label for="invest">Investment</label>
                <input type="number" :id="'invest-' + index" v-model.number="asset.invest"
                    @input="calculateResults(asset)" min="0" step="0.01" />
            </div>

            <!-- Display Results -->
            <div class="results">
                <p>Total Buy: {{ formatSignificantDigits(asset.totalFuturBuy, 2) }}</p>
                <p>Average Entry Price: {{ formatSignificantDigits(asset.avgWithFee, asset.significantPriceDigits) }}
                </p>
                <p>Amount to Sell: {{ formatSignificantDigits(asset.amountToSell, asset.significantAmountDigits) }}</p>
                <p>Entry Price Decrease: {{ formatSignificantDigits(asset.baissePrixEntree, 2) }}%</p>
                <p>Next TP: {{ formatSignificantDigits(asset.nextTp, 2) }}%</p>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, reactive, watch } from 'vue';

// Props to receive selected assets
const props = defineProps({
    selectedAssets: {
        type: Array,
        required: true,
    },
});

const reactiveAssets = ref([]);
watch(
    () => props.selectedAssets,
    (newAssets) => {
        // Reset reactiveAssets with new assets
        reactiveAssets.value = newAssets.map((asset) =>
            reactive({
                fee: asset.fee !== undefined ? asset.fee : 0.1, // Default fee value
                invest: asset.invest !== undefined ? asset.invest : 995, // Initial investment
                avgWithFee: asset.avgWithFee,
                amountToSell: asset.amountToSell,
                baissePrixEntree: asset.baissePrixEntree,
                totalFuturBuy: asset.totalFuturBuy,
                nextTp: asset.nextTp,
                significantPriceDigits: asset.significantPriceDigits,
                significantAmountDigits: asset.significantAmountDigits,
                totalBuyBeforeInvest: asset.totalBuy, // Ajout de la valeur avant l'investissement
                averageEntryPriceBeforeInvest: asset.averageEntryPrice, // Ajout de la valeur avant l'investissement
                ...asset,
            })
        );

        // Recalculate results for each asset
        reactiveAssets.value.forEach((asset) => calculateResults(asset));
    },
    { deep: true, immediate: true } // Deep watch to detect all changes
);

// Calculate results on each modification
/**
 * @param {Object} asset
 */
function calculateResults(asset) {
    asset.significantPriceDigits = getSignificantDigits(asset.currentPrice);
    asset.significantAmountDigits = getSignificantDigits(asset.balance);

    asset.amountBuyFromInvest = calculateAmountBuyFromInvest(asset);
    asset.totalAmountBuy = calculateFuturTotalAmountBuy(asset);
    asset.totalFuturBuy = calculateFuturTotalBuy(asset);
    asset.avgWithFee = calculateFuturAvgWithFee(asset);
    asset.amountToSell = calculateFuturAmountToSell(asset);
    asset.baissePrixEntree = calculateBaissePrixEntree(asset);
    asset.nextTp = calculateNextTp(asset);
}

// Intermediary calculation functions
/**
 * @param {Object} asset
 * @returns {number}
 */
function calculateDepense(asset) {
    return asset.invest ? asset.invest - calculateFee(asset) : 0;
}

/**
 * @param {Object} asset
 * @returns {number}
 */
function calculateFee(asset) {
    return (asset.fee / 100) * asset.invest;
}

/**
 * @param {Object} asset
 * @returns {number}
 */
function calculateAmountBuyFromInvest(asset) {
    return calculateDepense(asset) / asset.currentPrice;
}

/**
 * @param {Object} asset
 * @returns {number}
 */
function calculateFuturTotalAmountBuy(asset) {
    return calculateAmountBuyFromInvest(asset) + asset.balance;
}

/**
 * @param {Object} asset
 * @returns {number}
 */
function calculateFuturTotalBuy(asset) {
    return asset.invest + asset.totalBuy - asset.totalSell;
}

/**
 * @param {Object} asset
 * @returns {number}
 */
function calculateFuturAvg(asset) {
    return calculateFuturTotalBuy(asset) / calculateFuturTotalAmountBuy(asset);
}

/**
 * @param {Object} asset
 * @returns {number}
 */
function calculateFuturAvgWithFee(asset) {
    return calculateFuturAvg(asset) + (asset.fee / 100) * calculateFuturAvg(asset);
}

/**
 * @param {Object} asset
 * @returns {number}
 */
function calculateFuturAmountToSell(asset) {
    return ((calculateFuturTotalBuy(asset) - asset.maxExposition) * calculateFuturTotalAmountBuy(asset) / calculateFuturTotalBuy(asset));
}

/**
 * @param {Object} asset
 * @returns {number}
 */
function calculateBaissePrixEntree(asset) {
    return 100 * ((calculateFuturAvgWithFee(asset) - asset.averageEntryPrice) / asset.averageEntryPrice);
}

/**
 * @param {Object} asset
 * @returns {number}
 */
function calculateNextTp(asset) {
    return 100 * ((calculateFuturAvgWithFee(asset) - asset.currentPrice) / asset.currentPrice);
}

/**
 * @param {number} value
 * @returns {number}
 */
function getSignificantDigits(value) {
    if (!value || typeof value !== 'number') return 2;
    const valueStr = value.toString();
    if (valueStr.includes('.')) {
        return valueStr.split('.')[1].length;
    }
    return 0;
}

/**
 * @param {number} value
 * @param {number} digits
 * @returns {string}
 */
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

.asset-row {
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