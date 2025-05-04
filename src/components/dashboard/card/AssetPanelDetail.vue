// File: src/components/dashboard/card/AssetPanelDetail.vue

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
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
const props = defineProps<{ asset: Asset; orders: Order[]; trades: TradeTransformed[] }>();

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
                <TabPanel header="Add 2">
                    <p>A rajouter</p>
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
