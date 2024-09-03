<!-- src/components/shad/ShadDataTable.vue -->
<template>
    <DataTable class="mt-4" :value="filteredItems" :rows="itemsPerPage" :dataKey="rowKey" :filters="filters" :pt="{
        table: { style: 'min-width: 50rem' },
        bodyrow: ({ props }) => ({
            class: [{ 'font-bold': props.frozenRow }]
        })
    }" paginator stripedRows scrollable scroll-height="530px" v-model:selection="localSelectedAssets"
        @update:selection="emitSelection" selectionMode="multiple" dataKey="rank"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25, 100, 500]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">

        <ColumnGroup type="header">
            <Row>
                <Column header="Icon" field="iconUrl" :rowspan="2" frozen alignFrozen="left" />
                <Column header="Asset" field="asset" :rowspan="2" :sortable="true" frozen alignFrozen="left" />
                <Column header="Platform" field="platform" :rowspan="2" sortable frozen alignFrozen="left" />
                <Column header="Current Price" field="currentPrice" frozen alignFrozen="left" :rowspan="2" sortable />
                <Column header="Strat" frozen alignFrozen="left" :rowspan="2" sortable />
                <Column header="Status" field="status" :rowspan="2" sortable frozen alignFrozen="left" />
                <Column header="Total Shad" field="totalShad" :rowspan="2" sortable />
                <Column header="Rank" field="rank" :rowspan="2" sortable />
                <Column header="Average Entry Price" field="averageEntryPrice" :rowspan="2" sortable />
                <Column header="Total Buy" field="totalBuy" :rowspan="2" sortable />
                <Column header="Total Sell" field="totalSell" :rowspan="2" sortable />
                <Column header="Quantite total achetee" field="totalAmount" :rowspan="2" sortable />
                <Column header="Balance" field="balance" :rowspan="2" sortable />
                <Column header="Wallet" field="currentPossession" :rowspan="2" sortable />
                <Column header="Profit" field="profit" :rowspan="2" sortable />
                <Column header="Open Orders" :colspan="2" />
                <Column header="Ratio" field="ratioShad" :rowspan="2" sortable />
                <Column header="Recup Shad" field="recupShad" :rowspan="2" sortable />
                <Column header="% next TP" field="percentToNextTp" sortable :rowspan="2" />
                <Column header="Take Profit" :colspan="2" />
                <Column header="TP1" :colspan="2" />
                <Column header="TP2" :colspan="2" />
                <Column header="TP3" :colspan="2" />
                <Column header="TP4" :colspan="2" />
                <Column header="TP5" :colspan="2" />
                <Column header="Performance" :colspan="5" />
            </Row>
            <Row>
                <Column header="Buy" field="nbOpenBuyOrders" sortable />
                <Column header="Sell" field="nbOpenSellOrders" sortable />
                <Column header="tp1" field="recupTp1" sortable />
                <Column header="tpX" field="recupTpX" sortable />
                <Column header="amount" field="amountTp1" sortable />
                <Column header="price" field="priceTp1" sortable />
                <Column header="amount" field="amountTp2" sortable />
                <Column header="price" field="priceTp2" sortable />
                <Column header="amount" field="amountTp3" sortable />
                <Column header="price" field="priceTp3" sortable />
                <Column header="amount" field="amountTp4" sortable />
                <Column header="price" field="priceTp4" sortable />
                <Column header="amount" field="amountTp5" sortable />
                <Column header="price" field="priceTp5" sortable />
                <Column header="24h" field="cryptoPercentChange24h" sortable />
                <Column header="7d" field="cryptoPercentChange7d" sortable />
                <Column header="30d" field="cryptoPercentChange30d" sortable />
                <Column header="60d" field="cryptoPercentChange60d" sortable />
                <Column header="90d" field="cryptoPercentChange90d" sortable />
            </Row>
        </ColumnGroup>

        <Column field="iconUrl" frozen alignFrozen="left">
            <template #body="slotProps">
                <img :src="slotProps.data.iconUrl" :alt="slotProps.data.asset" class="border-round icon-32" />
            </template>
        </Column>
        <Column field="asset" frozen alignFrozen="left"></Column>
        <Column field="platform" style="min-width: 5rem" frozen alignFrozen="left"></Column>
        <Column field="currentPrice" frozen alignFrozen="left">
            <template #body="slotProps">
                <div style="position: relative; height: 50px; padding: 5px;">
                    <!-- Texte principal centré -->
                    <div style="text-align: center; font-size: 1rem; line-height: 20px;">
                        {{ slotProps.data.currentPrice }}
                    </div>
                    <!-- Texte secondaire en bas à droite -->
                    <div :class="{
        'text-green-500': slotProps.data.cryptoPercentChange24h > 0,
        'text-red-500': slotProps.data.cryptoPercentChange24h < 0
    }
        " style="position: absolute; bottom: 2px; right: 5px; font-size: 0.8rem;">
                        {{ (100 * slotProps.data.cryptoPercentChange24h).toFixed(2) }}%
                    </div>
                </div>
            </template>
        </Column>
        <Column field="stratColumn" sortable frozen alignFrozen="left">
            <template #body="slotProps">
                <div>
                    <!-- Dropdown for strat -->
                    <select v-model="slotProps.data.strat"
                        @change="updateRowByStratChange(localItems.value, slotProps.data, $event.target.value)">
                        <option value=""></option>
                        <option v-for="strategy in strategyLabels" :key="strategy" :value="strategy">{{ strategy }}
                        </option>
                    </select>

                    <!-- Input for maxExposition -->
                    <input type="text" v-model="slotProps.data.maxExposition"
                        @input="updateMaxExposition(localItems, slotProps.data, $event.target.value)"
                        @blur="updateMaxExposition(localItems, slotProps.data, $event.target.value)" />
                </div>
            </template>
        </Column>
        <Column field="status" style="min-width: 12rem" frozen alignFrozen="left">
            <template #body="slotProps">
                <Tag :value="getStatus(slotProps.data).label" :severity="getStatus(slotProps.data).severity" />
            </template>
        </Column>
        <Column field="totalShad"></Column>
        <Column field="rank"></Column>

        <Column field="averageEntryPrice">
            <template #body="slotProps">
                <div style="position: relative; height: 50px; padding: 5px;">
                    <!-- Texte principal centré -->
                    <div style="text-align: center; font-size: 1rem; line-height: 20px;">
                        {{ slotProps.data.averageEntryPrice }}
                    </div>
                    <!-- Texte secondaire en bas à droite -->
                    <div :class="{
        'text-green-500': slotProps.data.percentageDifference > 0,
        'text-red-500': slotProps.data.percentageDifference < 0
    }
        " style="position: absolute; bottom: 2px; right: 5px; font-size: 0.8rem;">
                        {{ (100 * slotProps.data.percentageDifference).toFixed(2) }}%
                    </div>
                </div>
            </template>
        </Column>

        <Column field="totalBuy"></Column>
        <Column field="totalSell"></Column>
        <Column field="totalAmount"></Column>
        <Column field="balance"></Column>

        <Column field="currentPossession" sortable>
            <template #body="slotProps">
                <span>
                    <!-- Vérification si currentPossession est défini et est un nombre valide -->
                    {{
        typeof slotProps.data.currentPossession === 'number'
            ? slotProps.data.currentPossession.toFixed(2) + '$'
            : 'N/A'
    }}
                </span>
            </template>
        </Column>

        <Column field="profit" sortable>
            <template #body="slotProps">
                <span>
                    <!-- Vérification si profit est défini et est un nombre valide -->
                    {{
        typeof slotProps.data.profit === 'number'
            ? slotProps.data.profit.toFixed(2) + '$'
            : 'N/A'
    }}
                </span>
            </template>
        </Column>
        <Column field="nbOpenBuyOrders"></Column>
        <Column field="nbOpenSellOrders"></Column>
        <Column field="ratioShad"></Column>
        <Column field="recupShad"></Column>
        <Column field="percentToNextTp">
            <template #body="slotProps">
                <PercentageColumn :percentage="slotProps.data.percentToNextTp" />
            </template>
        </Column>
        <Column field="recupTp1"></Column>
        <Column field="recupTpX"></Column>
        <Column field="amountTp1"></Column>
        <Column field="priceTp1"></Column>
        <Column field="amountTp2"></Column>
        <Column field="priceTp2"></Column>
        <Column field="amountTp3"></Column>
        <Column field="priceTp3"></Column>
        <Column field="amountTp4"></Column>
        <Column field="priceTp4"></Column>
        <Column field="amountTp5"></Column>
        <Column field="priceTp5"></Column>
        <Column field="cryptoPercentChange24h">
            <template #body="slotProps">
                <PercentageColumn :percentage="slotProps.data.cryptoPercentChange24h" />
            </template>
        </Column>
        <Column field="cryptoPercentChange7d">
            <template #body="slotProps">
                <PercentageColumn :percentage="slotProps.data.cryptoPercentChange7d" />
            </template>
        </Column>
        <Column field="cryptoPercentChange30d">
            <template #body="slotProps">
                <PercentageColumn :percentage="slotProps.data.cryptoPercentChange30d" />
            </template>
        </Column>
        <Column field="cryptoPercentChange60d">
            <template #body="slotProps">
                <PercentageColumn :percentage="slotProps.data.cryptoPercentChange60d" />
            </template>
        </Column>
        <Column field="cryptoPercentChange90d">
            <template #body="slotProps">
                <PercentageColumn :percentage="slotProps.data.cryptoPercentChange90d" />
            </template>
        </Column>

        <Column :exportable="false" style="min-width: 8rem">
            <template #body="slotProps">
                <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
                <Button icon="pi pi-trash" outlined rounded severity="danger"
                    @click="confirmDeleteProduct(slotProps.data)" />
            </template>
        </Column>
    </DataTable>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { getStatus, updateMaxExposition, updateRowByStratChange } from '../../js/shad/shadUtils.js';
