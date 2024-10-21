<!-- src/components/machi/AssetCard.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Machi, Order } from '../../types/responseData';

import WalletBlock from './block/WalletBlock.vue';
import CurrentPriceBlock from './block/CurrentPriceBlock.vue';
import NextTp from './block/NextTp.vue';
import StratBlock from './block/StratBlock.vue';
import AssetBlock from './block/AssetBlock.vue';
import { Trade, TakeProfits } from '../../types/responseData';
import TradesTable from '../trade/TradesTable.vue';
import OrdersTable from '../order/OrdersTable.vue';
import TakeProfitTable from './TakeProfitTable.vue';
import { getTakeProfitsTargets } from '../../js/strat/common';
// Déclarer les props
const props = defineProps<{
    item: Machi;
    trades: Trade[];
    orders: Order[];
}>();

const strat = props?.item?.strat || 'shad';  //ce sont lesvaleurs que je veux attribuer 
const stratExpo = props?.item?.stratExpo || 0;

// Accès à 'item' via 'props'
const item = props.item;
const trades = props.trades;
const filteredTrades = trades.filter((trade) => {
    return trade.base === item.base && trade.platform === props.item.platform;
});

const orders = props.orders;
const filteredOrders = orders.filter((order) => {
    return order.symbol.startsWith(item.base + '/') && order.platform === props.item.platform;
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

const takeProfits: TakeProfits = {
    tp1: {
        price: item.priceTp1,
        amount: item.amountTp1,
        percentToNextTp: item.percentToNextTp
    },
    tp2: {
        price: item.priceTp2,
        amount: item.amountTp2
    },
    tp3: {
        price: item.priceTp3,
        amount: item.amountTp3
    },
    tp4: {
        price: item.priceTp4,
        amount: item.amountTp4
    },
    tp5: {
        price: item.priceTp5,
        amount: item.amountTp5
    },
    status: Array.isArray(item.status) ? item.status : [0] // Garde une structure de tableau pour éviter les conflits
};

const recupTp1 = props.item.recupTp1
const currentPrice = props.item.currentPrice

watch([selectedStrat, selectedExpo], ([newStrat, newExpo]) => {
    // Logique pour recalculer les éléments en fonction des nouvelles stratégies.
    console.log('Stratégie modifiée', newStrat, newExpo);
    // Recalculer les takeProfits ici si nécessaire.
    const updatedItem = {
        ...item,
        strat: newStrat,
        maxExposition: newExpo
    };

    console.log('updatedItem', updatedItem)


    // Appel à getTakeProfitsTargets avec l'item mis à jour
    const updatedTakeProfits = getTakeProfitsTargets(updatedItem);
    console.log('updatedTakeProfits', updatedTakeProfits)
    // Mise à jour de takeProfits avec les valeurs calculées de updatedTakeProfits
    takeProfits.tp1.price = updatedTakeProfits.priceTp1;
    takeProfits.tp1.amount = updatedTakeProfits.amountTp1;
    takeProfits.tp1.percentToNextTp = updatedTakeProfits.recupTp1; // exemple

    takeProfits.tp2.price = updatedTakeProfits.priceTp2;
    takeProfits.tp2.amount = updatedTakeProfits.amountTp2;

    takeProfits.tp3.price = updatedTakeProfits.priceTp3;
    takeProfits.tp3.amount = updatedTakeProfits.amountTp3;

    takeProfits.tp4.price = updatedTakeProfits.priceTp4;
    takeProfits.tp4.amount = updatedTakeProfits.amountTp4;

    takeProfits.tp5.price = updatedTakeProfits.priceTp5;
    takeProfits.tp5.amount = updatedTakeProfits.amountTp5;

    // Log des nouvelles valeurs pour validation
    console.log('TakeProfits mis à jour:', takeProfits);
});
</script>

<template>

    <div class="card" v-if="item">
        <div class="card-header">

            <div class="case-a1">
                <AssetBlock :item=item />
                <CurrentPriceBlock :item=item />
                <WalletBlock :item=item />
                <NextTp :takeProfits=takeProfits :recupTp1=recupTp1 :currentPrice=currentPrice />
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
            <div class="menubar-container">
                <!-- Il faudrait centrer le menubar, pour le moment jai limpression quil occupe totue la largeur mais quil a tous ces elements a gauche -->
                <Menubar :model="menubarOptions" @command="onMenuSelect" />
            </div>

            <div v-if="selectedMenu === '0'">
                <div v-if="filteredOrders && filteredOrders.length > 0">
                    <OrdersTable :items=filteredOrders />
                </div>
                <!-- Sinon, afficher un message indiquant que l'historique est vide -->
                <div v-else>
                    <p>Pas d'ordres ouverts</p>
                </div>
            </div>
            <div v-if="selectedMenu === '1'">
                <TakeProfitTable :item="item" :orders="filteredOrders" />
            </div>
            <div v-if="selectedMenu === '2'">
                <div v-if="filteredTrades && filteredTrades.length > 0">
                    <TradesTable :items=filteredTrades />
                </div>
                <!-- Sinon, afficher un message indiquant que l'historique est vide -->
                <div v-else>
                    <p>Pas d'historique</p>
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
}

.card-header {
    display: grid;
    background-color: yellowgreen;
    height: fit-content;
}

.card-details {
    display: grid;
    background-color: darkblue;
    height: fit-content;
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

.menubar-container {
    display: flex;
    justify-content: center;
}

/* Détails supplémentaires */
.card-details {
    margin-top: 1rem;
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