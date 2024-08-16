<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <MySellButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length"
            :model="allRows" />
          <MyBuyButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length"
            :model="allRows" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
            :disabled="!selectedAssets || !selectedAssets.length" />
          <MultiSelect v-model="selectedExchanges" :options="exchangeOptions" optionLabel="name" optionValue="id"
            placeholder="Select Exchanges" class="ml-2" display="chip" :panelClass="'exchanges-multiselect-panel'">
            <template #item="slotProps">
              <Checkbox v-model="slotProps.checked" :label="slotProps.option.name" />
              <span>{{ slotProps.option.name }}</span>
            </template>
          </MultiSelect>
        </template>
        <template #end>
          <div class="flex justify-content-end">
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>
      </Toolbar>
      <DataTable class="mt-4" :value="filteredItems" :rows="itemsPerPage" :dataKey="rowKey" :filters="filters" :pt="{
            table: { style: 'min-width: 50rem' },
            bodyrow: ({ props }) => ({
              class: [{ 'font-bold': props.frozenRow }]
            })
          }" paginator stripedRows scrollable scroll-height="530px" v-model:selection="selectedAssets"
        selectionMode="multiple" dataKey="rank"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25, 100, 500]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
        <ColumnGroup type="header">
          <Row>
            <Column header="Icon" field="iconUrl" :rowspan="2" frozen alignFrozen="left" />
            <Column header="Asset" field="asset" :rowspan="2" :sortable="true" frozen alignFrozen="left" />
            <Column header="Exchange" field="exchangeId" :rowspan="2" sortable frozen alignFrozen="left" />
            <Column header="Current Price" field="currentPrice" frozen alignFrozen="left" :rowspan="2" sortable />
            <Column header="Status" field="status" :rowspan="2" sortable frozen alignFrozen="left" />
            <Column header="Total Shad" field="totalShad" :rowspan="2" sortable />
            <Column header="Rank" field="rank" :rowspan="2" sortable />
            <Column header="Average Entry Price" field="averageEntryPrice" :rowspan="2" sortable />
            <Column header="Total Buy" field="totalBuy" :rowspan="2" sortable />
            <Column header="Total Sell" field="totalSell" :rowspan="2" sortable />
            <Column header="Quantite total achetee" field="totalAmount" :rowspan="2" sortable />
            <Column header="Balance" field="balance" :rowspan="2" sortable />
            <Column header="Max wanted" field="maxExposition" :rowspan="2" sortable />
            <Column header="Percentage Difference" field="percentageDifference" :rowspan="2" sortable />
            <Column header="Wallet" field="currentPossession" :rowspan="2" sortable />
            <Column header="Profit" field="profit" :rowspan="2" sortable />
            <Column header="Open Orders" :colspan="2" />
            <Column header="Strategy" field="strat" :rowspan="2" sortable />
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
        <Column field="exchangeId" style="min-width: 5rem" frozen alignFrozen="left"></Column>
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
                24h ({{ (100 * slotProps.data.percentageDifference).toFixed(2) }}%)
              </div>
            </div>
          </template>
        </Column>

        <Column field="totalBuy"></Column>
        <Column field="totalSell"></Column>
        <Column field="totalAmount"></Column>
        <Column field="balance"></Column>
        <Column field="maxExposition">
          <template #body="slotProps">
            <input type="text" v-model="slotProps.data.maxExposition"
              @input="updateMaxWanted(slotProps.data, $event.target.value)"
              @blur="updateMaxWanted(slotProps.data, $event.target.value)" />
          </template>
        </Column>

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
        <Column field="strat">
          <template #body="slotProps">
            <select v-model="slotProps.data.strat"
              @change="updateRowByStratChange(slotProps.data, $event.target.value)">
              <option value=""></option>
              <option v-for=" strategy  in  strategyLabels " :key="strategy" :value="strategy">{{ strategy }}
              </option>
            </select>
          </template>
        </Column>
        <Column field="ratioShad"></Column>
        <Column field="recupShad"></Column>
        <Column field="percentToNextTp">
          <template #body="slotProps">
            <span :class="{
            'text-green-500': slotProps.data.percentToNextTp > 0,
            'text-red-500': slotProps.data.percentToNextTp < 0
          }
            ">
              {{ (100 * slotProps.data.percentToNextTp).toFixed(2) }}%
            </span>
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
            <span :class="{
            'text-green-500': slotProps.data.cryptoPercentChange24h > 0,
            'text-red-500': slotProps.data.cryptoPercentChange24h < 0
          }
            ">
              {{ (100 * slotProps.data.cryptoPercentChange24h).toFixed(2) }}%
            </span>
          </template>
        </Column>
        <Column field="cryptoPercentChange7d">
          <template #body="slotProps">
            <span :class="{
            'text-green-500': slotProps.data.cryptoPercentChange7d > 0,
            'text-red-500': slotProps.data.cryptoPercentChange7d < 0
          }
            ">
              {{ (100 * slotProps.data.cryptoPercentChange7d).toFixed(2) }}%
            </span>
          </template>
        </Column>
        <Column field="cryptoPercentChange30d">
          <template #body="slotProps">
            <span :class="{
            'text-green-500': slotProps.data.cryptoPercentChange30d > 0,
            'text-red-500': slotProps.data.cryptoPercentChange30d < 0
          }
            ">
              {{ (100 * slotProps.data.cryptoPercentChange30d).toFixed(2) }}%
            </span>
          </template>
        </Column>
        <Column field="cryptoPercentChange60d">
          <template #body="slotProps">
            <span :class="{
            'text-green-500': slotProps.data.cryptoPercentChange60d > 0,
            'text-red-500': slotProps.data.cryptoPercentChange60d < 0
          }
            ">
              {{ (100 * slotProps.data.cryptoPercentChange60d).toFixed(2) }}%
            </span>
          </template>
        </Column>
        <Column field="cryptoPercentChange90d">
          <template #body="slotProps">
            <span :class="{
            'text-green-500': slotProps.data.cryptoPercentChange90d > 0,
            'text-red-500': slotProps.data.cryptoPercentChange90d < 0
          }
            ">
              {{ (100 * slotProps.data.cryptoPercentChange90d).toFixed(2) }}%
            </span>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { FilterMatchMode } from 'primevue/api'
