<!-- src/components/Shad.vue -->
<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <MySellButton
            label="Add Sell Orders"
            icon="pi pi-cart-plus"
            severity="info"
            class="mr-2"
            :disabled="!selectedAssets || !selectedAssets.length"
            :model="allRows"
          />

          <Button
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            @click="confirmDeleteSelected"
            :disabled="!selectedAssets || !selectedAssets.length"
          />
        </template>

        <template #end>
          <FileUpload
            mode="basic"
            accept="image/*"
            :maxFileSize="1000000"
            label="Import"
            chooseLabel="Import"
            class="mr-2 inline-block"
          />
          <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
        </template>
      </Toolbar>

      <DataTable
        :value="items"
        :rows="itemsPerPage"
        :filters="filters"
        :pt="{
          table: { style: 'min-width: 50rem' },
          bodyrow: ({ props }) => ({
            class: [{ 'font-bold': props.frozenRow }]
          })
        }"
        paginator
        stripedRows
        v-model:selection="selectedAssets"
        selectionMode="multiple"
        dataKey="id"
        scrollable
        scrollHeight="500px"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25, 100, 500]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
      >
        <template #header>
          <div class="flex justify-content-end">
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>

        <ColumnGroup type="header">
          <Row>
            <!--<Column selectionMode="multiple" style="width: 3rem" exportable="false" rowspan="2" />-->
            <Column header="Icon" field="iconUrl" :rowspan="2"  />
            <Column header="Asset" field="asset" :rowspan="2" :sortable="true" />
            <Column header="Exchange" field="exchangeId" :rowspan="2" sortable style="min-width: 12rem"  />
            <Column header="Status" field="status" :rowspan="2" sortable />
            <Column header="Strategy"  field="strat" :rowspan="2" sortable />
            <Column header="Ratio"  field="ratioShad"  :rowspan="2" sortable />
            <Column header="Total Shad" field="totalShad"  :rowspan="2" sortable />
            <Column header="Rank"  field="rank" :rowspan="2" sortable />
            <Column header="Average Entry Price"  field="averageEntryPrice" :rowspan="2" sortable />
            <Column header="Total Buy"  field="totalBuy" :rowspan="2" sortable />
            <Column header="Max wanted" field="maxExposition"  :rowspan="2" sortable />
            <Column header="Percentage Difference" field="percentageDifference" :rowspan="2" sortable />
            <Column header="Current Price" field="currentPrice" :rowspan="2" sortable />
            <Column header="Wallet" field="currentPossession" :rowspan="2" sortable />
            <Column header="Profit" field="profit" :rowspan="2" sortable />
            <Column header="Total Sell" field="totalSell" :rowspan="2" sortable />
            <Column header="Recup Shad" field="recupShad" :rowspan="2" sortable />
            <Column header="Open Orders" :colspan="2" />
            <Column header="Quantite total achetee" field="totalAmount" :rowspan="2" sortable />
            <Column header="Balance"  field="balance" :rowspan="2" sortable />
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

        <!-- <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column> -->
        <Column field="iconUrl">
          <template #body="slotProps">
            <img
              :src="slotProps.data.iconUrl"
              :alt="slotProps.data.asset"
              class="border-round icon-32"
            />
          </template>
        </Column>
        <Column field="asset"></Column>
        <Column field="exchangeId" style="min-width: 12rem"></Column>
        <Column field="status" style="min-width: 12rem">
          <template #body="slotProps">
            <Tag
              :value="getStatusLabel(slotProps.data)"
              :severity="getStatusSeverity(slotProps.data)"
            />
          </template>
        </Column>
        <Column field="strat"></Column>
        <Column field="ratioShad"></Column>
        <Column field="totalShad"></Column>
        <Column field="rank"></Column>
        <Column field="averageEntryPrice"></Column>
        <Column field="totalBuy"></Column>
        <Column field="maxExposition"></Column>
        <Column field="percentageDifference">
          <template #body="slotProps">
            <span
              :class="{
                'text-green-500': slotProps.data.percentageDifference > 0,
                'text-red-500': slotProps.data.percentageDifference < 0
              }"
            >
              {{ (100 * slotProps.data.percentageDifference).toFixed(2) }}%
            </span>
          </template>
        </Column>
        <Column field="currentPrice"></Column>
        <Column field="currentPossession">
          <template #body="slotProps">
            <span> {{ slotProps.data.currentPossession }}$ </span>
          </template>
        </Column>
        <Column field="profit">
          <template #body="slotProps">
            <span
              :class="{
                'text-green-500': slotProps.data.profit > 0,
                'text-red-500': slotProps.data.profit < 0
              }"
            >
              {{ slotProps.data.profit }}$
            </span>
          </template>
        </Column>
        <Column field="totalSell"></Column>
        <Column field="recupShad"></Column>
        <Column field="nbOpenBuyOrders"></Column>
        <Column field="nbOpenSellOrders"></Column>
        <Column field="totalAmount"></Column>
        <Column field="balance"></Column>
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

        <Column field="cryptoPercentChange24h" >
          <template #body="slotProps">
            <span
              :class="{
                'text-green-500': slotProps.data.cryptoPercentChange24h > 0,
                'text-red-500': slotProps.data.cryptoPercentChange24h < 0
              }"
            >
              {{ (100 * slotProps.data.cryptoPercentChange24h).toFixed(2) }}%
            </span>
          </template>
        </Column>
        <Column field="cryptoPercentChange7d" >
          <template #body="slotProps">
            <span
              :class="{
                'text-green-500': slotProps.data.cryptoPercentChange7d > 0,
                'text-red-500': slotProps.data.cryptoPercentChange7d < 0
              }"
            >
              {{ (100 * slotProps.data.cryptoPercentChange7d).toFixed(2) }}%
            </span>
          </template>
        </Column>
        <Column field="cryptoPercentChange30d" >
          <template #body="slotProps">
            <span
              :class="{
                'text-green-500': slotProps.data.cryptoPercentChange30d > 0,
                'text-red-500': slotProps.data.cryptoPercentChange30d < 0
              }"
            >
              {{ (100 * slotProps.data.cryptoPercentChange30d).toFixed(2) }}%
            </span>
          </template>
        </Column>
        <Column field="cryptoPercentChange60d" >
          <template #body="slotProps">
            <span
              :class="{
                'text-green-500': slotProps.data.cryptoPercentChange60d > 0,
                'text-red-500': slotProps.data.cryptoPercentChange60d < 0
              }"
            >
              {{ (100 * slotProps.data.cryptoPercentChange60d).toFixed(2) }}%
            </span>
          </template>
        </Column>
        <Column field="cryptoPercentChange90d" >
          <template #body="slotProps">
            <span
              :class="{
                'text-green-500': slotProps.data.cryptoPercentChange90d > 0,
                'text-red-500': slotProps.data.cryptoPercentChange90d < 0
              }"
            >
              {{ (100 * slotProps.data.cryptoPercentChange90d).toFixed(2) }}%
            </span>
          </template>
        </Column>

        <Column :exportable="false" style="min-width: 8rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="editProduct(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteProduct(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
    <!--
    <Dialog
      v-model:visible="productDialog"
      :style="{ width: '450px' }"
      header="Product Details"
      :modal="true"
      class="p-fluid"
    >
      <img
        v-if="product.image"
        :src="`https://primefaces.org/cdn/primevue/images/product/${product.image}`"
        :alt="product.image"
        class="block m-auto pb-3"
      />
      <div class="field">
        <label for="name">Name</label>
        <InputText
          id="name"
          v-model.trim="product.name"
          required="true"
          autofocus
          :class="{ 'p-invalid': submitted && !product.name }"
        />
        <small class="p-error" v-if="submitted && !product.name">Name is required.</small>
      </div>
      <div class="field">
        <label for="description">Description</label>
        <Textarea
          id="description"
          v-model="product.description"
          required="true"
          rows="3"
          cols="20"
        />
      </div>

      <div class="field">
        <label for="status" class="mb-3">Inventory Status</label>
        <Dropdown
          id="status"
          v-model="product.status"
          :options="statuses"
          optionLabel="label"
          placeholder="Select a Status"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value && slotProps.value.value">
              <Tag
                :value="slotProps.value.value"
                :severity="getStatusLabel(slotProps.value.label)"
              />
            </div>
            <div v-else-if="slotProps.value && !slotProps.value.value">
              <Tag :value="slotProps.value" :severity="getStatusLabel(slotProps.value)" />
            </div>
            <span v-else>
              {{ slotProps.placeholder }}
            </span>
          </template>
        </Dropdown>
      </div>

      <div class="field">
        <label class="mb-3">Category</label>
        <div class="formgrid grid">
          <div class="field-radiobutton col-6">
            <RadioButton
              id="category1"
              name="category"
              value="Accessories"
              v-model="product.category"
            />
            <label for="category1">Accessories</label>
          </div>
          <div class="field-radiobutton col-6">
            <RadioButton
              id="category2"
              name="category"
              value="Clothing"
              v-model="product.category"
            />
            <label for="category2">Clothing</label>
          </div>
          <div class="field-radiobutton col-6">
            <RadioButton
              id="category3"
              name="category"
              value="Electronics"
              v-model="product.category"
            />
            <label for="category3">Electronics</label>
          </div>
          <div class="field-radiobutton col-6">
            <RadioButton
              id="category4"
              name="category"
              value="Fitness"
              v-model="product.category"
            />
            <label for="category4">Fitness</label>
          </div>
        </div>
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label for="price">Price</label>
          <InputNumber
            id="price"
            v-model="product.price"
            mode="currency"
            currency="USD"
            locale="en-US"
          />
        </div>
        <div class="field col">
          <label for="quantity">Quantity</label>
          <InputNumber id="quantity" v-model="product.quantity" integeronly />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" text @click="saveProduct" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteProductDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="product"
          >Are you sure you want to delete <b>{{ product.name }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteProduct" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteProductsDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="product">Are you sure you want to delete the selected products?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
      </template>
    </Dialog>
  
    <Dialog
      v-model:visible="addSellOrdersDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="product">Voulez vous placer vos ordres d'achat?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="addSellOrdersDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
      </template>
    </Dialog>
    -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { FilterMatchMode } from 'primevue/api'
//import { useToast } from 'primevue/usetoast'
//import { ProductService } from '@/service/ProductService'

import { getCmc, getBalances, getTrades, getOrders, getStrategy } from '../js/getter.js'
import { getAllCalculs } from '../js/calcul.js'
import MySellButton from './MySellButton.vue'
//import Overlay from './ShadOverlay.vue'

const balances = ref([])
const trades = ref([])
const strats = ref([])
const orders = ref([])
const cmc = ref([])
const buyOrders = ref([])
const sellOrders = ref([])
const itemsPerPage = ref(10)
const showOverlay = ref(false)
const selectedAsset = ref()
const allRows = ref()
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const BINANCE_EXCHANGE_ID = 'binance'
const BINANCE_THRESHOLD = 3 // 300%

const getData = async () => {
  console.log('getData')

  try {
    balances.value = await getBalances()
    trades.value = await getTrades()
    strats.value = await getStrategy()
    cmc.value = await getCmc()
    orders.value = await getOrders()

    buyOrders.value = orders.value.filter((order) => order.side === 'buy')
    sellOrders.value = orders.value.filter((order) => order.side === 'sell')
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error)
    // Affichez un message d'erreur à l'utilisateur si nécessaire
  }
}

/*
const closeOverlay = () => {
  if (showOverlay.value) showOverlay.value = false
}

const selectionChanged = (rows) => {
  allRows.value = rows
}

const onCellClick = (params) => {
  // Vérifiez si la colonne cliquée est la colonne "asset"
  if (params.column.field === 'asset') {
    // Affichez l'overlay
    showOverlay.value = true
    // Définissez la ligne sélectionnée
    selectedAsset.value = params.row
  }
}*/

const sortedBalances = computed(() => {
  if (balances.value && balances.value.length > 0) {
    return balances.value.slice().sort((a, b) => {
      const assetA = a.symbol.toUpperCase()
      const assetB = b.symbol.toUpperCase()
      return assetA.localeCompare(assetB)
    })
  } else {
    return []
  }
})

const items = computed(() => {
  if (strats.value && strats.value.length > 0) {
    return sortedBalances.value.map((item) => {
      return getAllCalculs(
        item,
        cmc.value,
        trades.value,
        strats.value,
        buyOrders.value,
        sellOrders.value
      )
    })
  } else {
    return []
  }
})

onMounted(async () => {
  //ProductService.getProducts().then((data) => (products.value = data))

  try {
    await getData()
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error)
    // Affichez un message d'erreur à l'utilisateur si nécessaire
  }
})

//const toast = useToast()
const addSellOrderDialog = ref(false)
const addSellOrdersDialog = ref(false)
const selectedAssets = ref()

const submitted = ref(false)
const statuses = ref([
  { label: 'INSTOCK', value: 'instock' },
  { label: 'LOWSTOCK', value: 'lowstock' },
  { label: 'OUTOFSTOCK', value: 'outofstock' }
])

const exportCSV = () => {
  dt.value.exportCSV()
}
const confirmDeleteSelected = () => {
  deleteProductsDialog.value = true
}

const confirmAddSellOrdersSelected = () => {
  addSellOrdersDialog.value = true
}

const getStatusSeverity = (data) => {
  if (data.nbOpenSellOrders == 0) {
    return 'danger'
  } else if (
    data.currentPrice > data.priceTp1 ||
    data.currentPrice > data.priceTp2 ||
    data.currentPrice > data.priceTp3 ||
    data.currentPrice > data.priceTp4 ||
    data.currentPrice > data.priceTp5
  ) {
    return 'info'
  } else {
    const nb5 = data.status.reduce((acc, val) => acc + val, 0)
    if (nb5 === 5) {
      return 'success'
    } else {
      if (data.exchangeId === BINANCE_EXCHANGE_ID) {
        // Calculer le prix actuel multiplié par 300% (ou 3 fois le prix initial)
        const priceThreshold = calculatePriceThreshold(data.currentPrice, BINANCE_THRESHOLD)

        // Vérifier si le prix actuel multiplié par 300% est inférieur au prix de chaque priceTp1 à priceTp5
        for (let i = 0; i < 5; i++) {
          // Vérifier si l'ordre correspondant n'a pas été placé (data.status[i] = 0)
          if (data.status[i] === 0) {
            // Vérifier si le prix actuel multiplié par 300% est inférieur au prix de priceTp[i]
            if (priceThreshold < data[`priceTp${i + 1}`]) {
              // Si c'est le cas, les ordres peuvent être placés avec succès
              return 'success'
            } else {
              // Sinon, l'ordre ne peut pas être placé car le prix actuel a augmenté de 300%
              return 'warning'
            }
          }
        }
      } else {
        // Vérifier combien de paires consécutives sont bonnes à partir de tp1 jusqu'à tp5 dans le bon ordre.
        const consecutivePairs = countConsecutivePairs(data.status)

        // En fonction du nombre de paires consécutives, renvoyer le niveau de sévérité approprié.
        switch (consecutivePairs) {
          case 0:
            return 'warning'
          case 1:
            return 'info'
          case 2:
          case 3:
          case 4:
            return 'success'
        }
      }
    }
  }
}

const getStatusLabel = (data) => {
  if (data.nbOpenSellOrders == 0) {
    return "Pas d'ordres ouverts"
  } else if (
    data.currentPrice > data.priceTp1 ||
    data.currentPrice > data.priceTp2 ||
    data.currentPrice > data.priceTp3 ||
    data.currentPrice > data.priceTp4 ||
    data.currentPrice > data.priceTp5
  ) {
    return 'Tu peux vendre depuis un moment'
  } else {
    console.log('data', data)
    const nb5 = data.status.reduce((acc, val) => acc + val, 0)
    if (nb5 === 5) {
      return '5 ordres placés'
    } else {
      if (data.exchangeId === BINANCE_EXCHANGE_ID) {
        const binanceThreshold = 3 //300%
        // Calculer le prix actuel multiplié par 300% (ou 3 fois le prix initial)
        const priceThreshold = data.currentPrice + data.currentPrice * binanceThreshold

        // Vérifier si le prix actuel multiplié par 300% est inférieur au prix de chaque priceTp1 à priceTp5
        for (let i = 0; i < 5; i++) {
          // Vérifier si l'ordre correspondant n'a pas été placé (data.status[i] = 0)
          if (data.status[i] === 0) {
            // Vérifier si le prix actuel multiplié par 300% est inférieur au prix de priceTp[i]
            if (priceThreshold < data[`priceTp${i + 1}`]) {
              // Si c'est le cas, les ordres peuvent être placés avec succès
              return 'Max ordres placés'
            } else {
              // Sinon, l'ordre ne peut pas être placé car le prix actuel a augmenté de 300%
              return 'Des ordres doivent être modifiés'
            }
          }
        }
      } else {
        // Vérifier combien de paires consécutives sont bonnes à partir de tp1 jusqu'à tp5 dans le bon ordre.
        const consecutivePairs = countConsecutivePairs(data.status)
        // En fonction du nombre de paires consécutives, renvoyer le niveau de sévérité approprié.
        const label = `${consecutivePairs} ${
          consecutivePairs > 1 ? 'correspondances' : 'correspondance'
        }`

        return label
      }
    }
  }
}

function calculatePriceThreshold(currentPrice, threshold) {
  return currentPrice + currentPrice * threshold
}

function countConsecutivePairs(status) {
  let consecutivePairs = 0
  for (let i = 0; i < status.length; i++) {
    if (status[i] === 1) {
      consecutivePairs++
    } else {
      break
    }
  }
  return consecutivePairs
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

/* Couleur verte */
.text-green-500 {
  color: #10b981;
  /* Vous pouvez ajuster cette couleur selon vos préférences */
}

/* Couleur rouge */
.text-red-500 {
  color: #ef4444;
  /* Vous pouvez ajuster cette couleur selon vos préférences */
}
</style>
