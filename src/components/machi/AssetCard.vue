<!-- src/components/machi/AssetCard.vue -->
<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import { Asset, Order, Trade } from '../../types/responseData';
import TradesTable from '../trade/TradesTable.vue';
import OrdersTable from '../order/OrdersTable.vue';
import TakeProfitTable from './TakeProfitTable.vue';
import InfoLabelClick from './block/InfoLabelClick.vue';
import { getTakeProfitsTargets } from '../../js/strat/common';
import { strategyOptions } from '../../js/strat/strategyOptions';
import { calculateTakeProfitProgress } from '../../js/utils/takeprofits';

// Props
const props = defineProps<{
    asset: Asset;
    trades: Trade[];
    orders: Order[];
}>();

// Données locales
const item = props.asset;
const trades = props.trades.filter(
    (trade) => trade.base === item.base && trade.platform === item.platform
);
const orders = props.orders.filter(
    (order) => order.symbol.startsWith(item.base + '/') && order.platform === item.platform
);

const periods = [
    { period: '24h', value: item.cmc.cryptoPercentChange24h },
    { period: '7d', value: item.cmc.cryptoPercentChange7d },
    { period: '30d', value: item.cmc.cryptoPercentChange30d },
    { period: '60d', value: item.cmc.cryptoPercentChange60d },
    { period: '90d', value: item.cmc.cryptoPercentChange90d }
];

// Calculs réactifs
const buyOpenOrdersCount = computed(() => orders.filter((order) => order.side === 'buy').length);
const sellOpenOrdersCount = computed(() => orders.filter((order) => order.side === 'sell').length);
const buyTradesCount = computed(() => trades.filter((trade) => trade.side === 'buy').length);
const sellTradesCount = computed(() => trades.filter((trade) => trade.side === 'sell').length);

// Gestion des détails
const isDetailsVisible = ref(false);
const toggleDetails = () => (isDetailsVisible.value = !isDetailsVisible.value);

