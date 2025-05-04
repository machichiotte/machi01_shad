// File: src/components/dashboard/card/AssetPanelDetail.vue

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, nextTick, PropType  } from 'vue';
import { Asset, Order, TradeTransformed } from '../../../types/responseData';
import OrdersTable from '../../order/OrdersTable.vue';
import TradesTable from '../../trade/TradesTable.vue';
import TakeProfitTable from '../TakeProfitTable.vue';
import { getTakeProfitsTargets } from '../../../strat/common';
import { strategyOptions } from '../../../strat/strategyOptions';

// PrimeVue components
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputNumber from 'primevue/inputnumber';

// Props
const props = defineProps({
    asset: { type: Object as PropType<Asset>, required: true },
    orders: { type: Array as PropType<Order[]>, required: true },
    trades: { type: Array as PropType<TradeTransformed[]>, required: true }, // Assuming transformed trades are passed
    // *** Receive selectedMarket as a prop ***
    selectedMarket: { type: String as PropType<string | null>, required: true },
    // Receive availableMarkets if needed for fallback or other UI elements
    availableMarkets: { type: Array as PropType<string[]>, default: () => [] }
});
// Reactive asset state
const ass = reactive(props.asset);

// Tab indices
const selectedLeft = ref<number>(0);
const selectedRight = ref<number>(1);
const onLeftChange = (e: { index: number }) => (selectedLeft.value = e.index);
const onRightChange = (e: { index: number }) => (selectedRight.value = e.index);

// Derived counts
const buyOpenOrdersCount = computed(() => props.orders.filter(o => o.side?.toLowerCase() === 'buy').length);
const sellOpenOrdersCount = computed(() => props.orders.filter(o => o.side?.toLowerCase() === 'sell').length);
const buyTradesCount = computed(() => props.trades.filter(t => t.side.toLowerCase() === 'buy').length);
const sellTradesCount = computed(() => props.trades.filter(t => t.side.toLowerCase() === 'sell').length);

// Strategy and exposition
const selectedStrat = ref<string>(ass.strat.strategy || 'shad');
const selectedExpo = ref<number>(ass.strat.maxExposition || 0);

// Computed take profits
const reactiveTakeProfits = computed(() => ass.strat.takeProfits);

// Save callback
const saveStratForAsset = (): void => {
    console.info('Saving strategy for asset:', ass.strat.strategy, ass.strat.maxExposition);
};

// Watch for changes
watch([selectedStrat, selectedExpo], ([newStrat, newExpo]) => {
    ass.strat.strategy = newStrat;
    ass.strat.maxExposition = newExpo;
    const updated = getTakeProfitsTargets(ass);
    Object.assign(ass.strat.takeProfits, updated);
});


// --- TradingView Integration ---
// Use asset base and platform for a more stable ID
const tradingviewContainerId = computed(() => `tradingview-widget-${props.asset.base}-${props.asset.platform}`);
let tradingViewWidget: any = null; // To hold the widget instance

