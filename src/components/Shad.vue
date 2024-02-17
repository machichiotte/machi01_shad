<!-- src/components/Shad.vue -->

<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
          <Button
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            @click="confirmDeleteSelected"
            :disabled="!selectedProducts || !selectedProducts.length"
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
        ref="dt"
        :value="rows"
        v-model:selection="selectedProducts"
        dataKey="id"
        :paginator="true"
        scrollable
        :rows="itemsPerPage"
        :filters="filters"
        columnResizeMode="fit"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 class="m-0">Manage Products</h4>
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
            <Column
              selectionMode="multiple"
              style="width: 3rem"
              :exportable="false"
              :rowspan="2"
            ></Column>

            <Column header="Icon" :rowspan="2" />
            <Column header="Asset" :rowspan="2" sortable />
            <Column header="Exchange" :rowspan="2" sortable style="min-width: 12rem" />
            <Column header="Ratio" :rowspan="2" sortable />
            <Column header="Total Shad" :rowspan="2" sortable />
            <Column header="Rank" :rowspan="2" sortable />
            <Column header="Average Entry Price" :rowspan="2" sortable />
            <Column header="Total Buy" :rowspan="2" sortable />
            <Column header="Max wanted" :rowspan="2" sortable />
            <Column header="Percentage Difference" :rowspan="2" sortable />
            <Column header="Current Price" :rowspan="2" sortable />
            <Column header="Wallet" :rowspan="2" sortable />
            <Column header="Profit" :rowspan="2" sortable />
            <Column header="Total Sell" :rowspan="2" sortable />
            <Column header="Recup Shad" :rowspan="2" sortable />

            <Column header="Open Orders" :colspan="2" />

            <Column header="Quantite total achetee" :rowspan="2" sortable />
            <Column header="Balance" :rowspan="2" sortable />

            <Column header="Take Profit" :colspan="2" />

            <Column header="TP1" :colspan="2" />
            <Column header="TP2" :colspan="2" />
            <Column header="TP3" :colspan="2" />
            <Column header="TP4" :colspan="2" />
            <Column header="TP5" :colspan="2" />
            <Column header="Performance" :colspan="5" />
          </Row>
          <Row>
            <Column header="Buy" sortable />
            <Column header="Sell" sortable />

            <Column header="tp1" sortable />
            <Column header="tpX" sortable />
            <Column header="amount" sortable />
            <Column header="price" sortable />
            <Column header="amount" sortable />
            <Column header="price" sortable />
            <Column header="amount" sortable />
            <Column header="price" sortable />
            <Column header="amount" sortable />
            <Column header="price" sortable />
            <Column header="amount" sortable />
            <Column header="price" sortable />

            <Column header="24h" sortable />
            <Column header="7d" sortable />
            <Column header="30d" sortable />
            <Column header="60d" sortable />
            <Column header="90d" sortable />
          </Row>
        </ColumnGroup>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="iconUrl">
          <template #body="slotProps">
            <img
              :src="slotProps.data.iconUrl"
              :alt="slotProps.data.iconUrl"
              class="border-round icon-32"
            />
          </template>
        </Column>
        <Column field="asset"></Column>

        <Column field="exchangeId" style="min-width: 12rem"></Column>
        <Column field="ratioShad" :type="'number'"></Column>
        <Column field="totalShad"></Column>
        <Column field="rank"></Column>
        <Column field="averageEntryPrice"></Column>
        <Column field="totalBuy"></Column>
        <Column field="maxExposition"></Column>
        <Column field="percentageDifference"></Column>
        <Column field="currentPrice"></Column>
        <Column field="currentPossession"></Column>
        <Column field="profit"></Column>
        <Column field="totalSell"></Column>
        <Column field="recupShad"></Column>
        <Column field="openBuyOrders"></Column>
        <Column field="openSellOrders"></Column>
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
        <Column
          field="cryptoPercentChange24h"
          header="24h Percent Change"
          sortable
          :type="'percentage'"
        ></Column>
        <Column
          field="cryptoPercentChange7d"
          header="7d Percent Change"
          sortable
          :type="'percentage'"
        ></Column>
        <Column
          field="cryptoPercentChange30d"
          header="30d Percent Change"
          sortable
          :type="'percentage'"
        ></Column>
        <Column
          field="cryptoPercentChange60d"
          header="60d Percent Change"
          sortable
          :type="'percentage'"
        ></Column>
        <Column
          field="cryptoPercentChange90d"
          header="90d Percent Change"
          sortable
          :type="'percentage'"
        ></Column>
        <!--
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="code" header="Code" sortable style="min-width: 12rem"></Column>
        <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
        <Column header="Image">
          <template #body="slotProps">
            <img
              :src="`https://primefaces.org/cdn/primevue/images/product/${slotProps.data.image}`"
              :alt="slotProps.data.image"
              class="border-round"
              style="width: 64px"
            />
          </template>
        </Column>
        <Column field="price" header="Price" sortable style="min-width: 8rem">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.price) }}
          </template>
        </Column>
        <Column field="category" header="Category" sortable style="min-width: 10rem"></Column>
        <Column field="rating" header="Reviews" sortable style="min-width: 12rem">
          <template #body="slotProps">
            <Rating :modelValue="slotProps.data.rating" :readonly="true" :cancel="false" />
          </template>
        </Column>
      -->
        <Column field="inventoryStatus" header="Status" sortable style="min-width: 12rem">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.inventoryStatus"
              :severity="getStatusLabel(slotProps.data.inventoryStatus)"
            />
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
        <label for="inventoryStatus" class="mb-3">Inventory Status</label>
        <Dropdown
          id="inventoryStatus"
          v-model="product.inventoryStatus"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import { ProductService } from '@/service/ProductService'