// Menu
const menubarOptions = ref([
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

// Formatage des nombres
const formatNumber = (value: number | null): string => {
    if (value === null || value === undefined) {
        return '0'; // Retourne un format par défaut ou une valeur vide
    }

    return value.toFixed(2); // Formatte avec 2 décimales
}

const formatNumberWithDynamicPrecision = (
    value: number | null,
    referenceValue: number
): string => {
    // Handle null or undefined values
    if (value === null || value === undefined) {
        return '0'; // Default value
    }

    // Calculate the number of decimal places based on referenceValue
    const decimalPlaces = referenceValue.toString().split('.')[1]?.length || 0;

    // Format the number with the calculated decimal places
    return value.toFixed(decimalPlaces);
};

defineExpose({ formatNumber });

// Formatage des totaux d'achat et de vente
const formattedTotalBuy = computed(() => formatNumber(item.orders.trade.totalBuy || 0));
const formattedTotalSell = computed(() => formatNumber(item.orders.trade.totalSell || 0));

// Autres données réactives
const selectedStrat = ref<string>(props.asset.strat.strategy || 'shad');
const selectedExpo = ref<number>(props.asset.strat.maxExposition || 0);
const ass = reactive(item);
const reactiveTakeProfits = computed(() => ass.strat.takeProfits);

const tpProgress = computed(() => calculateTakeProfitProgress(ass.strat.takeProfits, ass.liveData));



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
    <div class="card" v-if="item">
        <div class="card-header">
            <!-- Ligne 1 -->
            <div class="row line-1">
                <!-- Colonne gauche -->
                <div class="item-details">
                    <div class="item-icon-rank">
                        <img :src="item.iconUrl" alt="Logo" class="logo" />
                        <div class="rank">#{{ item.cmc.rank }}</div>
                    </div>
                    <div class="item-base-name">
                        <div class="base">{{ item.base }}</div>
                        <div class="name">{{ item.name }}</div>
                    </div>

                    <InfoLabelClick :label="`${item.liveData.currentPrice}`" :periods="periods" />

                    <div class="next-tp">
                        <!-- Icône de flèche verte vers le haut avec le prix du TP -->

                        <div class="next-tp-price"
                            v-tooltip.top="{ value: 'Next Tp Price', showDelay: 1000, hideDelay: 300 }">
                            <i class="pi pi-arrow-up-right green-icon logo" />
                            <small>
                                {{ formatNumberWithDynamicPrecision(item.strat.takeProfits.tp1.price,
                                    item.liveData.currentPrice) }}
                            </small>
                        </div>


                        <div class="next-tp-recovery"
                            v-tooltip.top="{ value: 'Next Gain', showDelay: 1000, hideDelay: 300 }">
                            <!-- Barre de progression -->
                            <div class="progress-bar">
                                <div class="progress" :style="{ width: tpProgress + '%' }"></div>
                            </div>
                            <!-- Récupération associée -->
                            <span class="tp-recovery">
                                {{ formatNumber(item.strat.takeProfits.tp1.price *
                                    item.strat.takeProfits.tp1.amount) }}$
                            </span>
                        </div>

                        <div class="next-tp-balance"
                            v-tooltip.top="{ value: 'Next Tp Amount', showDelay: 1000, hideDelay: 300 }">
                            <img :src="item.iconUrl" alt="Logo" class="logo small-logo" />

                            <small>
                                {{ formatNumberWithDynamicPrecision(item.strat.takeProfits.tp1.amount,
                                    item.liveData.balance) }}
                                ({{ (item.strat.takeProfits.tp1.amount / item.liveData.balance * 100).toFixed(2) }}%)
                            </small>
                        </div>
                    </div>

                    <div class="item-wallet">
                        <div class="wallet-possession">Wallet: {{ item.liveData.currentPossession }}</div>
                        <div class="average-entry-price"
                            :class="{ positive: item.liveData.currentPrice > Number(formattedTotalBuy), negative: item.liveData.currentPrice < Number(formattedTotalBuy) }">
                            Avg. Entry: {{ item.orders.trade.averageEntryPrice }}
                        </div>
                        <div class="trade-info">
                            <span style="color: blue;">+{{ formattedTotalBuy }}</span> / <span
                                style="color: orange;">-{{
                                    formattedTotalSell }}</span>
                        </div>
                        <Button :icon="isDetailsVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
                            class="expand-button" @click="toggleDetails" />
                    </div>
                </div>
            </div>

        </div>

        <!-- Détails -->
        <div class="card-details" v-if="isDetailsVisible">

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
                    <Menubar :model="menubarOptions" @command="onMenuSelectRight" />
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
    </div>

    <div v-else>
        <p>Chargement des données...</p>
    </div>
</template>

<style scoped>
/* Variables CSS pour des couleurs et styles réutilisables */
:root {
    --primary-bg: #f4f4f4;
    --secondary-bg: #eaeaea;
    --highlight-color: #4caf50;
    --danger-color: #ff4c4c;
    --neutral-color: #777;
    --font-main: 'Roboto', sans-serif;
    --transition-duration: 0.3s;
}

.card {
    background-color: #ddd;
    color: #666;
    border-radius: 15px;
    margin: 1rem;
    padding: 0.5rem;
    cursor: pointer;
    max-width: 100%;
    overflow: hidden;
    font-family: 'Roboto', sans-serif;
    transition: box-shadow 0.3s;
}

.card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: grid;
    grid-template-columns: 1fr;
    background-color: #ddd;
    padding: 0.5rem;
}

/* Ligne 1 */
.row.line-1 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

/* Colonne gauche */
.item-details {
    display: flex;
    align-items: center;
    gap: 1rem;
}

/* Logo et rang */
.item-icon-rank {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.logo {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 8px;
}

.small-logo {
    width: 16px;
    /* Ajustez cette valeur selon la taille de "pi wallet" */
    height: 16px;
    /* Assurez une forme carrée */
    object-fit: contain;
    /* Garde l'image proportionnée */
}

.rank {
    font-size: 0.875rem;
    font-weight: bold;
}

/* Informations principales */
.item-base-name {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.base {
    font-size: 1.2rem;
    font-weight: bold;
}

.name {
    font-size: 1rem;
}

/* Colonne droite */
.item-wallet {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.wallet-possession {
    font-size: 1rem;
    font-weight: bold;
}

.average-entry-price {
    font-size: 1rem;
    font-weight: bold;
    transition: color var(--transition-duration);
}

.average-entry-price.positive {
    color: #4caf50;
}

.average-entry-price.negative {
    color: #ff4c4c;
}

.trade-info {
    display: flex;
    flex-direction: row;
    gap: 0.3rem;
}

/* Chevron d'expansion */
.expand-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
}

.expand-button .pi {
    font-size: 1.5rem;
    color: #777;
    transition: transform var(--transition-duration);
}

.expand-button:hover .pi {
    transform: scale(1.1);
}

/* Ligne 2 */
.row.line-2 {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
}

/* Colonne gauche */
.select-strategy {
    width: 100%;
    margin-right: 1rem;
}

.input-max-exposure {
    width: 100%;
    padding: 0.3rem;
    border-radius: 4px;
    border: 1px solid #777;
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

/* Barre de progression */
.next-tp-recovery {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    /* Espace entre la barre et le texte */
}

.progress-bar {
    background-color: #eaeaea;
    /* Couleur de fond */
    width: 150px;
    /* Largeur fixe de la barre de progression */
    height: 10px;
    /* Hauteur de la barre */
    border-radius: 5px;
    /* Coins arrondis */
    overflow: hidden;
    position: relative;
}

.progress {
    background-color: #4caf50;
    /* Couleur de progression */
    height: 100%;
    /* Prend toute la hauteur de la barre */
    transition: width 0.3s ease;
    /* Transition fluide */
    position: absolute;
    top: 0;
    left: 0;
}

.tp-recovery {
    font-size: 1.4rem;
    font-weight: bold;
    color: #636963;
}

small {
    font-size: 0.8rem;
    color: #777;
}

/* Section des détails */
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

/* Amélioration du menu */
.menubar {
    display: flex;
    justify-content: space-around;
    background-color: #f4f4f4;
    padding: 0.5rem;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