// *** UPDATED TradingView Loader Function ***
const loadTradingViewWidget = () => {
    // *** Use props.selectedMarket ***
    const marketSymbol = props.selectedMarket;

    if (!marketSymbol) {
        console.warn("No market selected, cannot load TradingView chart.");
        const container = document.getElementById(tradingviewContainerId.value);
        if (container) container.innerHTML = '<p>Please select a market in the header.</p>';
        return;
    }

    // Platform prefix still needed
    const platformPrefix = props.asset.platform?.toUpperCase();
     if (!platformPrefix) {
         console.error("Asset platform is missing, cannot generate TradingView symbol.");
         const container = document.getElementById(tradingviewContainerId.value);
          if (container) container.innerHTML = '<p>Error: Asset platform missing.</p>';
         return;
     }

    // Construct the final TradingView symbol (e.g., BINANCE:BTCUSDT)
    const tradingViewSymbol = `${platformPrefix}:${marketSymbol}`;

    console.log(`Loading TradingView Widget for symbol: ${tradingViewSymbol} into container: ${tradingviewContainerId.value}`);

    const container = document.getElementById(tradingviewContainerId.value);
    if (!container) {
        console.error(`TradingView container #${tradingviewContainerId.value} not found.`);
        return;
    }
    container.innerHTML = ''; // Clear previous content/errors

    if (typeof (window as any).TradingView === 'undefined') {
        console.error('TradingView library not loaded. Ensure tv.js is included in index.html');
        if (container) container.innerHTML = '<p>Error loading TradingView library.</p>';
        return;
    }

    const createWidget = (symbol: string) => {
        try {
            if (container) container.innerHTML = ''; // Clear just before creation
            tradingViewWidget = new (window as any).TradingView.widget({
                autosize: true,
                symbol: symbol,
                interval: "D",
                timezone: "Etc/UTC",
                theme: "light",
                style: "1",
                locale: "fr",
                toolbar_bg: "#f1f3f6",
                enable_publishing: false,
                allow_symbol_change: true, // Keep this true
                container_id: tradingviewContainerId.value,
            });
            console.log('TradingView widget created:', tradingViewWidget);
        } catch (error) {
            console.error('Error creating TradingView widget:', error);
            if (container) container.innerHTML = '<p>Error creating TradingView chart.</p>';
        }
    };
    createWidget(tradingViewSymbol);
};

// --- Watchers for TradingView ---

// Watch for the "Graph" tab (index 2) to become active
watch(selectedLeft, async (newIndex, oldIndex) => {
  // Assuming 'Graph' is the 3rd tab (index 2)
  if (newIndex === 2) {
    await nextTick(); // Wait for DOM update
    loadTradingViewWidget(); // Load/Reload when tab becomes visible
  }
}, { immediate: false }); // Don't run immediately

// Watch for changes in selectedMarket prop
watch(() => props.selectedMarket, async (newMarket, oldMarket) => {
    // Reload widget only if the graph tab (index 2) is currently active
    if (selectedLeft.value === 2 && newMarket && newMarket !== oldMarket) {
         console.log(`Market changed to ${newMarket}, reloading TradingView widget.`);
         await nextTick(); // Ensure container is ready if DOM updates occur
         loadTradingViewWidget();
    }
}, { immediate: false }); // Don't run immediately

// Load if "Graph" is the initial tab on component mount
onMounted(() => {
    // Ensure TradingView library (tv.js) is loaded *before* this runs.
    if (selectedLeft.value === 2) {
        loadTradingViewWidget();
    }
});

</script>