import MySellButton from './buttons/MySellButton.vue'
import MyBuyButton from './buttons/MyBuyButton.vue'
import { strategies } from '../js/strategies.js'

import {
  FETCH_SHAD, GET_SHAD
} from '../store/storeconstants';

const store = useStore();
const strategiesList = ref(strategies);

const selectedAssets = ref([]);
const shad = ref([]);

const itemsPerPage = ref(50);
const showOverlay = ref(false);
const selectedAsset = ref();
const allRows = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const BINANCE_EXCHANGE_ID = 'binance';
const BINANCE_THRESHOLD = 3; // 300%

const HTX_EXCHANGE_ID = 'htx';
const HTX_THRESHOLD = 3; // 300%

const exchangeOptions = computed(() => {
  return [
    { id: 'binance', name: 'Binance' },
    { id: 'kucoin', name: 'KuCoin' },
    { id: 'htx', name: 'HTX' },
    { id: 'okx', name: 'OKX' },
    { id: 'gateio', name: 'Gate.io' }
  ];
});

const performanceOptions = ref([24, 7, 30, 60, 90]);

function selectPerformance(data) {
  // Handle performance selection logic
  const newPerformance = prompt("Select Performance: 24, 7, 30, 60, 90 (days)");
  if (performanceOptions.value.includes(parseInt(newPerformance))) {
    data.selectedPerformance = parseInt(newPerformance);
  }
}

const selectedExchanges = ref(exchangeOptions.value.map(exchange => exchange.id));

const strategyLabels = computed(() => strategiesList.value.map(strategy => strategy.label));

const items = computed(() => {
  return shad.value && shad.value.length > 0 ? shad.value : [];
});

// Computed property to get filtered items
const filteredItems = computed(() => {
  if (!filters.value.global.value && selectedExchanges.value.length === 0) {
    return items.value;
  }

  const searchTerm = filters.value.global.value?.toLowerCase() || '';

  return items.value.filter(item => {
    console.log(`🚀 ~ file: Shad.vue:357 ~ filteredItems ~ item:`, item)

    const matchesExchange = selectedExchanges.value.length === 0 || selectedExchanges.value.includes(item.exchangeId);
    console.log(`🚀 ~ file: Shad.vue:360 ~ filteredItems ~ matchesExchange:`, matchesExchange)
    const matchesSearch = Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm));
    console.log(`🚀 ~ file: Shad.vue:362 ~ filteredItems ~ matchesSearch:`, matchesSearch)

    return matchesExchange && matchesSearch;
  });
});

