<template>
    <div class="overlay">
        <div class="overlay-content">

            <div class="block asset">
                <div class="asset-header">
                    <div class="logo">
                        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/11568.png" alt="Icon" width="32"
                            height="32" />
                    </div>
                    <h2 class="title">{{ selectedAsset.asset }}</h2>
                </div>
                <div class="description-container">
                    <p class="description">Your description text here</p>
                </div>
            </div>

            <div class="block wallet">
                <p class="block-title">Wallet</p>
                <p class="exchange">{{ selectedAsset.exchangeId }}</p>
                <div class="unit-value">
                    <p class="value">{{ selectedAsset.balance }}</p>
                    <p class="unit">$</p>
                </div>
            </div>

            <div class="block current-value">
                <p class="block-title">Current Value</p>
                <p class="value">{{ selectedAsset.currentPrice }}</p>
                <div class="percentage">
                    <p class="percentage-value">24h</p>
                    <a href="#" class="clickable-space">Clickable Space</a>
                </div>
            </div>

            <div class="block strategy">
                <p class="block-title">Strategy</p>
                <select class="dropdown">
                    <option value="">Choose a strategy</option>
                    <!-- Add your strategy options here -->
                </select>
                <button class="toggle-button">Show/Hide Next Sell</button>
            </div>

            <div class="block open-orders">
                <p class="block-title">Open Orders</p>
                <button @click="toggleActiveOrdersLines">
                    {{ showActiveOrdersLines ? 'Hide Open Orders' : 'Show Open Orders' }}
                </button>

                <div v-if="showActiveOrdersLines">
                    <p v-for="buyOrder in getActiveBuyOrders" :key="buyOrder.id">{{
                        JSON.stringify(buyOrder) }}
                    </p>
                    <p v-for="sellOrder in getActiveSellOrders" :key="sellOrder.id">
                        {{ JSON.stringify(sellOrder) }}
                    </p>
                </div>
            </div>

            <div class="block trade-history">
                <p class="block-title">Trade History</p>
                <button @click="toggleHistoricLines">
                    {{ showHistoricLines ? 'Hide Historique' : 'Show Historique' }}
                </button>

                <div v-if="showHistoricLines">
                    <p v-for="trade in getTrades" :key="trade.id">
                        {{ JSON.stringify(trade) }}
                    </p>
                </div>
            </div>

            <div class="block graph">
                <p class="block-title">Graph</p>
                <!-- Placeholder for the graph component -->
            </div>

            <div class="block percentage">
                <p class="block-title">Percentage</p>
                <button @click="togglePercentageLines">
                    {{ showPercentageLines ? 'Hide Percentage' : 'Show Percentage' }}
                </button>

                <div v-if="showPercentageLines">
                    <p>24h: {{ formatPercentage(selectedAsset.cryptoPercentChange24h) }}</p>
                    <p>7d: {{ formatPercentage(selectedAsset.cryptoPercentChange7d) }}</p>
                    <p>30d: {{ formatPercentage(selectedAsset.cryptoPercentChange30d) }}</p>
                    <p>60d: {{ formatPercentage(selectedAsset.cryptoPercentChange60d) }}</p>
                    <p>90d: {{ formatPercentage(selectedAsset.cryptoPercentChange90d) }}</p>
                </div>
            </div>

            <button class="close-button" @click="showOverlay = false">Close</button>
        </div>
    </div>
</template>
  
<script>
import { getTradesHistory } from '../js/calcul.js';

/*
// Obtenez une référence à l'élément .unit
const unitElement = document.querySelector('.wallet .unit');

// Ajoutez un gestionnaire d'événements de clic à l'élément .unit
unitElement.addEventListener('click', () => {
    // Vérifiez la valeur actuelle de l'élément .unit
    switch (unitElement.textContent) {
        case '$':
            unitElement.textContent = 'BTC';
            break;
        case 'BTC':
            unitElement.textContent = 'ETH';
            break;
        case 'ETH':
            unitElement.textContent = '$';
            break;
    }
}); */