import { fetchTickers } from '../../js/fetchFromServer.js';
import { strategies } from '../../js/strategies.js';
import PercentageColumn from './PercentageColumn.vue';

/* =============================
   Définition des constantes et refs
   ============================= */
const strategiesList = ref(strategies);
const itemsPerPage = ref(50);  // Nombre d'éléments par page
const selectedPlatforms = ref([]);  // Plateformes sélectionnées pour filtrage
const localItems = ref([]);  // Éléments locaux modifiables par l'utilisateur
const localSelectedAssets = ref([]);  // Sélection locale d'actifs

/* ============================
   Définition des props et des émetteurs
   ============================ */
const props = defineProps({
    items: {
        type: Array,
        required: true,
    },
    filters: {
        type: Object,
        default: () => ({
            global: { value: null, matchMode: null }
        })
    }
});

const emit = defineEmits(['update:selectedAssets']);

/* ============================
   Déclaration des propriétés calculées
   ============================ */
const strategyLabels = computed(() => strategiesList.value.map(strategy => strategy.label));

const platformOptions = computed(() => [
    { id: 'binance', name: 'Binance' },
    { id: 'kucoin', name: 'KuCoin' },
    { id: 'htx', name: 'HTX' },
    { id: 'okx', name: 'OKX' },
    { id: 'gateio', name: 'Gate.io' }
]);

