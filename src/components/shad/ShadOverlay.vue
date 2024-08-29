<!-- src/components/ShadOverlay.vue -->
<template>
    <div class="overlay">
        <div class="overlay-content">

            <div class="block asset">
                <div class="asset-header">
                    <div class="logo">
                        <img :src="'https://s2.coinmarketcap.com/static/img/coins/64x64/' + assetId + '.png'" alt="Icon"
                            width="32" height="32" />
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
                    <p class="platform">{{ selectedAsset.platform }}</p>
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

            <div class="block strategy" @click="toggleStrategy">
                <p class="block-title">Strategy</p>
                <select class="dropdown">
                    <option value="">Choose a strategy</option>
                    <!-- Add your strategy options here -->
                </select>
                <span class="toggle-icon">{{ showStrategy ? '▲' : '▼' }}</span>

            </div>

            <div class="block next-sells center-content">
                <p class="block-title" @click="toggleNextSells">
                    <span class="title-text">Next Sells</span>
                    <span class="toggle-icon">{{ showNextSells ? '▲' : '▼' }}</span>
                </p>
                <NextSellsTable v-if="showNextSells" :data="getNextSellsData" />
            </div>

            <div class="block open-orders center-content">
                <p class="block-title" @click="toggleOrdersLines">
                    <span class="title-text">Open Orders</span>
                    <span class="toggle-icon">{{ showOrdersLines ? '▲' : '▼' }}</span>
                </p>
                <OrdersTable v-if="showOrdersLines" :orders="getAssetOrders" />
            </div>

            <div class="block trade-history center-content">
                <p class="block-title" @click="toggleHistoricLines">
                    <span class="title-text">Trade History</span>
                    <span class="toggle-icon">{{ showHistoricLines ? '▲' : '▼' }}</span>
                </p>
                <TradesTable v-if="showHistoricLines" :trades="getTrades" />
            </div>

            <div class="block graph center-content">
                <p class="block-title" @click="toggleGraph">
                    <span class="title-text">Graph</span>
                    <span class="toggle-icon">{{ showGraph ? '▲' : '▼' }}</span>
                </p>
                <ShadOverlayGraph v-if="showGraph" :trades="getTrades"></ShadOverlayGraph>
                <!-- Placeholder for the graph component -->
            </div>

            <div class="close-button" @click="$emit('close')">
                &#10006;
            </div>
        </div>
    </div>
</template>
  
<script>
import { getTradesHistory, getDataBTC, getDataETH } from '../../js/metrics/global.js';
import ShadOverlayGraph from './ShadOverlayGraph.vue';
import NextSellsTable from './NextSellsTable.vue';
import OrdersTable from '../orders/OrdersTable.vue';
import TradesTable from '../TradesTable.vue';