export default {
    name: "ShadOverlay",
    data() {
        return {
            showPercentageLines: false,
            showHistoricLines: false,
            showActiveOrdersLines: false,
        }
    },
    props: {
        selectedAsset: {
            type: Object,
            required: true
        },
        openBuyOrders: {
            type: Object,
            required: true
        },
        openSellOrders: {
            type: Object,
            required: true
        },
        trades: {
            type: Object,
            required: true
        },

    },
    computed: {
        getTrades() {
            return getTradesHistory(this.selectedAsset.asset, this.trades);
        },
        getActiveBuyOrders() {
            return this.openBuyOrders[this.selectedAsset.asset];
        },
        getActiveSellOrders() {
            return this.openSellOrders[this.selectedAsset.asset];
        },
    },
    methods: {
        togglePercentageLines() {
            this.showPercentageLines = !this.showPercentageLines;
        },
        toggleHistoricLines() {
            this.showHistoricLines = !this.showHistoricLines;
        },
        toggleActiveOrdersLines() {
            this.showActiveOrdersLines = !this.showActiveOrdersLines;
        },

        formatPercentage(value) {
            return (value * 100).toFixed(2) + '%';
        },

    }
};
</script>
  
<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
}

.overlay-content {
    border: 2px solid black;

    background-color: white;
    padding: 0px;
    width: 30%;
    height: 70%;
    overflow: auto;
}

.block {
    /* Styles for each block */
    background-color: #f1f1f1;
}

.asset {
    /* Styles for the asset block */
    grid-column: 1 / 4;
    display: grid;
    grid-template-rows: auto auto;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.asset .asset-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 10px;
}

.asset .logo {
    margin-right: 8px;
    /* Espacement entre le logo et le titre */
}

.asset .title {
    margin: 0;
    /* Suppression des marges par défaut */
}

.asset .description {
    font-size: 12px;
    margin: 0;
    /* Suppression des marges par défaut */
}

.asset .description-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.block-title {
    text-align: center;
}

.wallet {
    /* Styles for the wallet block */
    grid-column: 1 / 4;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.wallet .exchange {
    margin-top: 4px;
}

.unit-value {
    display: flex;
    align-items: center;

    /* Styles supplémentaires pour ajuster la mise en page de unit et value */
}

.wallet .value {
    margin-top: 4px;
    margin-right: 8px;
    font-size: 32px;
    /* Augmentation de la taille de police */
}

.wallet .unit {
    margin-top: 4px;
    font-size: 26px;
    /* Augmentation de la taille de police */
    cursor: pointer;
    /* Curseur en forme de main pour indiquer un élément cliquable */
}

.wallet .unit:hover {
    text-decoration: underline;
    /* Soulignement au survol de l'élément */
}

.current-value {
    /* Styles for the current value block */
    grid-column: 1 / 4;
    text-align: center;
}

.current-value .value {
    text-align: left;
}

.current-value .percentage {
    text-align: right;
}

.strategy {
    /* Styles for the strategy block */
    grid-column: 1 / 4;
    text-align: center;
}

.strategy .dropdown {
    margin-top: 4px;
}

.strategy .toggle-button {
    margin-top: 4px;
}

.open-orders {
    /* Styles for the open orders block */
    grid-column: 1 / 4;
    text-align: center;
    overflow-x: auto;
}

.trade-history {
    /* Styles for the trade history block */
    grid-column: 1 / 4;
    text-align: center;
    overflow-x: auto;
}

.graph {
    /* Styles for the graph block */
    grid-column: 1 / 4;
    text-align: center;
    border: 1px solid black;
    height: 300px;
}

.percentage {
    /* Styles for the percentage block */
    grid-column: 1 / 4;
    text-align: center;
}

.close-button {
    /* Styles for the close button */
    grid-column: 1 / 4;
    width: auto;
    margin-top: 10px;
    text-align: center;
}
</style>
  