<template>
    <div class="card-details">
        <div class="card-panel">
            <TabView :activeIndex="selectedLeft" @tab-change="onLeftChange" :renderActiveOnly="true">
                <TabPanel header="Strategy">
                    <div class="tab-content">
                        <Select v-model="selectedStrat" :options="strategyOptions" optionLabel="name"
                            optionValue="value" placeholder="Select Strategy" />
                        <InputNumber v-model="selectedExpo" placeholder="Max Exposure" />
                        <button @click="saveStratForAsset">Save</button>
                    </div>
                </TabPanel>
                <TabPanel header="Data">
                    <div class="data-content">
                        <div class="section">
                            <h4>Basic Info</h4>
                            <img :src="ass.iconUrl" alt="Asset Icon" class="asset-icon" />
                            <p><strong>Base:</strong> {{ ass.base }}</p>
                            <p><strong>Name:</strong> {{ ass.name }}</p>
                            <p><strong>Ticker:</strong> {{ ass.ticker }}</p>
                            <p><strong>Platform:</strong> {{ ass.platform }}</p>
                            <p><strong>Tags:</strong>
                                <span v-for="(tag, index) in ass.tags" :key="tag">
                                    {{ tag }}{{ index < ass.tags.length - 1 ? ', ' : '' }} </span>
                            </p>
                        </div>

                        <div class="section">
                            <h4>CMC Data</h4>
                            <p><strong>Price:</strong> {{ ass.cmc.currentCmcPrice }} USD</p>
                            <p><strong>Rank:</strong> #{{ ass.cmc.rank }}</p>
                            <p><strong>Change 24h:</strong> {{ ass.cmc.cryptoPercentChange24h }}%</p>
                            <p><strong>Change 7d:</strong> {{ ass.cmc.cryptoPercentChange7d }}%</p>
                            <p><strong>Change 30d:</strong> {{ ass.cmc.cryptoPercentChange30d }}%</p>
                            <p><strong>Change 60d:</strong> {{ ass.cmc.cryptoPercentChange60d }}%</p>
                            <p><strong>Change 90d:</strong> {{ ass.cmc.cryptoPercentChange90d }}%</p>
                        </div>

                        <div class="section">
                            <h4>Live Data</h4>
                            <p><strong>Balance:</strong> {{ ass.liveData.balance }}</p>
                            <p><strong>Current Price:</strong> {{ ass.liveData.currentPrice }} USD</p>
                            <p><strong>Possession Value:</strong> {{ ass.liveData.currentPossession }} USD</p>
                            <p><strong>Realized Profit:</strong> {{ ass.profit }} USD</p>
                        </div>

                        <div class="section">
                            <h4>Strategy Summary</h4>
                            <p><strong>Current Strategy:</strong> {{ ass.strat.strategy }}</p>
                            <p><strong>Max Exposure:</strong> {{ ass.strat.maxExposition }}</p>
                            <p><strong>TP Status:</strong> {{ ass.strat.takeProfits.status.join(', ') }}</p>
                        </div>

                        <div class="section">
                            <h4>Order/Trade Summary</h4>
                            <p><strong>Open Buy Orders:</strong> {{ ass.orders.open.nbOpenBuyOrders }}</p>
                            <p><strong>Open Sell Orders:</strong> {{ ass.orders.open.nbOpenSellOrders }}</p>
                            <p><strong>Total Buy Value (Historic):</strong> {{ ass.orders.trade.totalBuy }} USD</p>
                            <p><strong>Total Sell Value (Historic):</strong> {{ ass.orders.trade.totalSell }} USD</p>
                            <p><strong>Total Amount Bought (Historic):</strong> {{ ass.orders.trade.totalAmountBuy }}
                            </p>
                            <p><strong>Total Amount Sold (Historic):</strong> {{ ass.orders.trade.totalAmountSell }}</p>
                            <p><strong>Average Entry Price:</strong> {{ ass.orders.trade.averageEntryPrice }} USD</p>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Graph" :pt="{ content: { style: 'height: 500px; padding: 0;' } }">
                    <div :id="tradingviewContainerId" class="tradingview-widget-container" style="height: 100%; width: 100%;">
                        <p v-if="!props.selectedMarket">Select a market in the header to view the chart.</p>
                        <p v-else>Loading TradingView Chart for {{ props.selectedMarket }}...</p>
                    </div>
                </TabPanel>
            </TabView>
        </div>

        <div class="card-panel">
            <TabView :activeIndex="selectedRight" @tab-change="onRightChange" :renderActiveOnly="true">
                <TabPanel :header="`Open Orders (${buyOpenOrdersCount}/${sellOpenOrdersCount})`">
                    <OrdersTable v-if="orders.length" :rows="orders" />
                    <p v-else>Pas d'ordres ouverts</p>
                </TabPanel>
                <TabPanel header="Next TP">
                    <TakeProfitTable :takeProfits="reactiveTakeProfits" :orders="orders" />
                </TabPanel>
                <TabPanel :header="`Historic (${buyTradesCount}/${sellTradesCount})`">
                    <TradesTable v-if="trades.length" :rows="trades" />
                    <p v-else>Pas d'historique</p>
                </TabPanel>
            </TabView>
        </div>
    </div>
</template>

<style scoped>
.card-details {
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

.card-panel {
    margin-bottom: 1rem;
}

.tab-content {
    display: flex;
    gap: 1rem;
    align-items: center;
}
</style>