export default {
    name: "ShadOverlay",
    data() {
        return {
            showPercentageLines: false,
            showHistoricLines: false,
            showOrdersLines: false,
            showGraph: false,
            showStrategy: false,
            showNextSells: false,

            nextSells: [],

            percentage: '24h',
            percentageValue: null,
            currentBTC: null,
            currentETH: null,

            balance: null,
            balanceCurrency: '$',

            currentPrice: null,
            currentCurrency: '$',

            assetName: null,
            assetId: null
        }
    },
    components: {
        ShadOverlayGraph, NextSellsTable, OrdersTable, TradesTable
    },
    props: {
        selectedAsset: {
            type: Object,
            required: true
        },
        buyOrders: {
            type: Object,
            required: true,
            default: () => null
        },
        sellOrders: {
            type: Object,
            required: true,
            default: () => null
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
        getAssetOrders() {
            const buyOrders = this.getOrdersBySide(this.buyOrders, 'buy') || [];
            const sellOrders = this.getOrdersBySide(this.sellOrders, 'sell') || [];
            return [...buyOrders, ...sellOrders];
        },
    },
    mounted() {
        this.getNeededValues();
    },
    methods: {
        updateNextSells() {
            // Utilisez votre fonction calculateAmountsAndPricesForShad pour mettre à jour this.nextSells
            //this.nextSells = calculateAmountsAndPricesForShad(/* ... */);
        },
        getOrdersBySide(orders, side) {
            const tradingPairPrefix = this.selectedAsset.asset + '/';
            const filteredOrders = orders.filter(order => order.symbol.includes(tradingPairPrefix) && order.side === side);
            if (filteredOrders.length > 0) {
                return filteredOrders;
            } else {
                console.error(`Aucun ordre trouvé pour 'asset' (${tradingPairPrefix}) dans open${side}Orders.`);
                return null;
            }
        },
        getNeededValues() {
            this.currentBTC = getDataBTC(this.cmc);
            this.currentETH = getDataETH(this.cmc);

            console.log('this.currentBTC',this.currentBTC);
            console.log('this.currentETH',this.currentETH);

            this.currentPrice = this.selectedAsset.currentPrice;
            this.balance = this.selectedAsset.currentPossession;

            console.log('this.currentPrice',this.currentPrice);

            console.log('this.balance',this.balance);


            this.currentPriceUSD = parseFloat(this.currentPrice);
            this.currentPriceBTC = parseFloat(this.currentPrice / this.currentBTC.quote.USD.price).toFixed(8);
            this.currentPriceETH = parseFloat(this.currentPrice / this.currentETH.quote.USD.price).toFixed(8);

            console.log('this.currentPriceUSD',this.currentPriceUSD);

            console.log('this.currentPriceBTC',this.currentPriceBTC);

            console.log('this.currentPriceETH',this.currentPriceETH);

            this.balanceUSD = parseFloat(this.balance).toFixed(2);
            this.balanceBTC = parseFloat(this.balance / this.currentBTC.quote.USD.price).toFixed(8);
            this.balanceETH = parseFloat(this.balance / this.currentETH.quote.USD.price).toFixed(8);

            console.log('this.balanceUSD',this.balanceUSD);
            console.log('this.balanceBTC',this.balanceBTC);
            console.log('this.balanceETH',this.balanceETH);

            const assetCmc = this.cmc.find(item => item.symbol === this.selectedAsset.asset)
            this.assetName = assetCmc.name;
            this.assetId = assetCmc.id;

            console.log('this.assetName',this.baassetNamelanceETH);

            console.log('this.assetId',this.assetId);

        },
        toggleHistoricLines() {
            this.showHistoricLines = !this.showHistoricLines;
        },
        toggleOrdersLines() {
            this.showOrdersLines = !this.showOrdersLines;
        },
        toggleGraph() {
            this.showGraph = !this.showGraph;
        },
        toggleStrategy() {
            this.showStrategy = !this.showStrategy;
        },
        toggleNextSells() {
            this.showNextSells = !this.showNextSells;
        },

        formatPercentage(value) {
            return (value * 100).toFixed(2) + '%';
        },
        toggleCurrency(type) {
            switch (type) {
                case 'balance':
                    this.balanceCurrency = this.getNextCurrency(this.balanceCurrency);
                    this.balance = this.getConvertedBalance(this.balance, this.balanceCurrency);
                    break;
                case 'current':
                    this.currentCurrency = this.getNextCurrency(this.currentCurrency);
                    this.currentPrice = this.getConvertedPrice(this.currentPrice, this.currentCurrency);
                    break;
            }
        },
        getNextCurrency(currency) {
            const currencies = ['$', 'BTC', 'ETH'];
            const currentIndex = currencies.indexOf(currency);
            const nextIndex = (currentIndex + 1) % currencies.length;
            return currencies[nextIndex];
        },
        getConvertedBalance(balance, currency) {
            const conversionRates = {
                '$': 1,
                'BTC': this.balanceBTC,
                'ETH': this.balanceETH
            };
            return parseFloat(balance / conversionRates[currency]).toFixed(2);
        },
        getConvertedPrice(price, currency) {
            const conversionRates = {
                '$': 1,
                'BTC': this.currentPriceBTC,
                'ETH': this.currentPriceETH
            };
            return parseFloat(price / conversionRates[currency]).toFixed(8);
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
    position: relative;
    border: 2px solid black;
    background-color: white;
    padding: 0px;
    width: 70%;
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

.center-content {
    text-align: center;
    /* Centrer horizontalement le contenu de la balise <div> */
}

.block-title {
    display: inline-block;
    /* Permet de centrer le texte indépendamment du bouton */
}

.title-text {
    display: inline-block;
    /* Permet de centrer le texte indépendamment du bouton */
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

.my-table {
    width: 100%;
    border-collapse: collapse;
}

/* Ajoutez un style pour l'icône */
.toggle-icon {
    font-size: 12px;
    margin-left: 5px;
    transition: transform 0.3s ease;
}

/* Changez la rotation de l'icône en fonction de l'état */
.showHistoricLines .toggle-icon {
    transform: rotate(180deg);
}

.my-table th,
.my-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.my-table th {
    background-color: #f2f2f2;
}

.close-button {
    position: absolute;
    top: 10px;
    /* Ajustez la valeur selon votre mise en page */
    right: 10px;
    /* Ajustez la valeur selon votre mise en page */
    cursor: pointer;
    font-size: 20px;
    /* Ajustez la taille de la police selon vos besoins */
    z-index: 1000;
    /* Assurez-vous que le bouton est au-dessus du contenu de l'overlay */
}

.positive {
    color: green;
}

.negative {
    color: red;
}
</style>