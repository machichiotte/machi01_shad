<!-- src/components/machi/AssetCard.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { Machi, Order } from '../../types/responseData';

import WalletBlock from './block/WalletBlock.vue';
import CurrentPriceBlock from './block/CurrentPriceBlock.vue';
import NextTp from './block/NextTp.vue';
import StratBlock from './block/StratBlock.vue';
import AssetBlock from './block/AssetBlock.vue';
import { Trade } from '../../types/responseData';
import TradesTable from '../trade/TradesTable.vue';
import OrdersTable from '../order/OrdersTable.vue';
import TakeProfitTable from './TakeProfitTable.vue';

// Déclarer les props
const props = defineProps<{
    item: Machi;
    trades: Trade[];
    orders: Order[];
}>();

// Accès à 'item' via 'props'
const item = props.item;
const trades = props.trades;
const filteredTrades = trades.filter((trade) => {
    return trade.base === item.base && trade.platform === props.item.platform;
});

console.log('propsorder0')

const orders = props.orders;
console.log('propsorder1')
console.log('propsorder', props.orders)

const filteredOrders = orders.filter((order) => {
    return order.symbol.startsWith(item.base + '/') && order.platform === props.item.platform;
});

const isDetailsVisible = ref(false);

const toggleDetails = () => {
    isDetailsVisible.value = !isDetailsVisible.value;
};

const menubarOptions = ref([
    { label: 'Open Orders', command: () => onMenuSelect('0') },
    { label: 'Next TP', command: () => onMenuSelect('1') },
    { label: 'Historic', command: () => onMenuSelect('2') }
]);

const selectedMenu = ref('1');
const onMenuSelect = (menuLabel: string) => {
    selectedMenu.value = menuLabel;
};
</script>

<template>

    <div class="card" v-if="item">
        <div class="card-header" @click="toggleDetails">

            <div class="case-a1">
                <AssetBlock :item="item" />
                <CurrentPriceBlock :item=item />
                <WalletBlock :item=item />
                <NextTp :item=item />
                <StratBlock />
            </div>

            <div class="case-a2">
                <p>{{ item.platform }}</p>

            </div>

            <div class="case-a3">
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