<!-- src/components/machi/card/CardAssetDetail.vue -->
<script setup lang="ts">
import { Asset, Order, Trade } from '../../../types/responseData';
import OrdersTable from '../../order/OrdersTable.vue';
import TradesTable from '../../trade/TradesTable.vue';
import TakeProfitTable from '../TakeProfitTable.vue';
import { ref, computed, reactive, watch } from 'vue';
import { getTakeProfitsTargets } from '../../../js/strat/common';
import { strategyOptions } from '../../../js/strat/strategyOptions';

// Props
const props = defineProps<{
    asset: Asset;
    orders: Order[];
    trades: Trade[];
}>();

// Calculs réactifs
const buyOpenOrdersCount = computed(() => props.orders.filter((order) => order.side === 'buy').length);
const sellOpenOrdersCount = computed(() => props.orders.filter((order) => order.side === 'sell').length);
const buyTradesCount = computed(() => props.trades.filter((trade) => trade.side === 'buy').length);
const sellTradesCount = computed(() => props.trades.filter((trade) => trade.side === 'sell').length);


// Menu
const menubarRight = ref([
    { label: `Open Orders (${buyOpenOrdersCount.value}/${sellOpenOrdersCount.value})`, command: () => onMenuSelectRight('0') },
    { label: 'Next TP', command: () => onMenuSelectRight('1') },
    { label: `Historic (${buyTradesCount.value}/${sellTradesCount.value})`, command: () => onMenuSelectRight('2') }
]);

const menubarLeft = ref([
    { label: `Strategy`, command: () => onMenuSelectLeft('0') },
    { label: 'Add 1', command: () => onMenuSelectLeft('1') },
    { label: `Add 1`, command: () => onMenuSelectLeft('2') }
]);
 
const selectedMenuLeft = ref('0');
const selectedMenuRight = ref('1');
const onMenuSelectLeft = (menuLabel: string) => (selectedMenuLeft.value = menuLabel);
const onMenuSelectRight = (menuLabel: string) => (selectedMenuRight.value = menuLabel);

// Autres données réactives
const ass = reactive(props.asset);
const reactiveTakeProfits = computed(() => ass.strat.takeProfits);
const selectedStrat = ref<string>(props.asset.strat.strategy || 'shad');
const selectedExpo = ref<number>(props.asset.strat.maxExposition || 0);

// Sauvegarde de la stratégie
const saveStratForAsset = (): void => {
    console.info('Saving strategy for asset:', ass.strat.strategy, ass.strat.maxExposition);
};


watch([selectedStrat, selectedExpo], ([newStrat, newExpo]) => {
    ass.strat.strategy = newStrat;
    ass.strat.maxExposition = newExpo;
    const updatedTakeProfits = getTakeProfitsTargets(ass);
    Object.assign(ass.strat.takeProfits, updatedTakeProfits);
});

</script>

<template>
    <div class="card-details">
        <div class="card-panel">
            <div class="card-details-menu">
                <Menubar :model="menubarLeft" @command="onMenuSelectLeft" />
            </div>
            <div class="card-details-content">
                <div v-if="selectedMenuLeft === '0'">
                    <!-- Dropdown pour la stratégie -->
                    <Select v-model="selectedStrat" :options="strategyOptions" optionLabel="name"
                        optionValue="value" placeholder="Select Strategy" />
                    <!-- Input pour l'exposition maximale -->
                    <InputNumber v-model="selectedExpo" placeholder="Max Exposure" />
                    <!-- Bouton de sauvegarde -->
                    <button class="save-button" @click="saveStratForAsset">Save</button>
                </div>
                <div v-if="selectedMenuLeft === '1'">
                    <p>A rajouter</p>

                </div>
                <div v-if="selectedMenuLeft === '2'">
                    <p>A rajouter</p>
                </div>
            </div>
        </div>

        <div class="card-panel">
            <div class="card-details-menu">
                <Menubar :model="menubarRight" @command="onMenuSelectRight" />
            </div>
            <div class="card-details-content">
                <div v-if="selectedMenuRight === '0'">
                    <OrdersTable v-if="orders.length" :items="orders" />
                    <p v-else>Pas d'ordres ouverts</p>
                </div>
                <div v-if="selectedMenuRight === '1'">
                    <TakeProfitTable :takeProfits="reactiveTakeProfits" :orders="orders" />
                </div>
                <div v-if="selectedMenuRight === '2'">
                    <TradesTable v-if="trades.length" :items="trades" />
                    <p v-else>Pas d'historique</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.menubar {
    display: flex;
    justify-content: space-around;
    background-color: #f4f4f4;
    padding: 0.5rem;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-details {
    background-color: #ddd;
    padding: 1rem;
    overflow-x: auto;
    max-width: 100%;
    display: grid;
}

.card-details-menu {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    z-index: 10;
}

.card-details-content {
    overflow-x: auto;
    white-space: nowrap;
    max-width: 100%;
}


/* Bouton de sauvegarde */
.save-button {
    background-color: #4caf50;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: background-color var(--transition-duration);
}

.save-button:hover {
    background-color: #45a049;
}
</style>
