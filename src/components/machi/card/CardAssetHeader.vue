<!-- src/components/machi/card/CardAssetHeader.vue -->
<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Asset, Order, Trade } from '../../../types/responseData';
import { formatNumberWithDynamicPrecision, formatPrice } from '../../../js/utils/format';
import { calculateTakeProfitProgress } from '../../../js/utils/takeprofits';

// Props
const props = defineProps<{
    asset: Asset;
    orders: Order[];
    trades: Trade[];
}>();

const asset = props.asset;

const periods = computed(() =>
  [
    { period: '24h', value: asset.cmc?.cryptoPercentChange24h || 0 },
    { period: '7d', value: asset.cmc?.cryptoPercentChange7d || 0 },
    { period: '30d', value: asset.cmc?.cryptoPercentChange30d || 0 },
    { period: '60d', value: asset.cmc?.cryptoPercentChange60d || 0 },
    { period: '90d', value: asset.cmc?.cryptoPercentChange90d || 0 }
  ]
);

const formattedTotalBuy = computed(() => formatPrice(asset.orders.trade.totalBuy || 0));
const formattedTotalSell = computed(() => formatPrice(asset.orders.trade.totalSell || 0));

// Autres données réactives
const ass = reactive(props.asset);
const tpProgress = computed(() => calculateTakeProfitProgress(ass.strat.takeProfits, ass.liveData));

// State
const isDetailsVisible = ref(false);

// Events
const emit = defineEmits(['toggle-details']);

function toggleDetails() {
    isDetailsVisible.value = !isDetailsVisible.value;
    emit('toggle-details', isDetailsVisible.value);
}
</script>

<template>
    <div class="card-header">
        <div class="row line-1">
            <div class="item-details">
                <div class="item-icon-rank">
                    <img :src="asset.iconUrl" alt="Logo" class="logo" />
                    <div class="rank">#{{ asset.cmc.rank }}</div>
                </div>
                <div class="item-base-name">
                    <div class="base">{{ asset.base }}</div>
                    <div class="name">{{ asset.name }}</div>
                </div>

                <InfoLabelClick :label="`${asset.liveData.currentPrice}`" :periods="periods" />

                <div class="next-tp">
                    <!-- Icône de flèche verte vers le haut avec le prix du TP -->

                    <div class="next-tp-price"
                        v-tooltip.top="{ value: 'Next Tp Price', showDelay: 1000, hideDelay: 300 }">
                        <i class="pi pi-arrow-up-right green-icon logo" />
                        <small>
                            {{ formatNumberWithDynamicPrecision(asset.strat.takeProfits.tp1.price,
                                asset.liveData.currentPrice) }}
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
                            {{ formatPrice(asset.strat.takeProfits.tp1.price *
                                asset.strat.takeProfits.tp1.amount) }}$
                        </span>
                    </div>

                    <div class="next-tp-balance"
                        v-tooltip.top="{ value: 'Next Tp Amount', showDelay: 1000, hideDelay: 300 }">
                        <img :src="asset.iconUrl" alt="Logo" class="logo small-logo" />

                        <small>
                            {{ formatNumberWithDynamicPrecision(asset.strat.takeProfits.tp1.amount,
                                asset.liveData.balance) }}
                            ({{ (asset.strat.takeProfits.tp1.amount / asset.liveData.balance * 100).toFixed(2) }}%)
                        </small>
                    </div>
                </div>

                <div class="item-wallet">
                    <div class="wallet-possession">Wallet: {{ asset.liveData.currentPossession }}</div>
                    <div class="average-entry-price"
                        :class="{ positive: asset.liveData.currentPrice > Number(formattedTotalBuy), negative: asset.liveData.currentPrice < Number(formattedTotalBuy) }">
                        Avg. Entry: {{ asset.orders.trade.averageEntryPrice }}
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
</template>

<style scoped>
.card-header {
    display: grid;
    grid-template-columns: 1fr;
    background-color: #ddd;
    padding: 0.5rem;
}

.row.line-1 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

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

</style>
