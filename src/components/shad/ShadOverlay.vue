<!-- src/components/shad/ShadOverlay.vue -->
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
                        <p class="unit" @click="toggleCurrency('balance')">{{ balanceCurrency }}</p>
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
                        <p class="unit" @click="toggleCurrency('current')">{{ currentCurrency }}</p>
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
            </div>

            <div class="close-button" @click="$emit('close')">
                &#10006;
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getTradesHistory, getDataBTC, getDataETH } from '../../js/metrics/global.js';
import ShadOverlayGraph from './ShadOverlayGraph.vue';
import NextSellsTable from './NextSellsTable.vue';
import OrdersTable from '../orders/OrdersTable.vue';
import TradesTable from '../trades/TradesTable.vue';

interface Asset {
    asset: string;
    platform: string;
    currentPrice: number;
    currentPossession: number;
    cryptoPercentChange24h: number;
    cryptoPercentChange7d: number;
    cryptoPercentChange30d: number;
    cryptoPercentChange60d: number;
    cryptoPercentChange90d: number;
}

const props = defineProps<{
    selectedAsset: Asset;
    buyOrders: Object;
    sellOrders: Object;
    trades: Object;
    cmc: Object;
}>();

const showPercentageLines = ref<boolean>(false);
const showHistoricLines = ref<boolean>(false);
const showOrdersLines = ref<boolean>(false);
const showGraph = ref<boolean>(false);
const showStrategy = ref<boolean>(false);
const showNextSells = ref<boolean>(false);
const nextSells = ref<Array<any>>([]);
const percentage = ref<string>('24h');
const percentageValue = ref<string | null>(null);
const currentBTC = ref<number | null>(null);
const currentETH = ref<number | null>(null);
const balance = ref<number | null>(null);
const balanceCurrency = ref<string>('$');
const currentPrice = ref<number | null>(null);
const currentCurrency = ref<string>('$');
const assetName = ref<string | null>(null);
const assetId = ref<string | null>(null);

const getTrades = computed(() => {
    return getTradesHistory(props.selectedAsset.asset, props.trades).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
});

const getAssetOrders = computed(() => {
    const buyOrders = getOrdersBySide(props.buyOrders, 'buy') || [];
    const sellOrders = getOrdersBySide(props.sellOrders, 'sell') || [];
    return [...buyOrders, ...sellOrders];
});

onMounted(() => {
    getNeededValues();
    percentageValue.value = formatPercentage(props.selectedAsset.cryptoPercentChange24h);
});

function getOrdersBySide(orders: Array<any>, side: string): Array<any> | null {
    const tradingPairPrefix = props.selectedAsset.asset + '/';
    const filteredOrders = orders.filter(order => order.symbol.includes(tradingPairPrefix) && order.side === side);
    if (filteredOrders.length > 0) {
        return filteredOrders;
    } else {
        console.error(`No orders found for 'asset' (${tradingPairPrefix}) in open${side}Orders.`);
        return null;
    }
}

function getNeededValues() {
    currentBTC.value = getDataBTC(props.cmc);
    currentETH.value = getDataETH(props.cmc);
    currentPrice.value = props.selectedAsset.currentPrice;
    balance.value = props.selectedAsset.currentPossession;

    const assetCmc = props.cmc.find((item: any) => item.symbol === props.selectedAsset.asset);
    assetName.value = assetCmc.name;
    assetId.value = assetCmc.id;
}

function formatPercentage(value: number): string {
    return (value * 100).toFixed(2) + '%';
}

function toggleCurrency(type: 'balance' | 'current') {
    switch (type) {
        case 'balance':
            balanceCurrency.value = getNextCurrency(balanceCurrency.value);
            balance.value = getConvertedBalance(balance.value, balanceCurrency.value);
            break;
        case 'current':
            currentCurrency.value = getNextCurrency(currentCurrency.value);
            currentPrice.value = getConvertedPrice(currentPrice.value, currentCurrency.value);
            break;
    }
}

function getNextCurrency(currency: string): string {
    const currencies = ['$', 'BTC', 'ETH'];
    const currentIndex = currencies.indexOf(currency);
    const nextIndex = (currentIndex + 1) % currencies.length;
    return currencies[nextIndex];
}

function getConvertedBalance(balance: number | null, currency: string): number {
    const conversionRates = {
        '$': 1,
        'BTC': currentBTC.value || 1,
        'ETH': currentETH.value || 1
    };
    return parseFloat((balance! / conversionRates[currency]).toFixed(2));
}

function getConvertedPrice(price: number | null, currency: string): number {
    const conversionRates = {
        '$': 1,
        'BTC': currentPrice.value || 1,
        'ETH': currentPrice.value || 1
    };
    return parseFloat((price! / conversionRates[currency]).toFixed(8));
}

function togglePercentage() {
    if (props.selectedAsset) {
        switch (percentage.value) {
            case '24h':
                percentage.value = '7d';
                percentageValue.value = formatPercentage(props.selectedAsset.cryptoPercentChange7d);
                break;
            case '7d':
                percentage.value = '30d';
                percentageValue.value = formatPercentage(props.selectedAsset.cryptoPercentChange30d);
                break;
            case '30d':
                percentage.value = '60d';
                percentageValue.value = formatPercentage(props.selectedAsset.cryptoPercentChange60d);
                break;
            case '60d':
                percentage.value = '90d';
                percentageValue.value = formatPercentage(props.selectedAsset.cryptoPercentChange90d);
                break;
            case '90d':
                percentage.value = '24h';
                percentageValue.value = formatPercentage(props.selectedAsset.cryptoPercentChange24h);
                break;
        }
    }
}

function getPercentageClass(): string {
    if (percentageValue.value) {
        const value = parseFloat(percentageValue.value);
        if (value > 0) {
            return 'positive';
        } else if (value < 0) {
            return 'negative';
        }
    }
    return '';
}

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

/* ... existing styles ... */
</style>