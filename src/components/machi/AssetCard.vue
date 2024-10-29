<!-- src/components/machi/AssetCard.vue -->
<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import { Asset, Order, Trade } from '../../types/responseData';

import WalletBlock from './block/WalletBlock.vue';
import CurrentPriceBlock from './block/CurrentPriceBlock.vue';
import NextTp from './block/NextTp.vue';
import StratBlock from './block/StratBlock.vue';
import AssetBlock from './block/AssetBlock.vue';
import TradesTable from '../trade/TradesTable.vue';
import OrdersTable from '../order/OrdersTable.vue';
import TakeProfitTable from './TakeProfitTable.vue';
import { getTakeProfitsTargets } from '../../js/strat/common';

// Déclarer les props
const props = defineProps<{
    asset: Asset;
    trades: Trade[];
    orders: Order[];
}>();

const strat = props.asset.strat.strategy || 'shad';  //ce sont lesvaleurs que je veux attribuer 
const stratExpo = props.asset.strat.maxExposition || 0;

// Accès à 'item' via 'props'
const item = props.asset;
const trades = props.trades;
const filteredTrades = trades.filter((trade) => {
    return trade.base === item.base && trade.platform === props.asset.platform;
});

const orders = props.orders;
const filteredOrders = orders.filter((order) => {
    return order.symbol.startsWith(item.base + '/') && order.platform === props.asset.platform;
});

const buyOpenOrdersCount = computed(() => filteredOrders.filter(order => order.side === 'buy').length);
const sellOpenOrdersCount = computed(() => filteredOrders.filter(order => order.side === 'sell').length);
const buyTradesCount = computed(() => filteredTrades.filter(trade => trade.type === 'buy').length);
const sellTradesCount = computed(() => filteredTrades.filter(trade => trade.type === 'sell').length);

const isDetailsVisible = ref(false);

const toggleDetails = () => {
    isDetailsVisible.value = !isDetailsVisible.value;
};

const menubarOptions = ref([
    { label: `Open Orders (${buyOpenOrdersCount.value}/${sellOpenOrdersCount.value})`, command: () => onMenuSelect('0') },
    { label: 'Next TP', command: () => onMenuSelect('1') },
    { label: `Historic (${buyTradesCount.value}/${sellTradesCount.value})`, command: () => onMenuSelect('2') }
]);

const selectedMenu = ref('1');
const onMenuSelect = (menuLabel: string) => {
    selectedMenu.value = menuLabel;
};

const selectedStrat = ref<string>(strat);
const selectedExpo = ref<number>(stratExpo);

const updateStrat = (newSelection: string): void => {
    selectedStrat.value = newSelection
}

const updateStratExpo = (newSelection: number): void => {
    selectedExpo.value = newSelection
}

const ass = reactive(item);
const reactiveTakeProfits = computed(() => ass.strat.takeProfits);

const recupTp1 = ass.strat.takeProfits.tp1.price * ass.strat.takeProfits.tp1.amount
const currentPrice = ass.liveData.currentPrice

watch([selectedStrat, selectedExpo], ([newStrat, newExpo]) => {
    // Logique pour recalculer les éléments en fonction des nouvelles stratégies.
    console.log('Stratégie modifiée', newStrat, newExpo);
    // Recalculer les takeProfits ici si nécessaire.


    ass.strat.strategy = newStrat;
    ass.strat.maxExposition = newExpo;


    console.log('ass', ass)


    // Appel à getTakeProfitsTargets avec l'item mis à jour
    const updatedTakeProfits = getTakeProfitsTargets(ass);
    console.log('updatedTakeProfits', updatedTakeProfits)
    // Mise à jour de takeProfits avec les valeurs calculées de updatedTakeProfits
    ass.strat.takeProfits = { ...updatedTakeProfits };
    //Object.assign(tps, updatedTakeProfits);

    // Log des nouvelles valeurs pour validation
    console.log('TakeProfits mis à jour:', ass);
});
</script>

<template>
    <div class="card" v-if="item">
        <div class="card-header">

            <div class="case-a1">
                <AssetBlock :item=item />
                <CurrentPriceBlock :item=item />
                <WalletBlock :item=item />
                <NextTp :takeProfits=reactiveTakeProfits :recupTp1=recupTp1 :currentPrice=currentPrice />
                <StratBlock :strat=strat :stratExpo=stratExpo @update:strat="updateStrat"
                    @update:strat-expo="updateStratExpo" />
            </div>

            <div class="case-a2">
                <p>{{ item.platform }}</p>

            </div>

            <div class="case-a3" @click="toggleDetails">
                <Button :icon="isDetailsVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="expand-button" />
            </div>

        </div>

        <!-- Détails supplémentaires lorsque le chevron est cliqué -->
        <div class="card-details" v-if="isDetailsVisible">

            <div class="card-details-menu">
                <Menubar :model="menubarOptions" @command="onMenuSelect" />
            </div>

            <div class="card-details-content">
                <div v-if="selectedMenu === '0'">
                    <div v-if="filteredOrders && filteredOrders.length > 0">
                        <OrdersTable :items=filteredOrders />
                    </div>
                    <div v-else>
                        <p>Pas d'ordres ouverts</p>
                    </div>
                </div>
                <div v-if="selectedMenu === '1'">
                    <TakeProfitTable :takeProfits=reactiveTakeProfits :orders="filteredOrders" />
                </div>
                <div v-if="selectedMenu === '2'">
                    <div v-if="filteredTrades && filteredTrades.length > 0">
                        <TradesTable :items=filteredTrades />
                    </div>
                    <div v-else>
                        <p>Pas d'historique</p>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- Affichage si item est non défini -->
    <div v-else>
        <p>Chargement des données...</p>
        <!-- rajouter un loader -->
    </div>
</template>

<style scoped>
.card {
    border: 1px solid white;
    border-radius: 15px;
    margin-bottom: 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
    padding: 0.5rem;
    cursor: pointer;
    background-color: blue;
    max-width: 100%;
    overflow: hidden;
}

.card-header {
    display: grid;
    background-color: yellowgreen;
    height: fit-content;
}

.card-details {
    overflow-x: auto;
    max-width: 100%;
    display: grid;
    background-color: darkblue;
    height: fit-content;
}

.card-details-menu {
    display: flex;
    position: sticky;
    justify-content: center;
    margin: 0 auto;
    /* Centre le menu horizontalement */
    z-index: 10;
    /* Pour s'assurer que le menu reste au-dessus */
}

.card-details-content {
    overflow-x: auto;
    /* Permet uniquement le défilement horizontal ici */
    white-space: nowrap;
    /* Assure que le contenu à l'intérieur ne se déplace pas sur plusieurs lignes */
}

.icon {
    width: 64px;
    height: 64px;
}

.case-a1 {
    background-color: darkgoldenrod;
    display: flex;
    justify-content: space-between;
    align-items: center;
    grid-column: 1;
    grid-row: 1;
}

.case-a2 {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    align-items: center;
}

.case-a3 {
    grid-column: 3;
    grid-row: 1;
    display: flex;
    align-items: center;
}



/* Chevron d'expansion */
.expand-button .pi-chevron-down {
    background-color: darkkhaki;
    font-size: 24px;
    /* Taille de l'icône */
    color: red;
    /* Couleur de l'icône */
}
</style>