// Génération d'une clé unique par ligne
const rowKey = (rowData) => {
  return `${rowData.asset}-${rowData.exchangeId}`;
};

onMounted(async () => {
  try {
    await store.dispatch('calcul/' + FETCH_SHAD);
    shad.value = await store.getters['calcul/' + GET_SHAD];
    console.log("Données Shad récupérées:", shad.value);  // Ajoutez ceci pour vérifier les données récupérées
  } catch (e) {
    console.error("Une erreur s'est produite lors de la récupération des données :", e);
  }
});

const confirmDeleteSelected = () => {
  deleteProductsDialog.value = true;
};

function getStatus(data) {
  const currentPrice = data.currentPrice;
  const exchangeId = data.exchangeId;

  if (data.status === 'stable coin') {
    return { severity: 'secondary', label: 'stable coin' };
  }

  if (Array.isArray(data.status)) {
    const nb5 = data.status.reduce((acc, val) => acc + val, 0);

    if (data.nbOpenSellOrders === 0) {
      return { severity: 'danger', label: "Pas d'ordres ouverts" };
    } else if (currentPrice > data.priceTp1) {
      if (data.priceTp1 < data.priceTp2)
        return { severity: 'info', label: 'Tu peux vendre depuis un moment' };
      else
        return { severity: 'danger', label: 'tp2 < tp1' };
    } else {
      if (nb5 === 5) {
        return { severity: 'success', label: '5 ordres placés' };
      } else {
        if (exchangeId === BINANCE_EXCHANGE_ID || exchangeId === HTX_EXCHANGE_ID) {
          const exchangeThreshold = exchangeId === BINANCE_EXCHANGE_ID ? BINANCE_THRESHOLD : HTX_THRESHOLD;
          const priceThreshold = calculatePriceThreshold(currentPrice, exchangeThreshold);

          for (let i = 0; i < 5; i++) {
            if (data.status[i] === 0) {
              if (priceThreshold < data[`priceTp${i + 1}`]) {
                return { severity: 'success', label: 'Max ordres placés' };
              } else {
                return { severity: 'warning', label: `L'ordre ${i + 1} peut être placé ` };
              }
            }
          }
        } else {
          const consecutivePairs = countConsecutivePairs(data.status);

          switch (consecutivePairs) {
            case 0:
              return { severity: 'warning', label: 'Aucune correspondance' };
            case 1:
              return { severity: 'info', label: '1 correspondance' };
            case 2:
            case 3:
            case 4:
              return { severity: 'success', label: `${consecutivePairs} correspondances` };
          }
        }
      }
    }
  } else {
    console.warn('data.status is not an array:', data.status);
    return { severity: 'warning', label: `STATUS ERROR` };
  }
}

function calculatePriceThreshold(currentPrice, threshold) {
  return currentPrice * threshold;
}

function countConsecutivePairs(status) {
  let consecutivePairs = 0;
  for (let i = 0; i < status.length; i++) {
    if (status[i] === 1) {
      consecutivePairs++;
    } else {
      break;
    }
  }
  return consecutivePairs;
}

function updateRowByStratChange(data, assetStrat) {
  const rowIndex = items.value.findIndex((item) => item.asset === data.asset);
  const row = items.value[rowIndex];

  if (rowIndex !== -1) {
    const updatedItem = { ...row, assetStrat };
    items.value.splice(rowIndex, 1, updatedItem);
  }
}

function updateMaxWanted(data, newValue) {
  if (isNaN(newValue) || newValue < 0) {
    console.warn('Invalid maxExposition value:', newValue);
    return;
  }

  const rowIndex = items.value.findIndex((item) => item.asset === data.asset);
  const row = items.value[rowIndex];

  if (rowIndex !== -1) {
    const updatedItem = { ...row, maxExposition: newValue };
    items.value.splice(rowIndex, 1, updatedItem);
  }
}
</script>

<style scoped>
html {
  font-size: 14px;
}

body {
  font-family: var(--font-family);
  font-weight: normal;
  background: var(--surface-ground);
  color: var(--text-color);
  padding: 1rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

p {
  line-height: 1.75;
}

.icon-32 {
  width: 32px;
  height: 32px;
}

.text-green-500 {
  color: #10b981;
}

.text-red-500 {
  color: #ef4444;
}

.exchanges-multiselect-panel {
  min-width: 200px;
}
</style>
