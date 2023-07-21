<template>
    <div class="overlay">
        <div class="overlay-content">

            <div class="block asset">
                <div class="asset-header">
                    <div class="logo">
                        <img :src="'https://s2.coinmarketcap.com/static/img/coins/64x64/' + assetId + '.png'" alt="Icon" width="32" height="32" />
                    </div>
                    <h2 class="title">{{ selectedAsset.asset }}</h2>
                </div>
                <div class="description-container">
                    <p class="description">{{ assetName }}</p>
                </div>
            </div>


            <div class="block wallet">
                <div class="left-section">
                    <p class="block-title">Wallet</p>
                </div>
                <div class="center-section">
                    <div class="unit-value">
                        <p class="value">{{ balance }}</p>
                        <p class="unit" @click="toggleBalanceCurrency">{{ balanceCurrency }}</p>
                    </div>
                </div>
                <div class="right-section">
                    <p class="exchange">{{ selectedAsset.exchangeId }}</p>
                </div>
            </div>

            <div class="block current-value">
                <div class="left-section">
                    <p class="block-title">Current Value</p>
                </div>
                <div class="center-section">
                    <div class="unit-value">
                        <p class="current-price">{{ currentPrice }}</p>
                        <p class="unit" @click="toggleCurrentCurrency">{{ currentCurrency }}</p>
                    </div>
                </div>
                <div class="right-section">
                    <p class="percentage-value" :class="getPercentageClass()">{{ percentageValue }}</p>
                    <p class="percentage" @click="togglePercentageCurrent">/{{ percentage }}</p>
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

                <table v-if="showActiveOrdersLines" class="open-orders-table">
                    <thead>
                        <tr>
                            <th>Platform</th>
                            <th>Symbol</th>
                            <th>Side</th>
                            <th>Amount</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="buyOrder in getActiveBuyOrders" :key="buyOrder._id.$oid">
                            <td>{{ buyOrder.platform }}</td>
                            <td>{{ buyOrder.symbol }}</td>
                            <td>{{ buyOrder.side }}</td>
                            <td>{{ buyOrder.amount }}</td>
                            <td>{{ buyOrder.price }}</td>
                        </tr>
                        <tr v-for="sellOrder in getActiveSellOrders" :key="sellOrder._id.$oid">
                            <td>{{ sellOrder.platform }}</td>
                            <td>{{ sellOrder.symbol }}</td>
                            <td>{{ sellOrder.side }}</td>
                            <td>{{ sellOrder.amount }}</td>
                            <td>{{ sellOrder.price }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="block trade-history">
                <p class="block-title">Trade History</p>
                <button @click="toggleHistoricLines">
                    {{ showHistoricLines ? 'Hide Historique' : 'Show Historique' }}
                </button>

                <table v-if="showHistoricLines" class="trade-history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Pair</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Amount</th>
                            <th>Total</th>
                            <th>Fee</th>
                            <th>Platform</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="trade in getTrades" :key="trade._id.$oid">
                            <td>{{ trade.date }}</td>
                            <td>{{ trade.pair }}</td>
                            <td>{{ trade.type }}</td>
                            <td>{{ parseFloat(trade.price).toFixed(6) }}</td>
                            <td>{{ trade.amount }}</td>
                            <td>{{ trade.total }}</td>
                            <td>{{ trade.fee }} {{ trade.feecoin }}</td>
                            <td>{{ trade.platform }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="block graph">
                <p class="block-title">Graph</p>
                <ShadOverlayGraph :trades="getTrades"></ShadOverlayGraph>
                <!-- Placeholder for the graph component -->
            </div>

            <button class="close-button" @close="$emit('close')">Close</button>
        </div>
    </div>
</template>
  
<script>
import { getTradesHistory, getDataBTC, getDataETH } from '../js/calcul.js';
import ShadOverlayGraph from './ShadOverlayGraph.vue';

export default {
    name: "ShadOverlay",
    data() {
        return {
            showPercentageLines: false,
            showHistoricLines: false,
            showActiveOrdersLines: false,
            percentage: '24h',
            percentageValue: null,
            currentBTC: null,
            currentETH: null,

            balance: null,
            balanceCurrency: '$',

            currentPrice: null,
            currentCurrency: '$',

            assetName: null,
            assetId:null
        }
    },
    components: {
        ShadOverlayGraph
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
        cmc: {
            type: Object,
            required: true
        },

    },
    created() {
        this.percentageValue = this.formatPercentage(this.selectedAsset.cryptoPercentChange24h);

    },
    computed: {
        getTrades() {
            return getTradesHistory(this.selectedAsset.asset, this.trades).sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );
        },
        getActiveBuyOrders() {
            return this.openBuyOrders[this.selectedAsset.asset];
        },
        getActiveSellOrders() {
            return this.openSellOrders[this.selectedAsset.asset];
        },


    },
    mounted() {
        this.getNeededValues();
    },
    methods: {
        getNeededValues() {
            this.currentBTC = getDataBTC(this.cmc);
            this.currentETH = getDataETH(this.cmc);

            this.currentPrice = this.selectedAsset.currentPrice;
            this.balance = this.selectedAsset.currentPossession;

            console.log('currentPrice ' + this.currentPrice);
            this.currentPriceUSD = parseFloat(this.currentPrice);
            this.currentPriceBTC = parseFloat(this.currentPrice / this.currentBTC.quote.USD.price).toFixed(8);
            this.currentPriceETH = parseFloat(this.currentPrice / this.currentETH.quote.USD.price).toFixed(8);

            this.balanceUSD = parseFloat(this.balance).toFixed(2);
            this.balanceBTC = parseFloat(this.balance / this.currentBTC.quote.USD.price).toFixed(8);
            this.balanceETH = parseFloat(this.balance / this.currentETH.quote.USD.price).toFixed(8);

            const assetCmc = this.cmc.find(item => item.symbol === this.selectedAsset.asset)
            this.assetName = assetCmc.name;
            this.assetId = assetCmc.id;

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
        toggleBalanceCurrency() {
            switch (this.balanceCurrency) {
                case '$':
                    this.balanceCurrency = 'BTC';
                    this.balance = this.balanceBTC;
                    break;
                case 'BTC':
                    this.balanceCurrency = 'ETH';
                    this.balance = this.balanceETH;
                    break;
                case 'ETH':
                    this.balanceCurrency = '$';
                    this.balance = this.balanceUSD;
                    break;
            }
        },
        toggleCurrentCurrency() {
            switch (this.currentCurrency) {
                case '$':
                    this.currentCurrency = 'BTC';
                    this.currentPrice = this.currentPriceBTC;
                    break;
                case 'BTC':
                    this.currentCurrency = 'ETH';
                    this.currentPrice = this.currentPriceETH;
                    break;
                case 'ETH':
                    this.currentCurrency = '$';
                    this.currentPrice = this.currentPriceUSD;
                    break;
            }
        },
        togglePercentage() {
            if (this.selectedAsset) {
                switch (this.percentage) {
                    case '24h':
                        this.percentage = '7d';
                        this.percentageValue = this.formatPercentage(this.selectedAsset.cryptoPercentChange7d);
                        break;
                    case '7d':
                        this.percentage = '30d';
                        this.percentageValue = this.formatPercentage(this.selectedAsset.cryptoPercentChange30d);
                        break;
                    case '30d':
                        this.percentage = '60d';
                        this.percentageValue = this.formatPercentage(this.selectedAsset.cryptoPercentChange60d);
                        break;
                    case '60d':
                        this.percentage = '90d';
                        this.percentageValue = this.formatPercentage(this.selectedAsset.cryptoPercentChange90d);
                        break;
                    case '90d':
                        this.percentage = '24h';
                        this.percentageValue = this.formatPercentage(this.selectedAsset.cryptoPercentChange24h);
                        break;
                }
            }
        },
        getPercentageClass() {
            if (parseFloat(this.percentageValue) > 0) {
                return 'positive';
            } else if (parseFloat(this.percentageValue) < 0) {
                return 'negative';
            } else {
                return '';
            }
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

.block.current-value,
.block.wallet {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 10px;
}

.left-section,
.center-section,
.right-section {
    display: flex;
    align-items: center;
    justify-content: center;
}

.left-section {
    grid-column: 1;
}

.center-section {
    grid-column: 2;
}

.right-section {
    grid-column: 3;
}

.block .unit-value {
    display: flex;
    align-items: center;
}

.wallet .value {
    margin-right: 8px;
    font-size: 32px;
}

.wallet .unit {
    font-size: 26px;
    text-decoration: underline;
    cursor: pointer;
}

.current-value .current-percentage {
    display: flex;
    align-items: center;
}

.current-value .current-price {
    margin-right: 8px;
    font-size: 32px;
}

.current-value .unit {
    font-size: 26px;
    text-decoration: underline;
    cursor: pointer;
}

.current-value .percentage-value {
    margin-right: 8px;
    font-size: 16px;
}

.current-value .percentage {
    font-size: 12px;
    text-decoration: underline;
    cursor: pointer;
}

.strategy {
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
    grid-column: 1 / 4;
    text-align: center;
    overflow-x: auto;
}

.open-orders-table {
    width: 100%;
    border-collapse: collapse;
}

.open-orders-table th,
.open-orders-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.open-orders-table th {
    background-color: #f2f2f2;
}

.trade-history {
    grid-column: 1 / 4;
    text-align: center;
    overflow-x: auto;
}

.graph {
    grid-column: 1 / 4;
    text-align: center;
    border: 1px solid black;
    height: 300px;
}

.close-button {
    grid-column: 1 / 4;
    width: auto;
    margin-top: 10px;
    text-align: center;
}

.positive {
    color: green;
}

.negative {
    color: red;
}
</style>
  