<!-- src/components/shad/ShadDataTable.vue -->
<template>
    <DataTable class="mt-4 custom-data-table" :value="filteredItems" :rows="itemsPerPage" :dataKey="rowKey"
        :filters="filters" :pt="{
            bodyrow: ({ props }) => ({
                class: [{ 'bold-row': props.frozenRow }]
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
                <Column header="Total Amount Bought" field="totalAmount" :rowspan="2" sortable />
                <Column header="Balance" field="balance" :rowspan="2" sortable />
                <Column header="Wallet" field="currentPossession" :rowspan="2" sortable />
                <Column header="Profit" field="profit" :rowspan="2" sortable />
                <Column header="Open Orders" :colspan="2" />
                <Column header="Ratio" field="ratioShad" :rowspan="2" sortable />
                <Column header="Shad Recovery" field="recupShad" :rowspan="2" sortable />
                <Column header="% to next TP" field="percentToNextTp" sortable :rowspan="2" />
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
        <Column field="platform" class="platform-column" frozen alignFrozen="left"></Column>
        <Column field="currentPrice" frozen alignFrozen="left">
            <template #body="slotProps">
                <div class="current-price-container">
                    <!-- Main text centered -->
                    <div class="current-price-main-text">
                        {{ slotProps.data.currentPrice }}
                    </div>
                    <!-- Secondary text at bottom right -->
                    <div :class="{
                        'text-green': slotProps.data.cryptoPercentChange24h > 0,
                        'text-red': slotProps.data.cryptoPercentChange24h < 0
                    } + ' current-price-secondary-text'">
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
                        @change="applyStrategyToRow(localItems.value, slotProps.data, $event.target.value)">
                        <option value=""></option>
                        <option v-for="strategy in strategyLabels" :key="strategy" :value="strategy">{{ strategy }}
                        </option>
                    </select>

                    <!-- Input for maxExposition -->
                    <input type="text" v-model="slotProps.data.maxExposition"
                        @input="setMaxExposure(localItems, slotProps.data, $event.target.value)"
                        @blur="setMaxExposure(localItems, slotProps.data, $event.target.value)" />
                </div>
            </template>
        </Column>
        <Column field="status" class="status-column" frozen alignFrozen="left">
            <template #body="slotProps">
                <Tag :value="evaluateAssetStatus(slotProps.data).label"
                    :severity="evaluateAssetStatus(slotProps.data).severity" />
            </template>
        </Column>
        <Column field="totalShad"></Column>
        <Column field="rank"></Column>

        <Column field="averageEntryPrice">
            <template #body="slotProps">
                <div class="price-container">
                    <!-- Main text centered -->
                    <div class="main-text">
                        {{ slotProps.data.averageEntryPrice }}
                    </div>
                    <!-- Secondary text at bottom right -->
                    <div :class="{
                        'text-green': slotProps.data.percentageDifference > 0,
                        'text-red': slotProps.data.percentageDifference < 0
                    } + ' percentage-text'">
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
                    <!-- Check if currentPossession is defined and is a valid number -->
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
                    <!-- Check if profit is defined and is a valid number -->
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

        <Column :exportable="false" class="actions-column">
            <template #body="slotProps">
              <div class="actions-container">
                <Button icon="pi pi-pencil" outlined rounded class="action-button edit-button" @click="editProduct(slotProps.data)" />
                <Button icon="pi pi-trash" outlined rounded severity="danger" class="action-button delete-button" @click="confirmDeleteProduct(slotProps.data)" />
              </div>
            </template>
          </Column>
    </DataTable>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { evaluateAssetStatus, setMaxExposure, applyStrategyToRow } from '../../js/shad/shadUtils.js';
import { fetchTickers } from '../../js/fetchFromServer.js';
import { strategies } from '../../js/strategies.js';
import PercentageColumn from './PercentageColumn.vue';

/**
 * @constant
 */