// Plateformes sélectionnées par défaut
selectedPlatforms.value = platformOptions.value.map(platform => platform.id);

// Filtrage dynamique des éléments en fonction des filtres et des plateformes
const computedFilters = computed(() => props.filters);
const filteredItems = computed(() => filterItems(localItems.value, computedFilters.value.global.value, selectedPlatforms.value));

/* ============================
   Surveillance des changements
   ============================ */
watch(() => props.items, (newItems) => {
    localItems.value = newItems;  // Mise à jour des éléments locaux lors des changements
}, { immediate: true });

watch(() => props.selectedAssets, (selectedItem) => {
    console.log(`🚀 ~ file: ShadDataTable.vue:285 ~ watch ~ selectedItem:`, selectedItem);
    localSelectedAssets.value = selectedItem;
});

/* ============================
   Fonctions de logique
   ============================ */
// Filtrage des éléments en fonction des termes de recherche et des plateformes
function filterItems(items, searchTerm, selectedPlatforms) {
    if (!searchTerm && selectedPlatforms.length === platformOptions.value.length) {
        return items;
    }

    searchTerm = searchTerm?.toLowerCase() || '';

    return items.filter(item => {
        const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.includes(item.platform);
        const matchesSearch = Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm));

        return matchesPlatform && matchesSearch;
    });
}

// Fonction pour émettre une sélection d'actifs mise à jour
function emitSelection(selection) {
    emit('update:selectedAssets', selection);
}

// Mise à jour régulière des données des tickers
function updateTickers() {
    fetchTickers().then(tickerData => {
        const platforms = new Set(localItems.value.map(item => item.platform));
        const filteredTickers = tickerData.filter(ticker => platforms.has(ticker.platform));

        // Dictionnaire pour des recherches rapides
        const tickerDict = {};
        filteredTickers.forEach(ticker => {
            const key = `${ticker.platform}-${ticker.symbol}`;
            tickerDict[key] = ticker;
        });

        // Mise à jour des éléments locaux
        localItems.value.forEach(item => {
            const key = `${item.platform}-${item.asset}/USDT`;  // Assumant le format 'ASSET/USDT'
            if (tickerDict[key]) {
                item.currentPrice = tickerDict[key].last;
            }
        });
    }).catch(error => {
        console.error('Error fetching tickers:', error);
    });
}

// Clé de ligne unique pour chaque ligne de données
const rowKey = (rowData) => `${rowData.asset}-${rowData.platform}`;

/* ============================
   Gestion du cycle de vie du composant
   ============================ */
let tickerInterval;

onMounted(() => {
    tickerInterval = setInterval(updateTickers, 60000);  // Rafraîchissement toutes les 120 secondes
    updateTickers();  // Initialisation immédiate
});

onUnmounted(() => {
    clearInterval(tickerInterval);  // Nettoyage lors de la destruction du composant
});
</script>



<style scoped>
.text-green-500 {
    color: #10b981;
}

.text-red-500 {
    color: #ef4444;
}

.icon-32 {
    width: 32px;
    height: 32px;
}

.p-datatable-frozen-view .p-datatable-thead th,
.p-datatable-frozen-view .p-datatable-tbody td {
    z-index: 1;
}
</style>