import { getCmc, getBalances, getTrades, getOrders, getStrategy } from '../js/getter.js'
import { getAllCalculs } from '../js/calcul.js'
import { shadColumns } from '../js/columns.js'
//import MySellButtonVue from './MySellButton.vue';
import Overlay from './ShadOverlay.vue'

const balances = ref([])
const trades = ref([])
const strats = ref([])
const orders = ref([])
const cmc = ref([])
const buyOrders = ref([])
const sellOrders = ref([])
const itemsPerPage = ref(4)
const currentPage = ref(1)
const showOverlay = ref(false)
const selectedAsset = ref({})
const allRows = ref([])

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
}

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

const rows = computed(() => {
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
    this.applyRowClasses()
  } catch (error) {
    console.error("Une erreur s'est produite lors de la récupération des données :", error)
    // Affichez un message d'erreur à l'utilisateur si nécessaire
  }
})

const toast = useToast()
const dt = ref()
const products = ref()
const productDialog = ref(false)
const deleteProductDialog = ref(false)
const deleteProductsDialog = ref(false)
const product = ref({})
const selectedProducts = ref()
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const submitted = ref(false)
const statuses = ref([
  { label: 'INSTOCK', value: 'instock' },
  { label: 'LOWSTOCK', value: 'lowstock' },
  { label: 'OUTOFSTOCK', value: 'outofstock' }
])

const formatCurrency = (value) => {
  if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  return
}
const openNew = () => {
  product.value = {}
  submitted.value = false
  productDialog.value = true
}
const hideDialog = () => {
  productDialog.value = false
  submitted.value = false
}
const saveProduct = () => {
  submitted.value = true

  if (product.value.name.trim()) {
    if (product.value.id) {
      product.value.inventoryStatus = product.value.inventoryStatus.value
        ? product.value.inventoryStatus.value
        : product.value.inventoryStatus
      products.value[findIndexById(product.value.id)] = product.value
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Product Updated',
        life: 3000
      })
    } else {
      product.value.id = createId()
      product.value.code = createId()
      product.value.image = 'product-placeholder.svg'
      product.value.inventoryStatus = product.value.inventoryStatus
        ? product.value.inventoryStatus.value
        : 'INSTOCK'
      products.value.push(product.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Product Created',
        life: 3000
      })
    }

    productDialog.value = false
    product.value = {}
  }
}
const editProduct = (prod) => {
  product.value = { ...prod }
  productDialog.value = true
}
const confirmDeleteProduct = (prod) => {
  product.value = prod
  deleteProductDialog.value = true
}
const deleteProduct = () => {
  products.value = products.value.filter((val) => val.id !== product.value.id)
  deleteProductDialog.value = false
  product.value = {}
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 })
}
const findIndexById = (id) => {
  let index = -1
  for (let i = 0; i < products.value.length; i++) {
    if (products.value[i].id === id) {
      index = i
      break
    }
  }

  return index
}
const createId = () => {
  let id = ''
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}
const exportCSV = () => {
  dt.value.exportCSV()
}
const confirmDeleteSelected = () => {
  deleteProductsDialog.value = true
}
const deleteSelectedProducts = () => {
  products.value = products.value.filter((val) => !selectedProducts.value.includes(val))
  deleteProductsDialog.value = false
  selectedProducts.value = null
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 })
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'INSTOCK':
      return 'success'

    case 'LOWSTOCK':
      return 'warning'

    case 'OUTOFSTOCK':
      return 'danger'

    default:
      return null
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
</style>