const strategiesList = ref(strategies);
const itemsPerPage = ref(50);
const selectedPlatforms = ref([]);
const localItems = ref([]);
const localSelectedAssets = ref([]);

/**
 * @typedef {Object} Props
 * @property {Array} items
 * @property {Object} filters
 */

/**
 * @type {Props}
 */
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

/**
 * @type {function}
 */
const emit = defineEmits(['update:selectedAssets']);

/**
 * @type {import('vue').ComputedRef}
 */
const strategyLabels = computed(() => strategiesList.value.map(strategy => strategy.label));

/**
 * @type {import('vue').ComputedRef}
 */
const platformOptions = computed(() => [
    { id: 'binance', name: 'Binance' },
    { id: 'kucoin', name: 'KuCoin' },
    { id: 'htx', name: 'HTX' },
    { id: 'okx', name: 'OKX' },
    { id: 'gateio', name: 'Gate.io' }
]);

selectedPlatforms.value = platformOptions.value.map(platform => platform.id);

/**
 * @type {import('vue').ComputedRef}
 */
const computedFilters = computed(() => props.filters);

/**
 * @type {import('vue').ComputedRef}
 */
const filteredItems = computed(() => filterItems(localItems.value, computedFilters.value.global.value, selectedPlatforms.value));

watch(() => props.items, (newItems) => {
    localItems.value = newItems;
}, { immediate: true });

watch(() => props.selectedAssets, (selectedItem) => {
    console.log(`🚀 ~ file: ShadDataTable.vue:285 ~ watch ~ selectedItem:`, selectedItem);
    localSelectedAssets.value = selectedItem;
});

/**
 * @param {Array} items
 * @param {string} searchTerm
 * @param {Array} selectedPlatforms
 * @returns {Array}
 */
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

/**
 * @param {Array} selection
 */
function emitSelection(selection) {
    emit('update:selectedAssets', selection);
}

/**
 * @returns {void}
 */
function updateTickers() {
    fetchTickers().then(tickerData => {
        const platforms = new Set(localItems.value.map(item => item.platform));
        const filteredTickers = tickerData.filter(ticker => platforms.has(ticker.platform));

        const tickerDict = filteredTickers.reduce((dict, ticker) => {
            const key = `${ticker.platform}-${ticker.symbol}`;
            dict[key] = ticker;
            return dict;
        }, {});

        localItems.value.forEach(item => {
            const key = `${item.platform}-${item.asset}/USDT`;
            if (tickerDict[key]) {
                item.currentPrice = tickerDict[key].last;
            }
        });
    }).catch(error => {
        console.error('Error fetching tickers:', error);
    });
}

/**
 * @param {Object} rowData
 * @returns {string}
 */
const rowKey = (rowData) => `${rowData.asset}-${rowData.platform}`;

let tickerInterval;

onMounted(() => {
    tickerInterval = setInterval(updateTickers, 60000);
    updateTickers();
});

onUnmounted(() => {
    clearInterval(tickerInterval);
});
</script>

<style scoped>
.custom-data-table {
    min-width: 50rem;
}

.bold-row {
    font-weight: bold;
}

.platform-column {
    min-width: 5rem;
}

.status-column {
    min-width: 12rem;
}

.actions-column {
    min-width: 8rem;
  }

.price-container {
    position: relative;
    height: 50px;
    padding: 5px;
}

.main-text {
    text-align: center;
    font-size: 1rem;
    line-height: 20px;
}

.percentage-text {
    position: absolute;
    bottom: 2px;
    right: 5px;
    font-size: 0.8rem;
}

.current-price-container {
    position: relative;
    height: 50px;
    padding: 5px;
}

.current-price-main-text {
    text-align: center;
    font-size: 1rem;
    line-height: 20px;
}

.current-price-secondary-text {
    position: absolute;
    bottom: 2px;
    right: 5px;
    font-size: 0.8rem;
}

.text-green {
    color: #10b981;
}

.text-red {
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