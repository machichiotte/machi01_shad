<!-- src/components/order/Orders.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCalculStore } from '../../store/calculStore'
import { FilterMatchMode } from 'primevue/api'
import SearchBar from "../dashboard/SearchBar.vue"
import OrdersTable from "./OrdersTable.vue"
import { Order } from '../../types/responseData'
import { applyGlobalFilter } from '../../utils/filter'

// Récupération du store
const calculStore = useCalculStore()

// Configuration du nombre d'éléments par page et des filtres globaux
const itemsPerPage = ref(20)
const filters = ref({
  global: { value: '', matchMode: FilterMatchMode.CONTAINS }
})

// Récupération des orders depuis le store
const orders = computed(() => calculStore.getOrder)

// Transformation des orders (calcul du total, inversion du tableau, etc.)
const transformedOrders = computed(() => {
  return orders.value.map((item: Order) => {
    const total = (item.amount * item.price).toFixed(2)
    return {
      platform: item.platform,
      symbol: item.symbol,
      side: item.side,
      amount: item.amount,
      price: item.price,
      total,
      _id: item._id,
      oId: item.oId,
      cId: item.cId,
      type: item.type
    }
  }).reverse()
})

// Application du filtre global via l'utilitaire
const filteredOrders = computed(() => {
  const filterText = filters.value.global.value
  return filterText.trim() === ''
    ? transformedOrders.value
    : applyGlobalFilter(transformedOrders.value, filterText)
})

// Chargement des orders depuis le store
const getOrdersData = async (): Promise<void> => {
  try {
    await calculStore.loadOrder()
    console.info("Orders data retrieved:", orders.value.length)
  } catch (error) {
    console.error("An error occurred while fetching data:", error)
  }
}

onMounted(async () => {
  await getOrdersData()
})
</script>

<template>
  <div class="page">
    <div class="card">
      <SearchBar :filters="filters" />
      <OrdersTable :rows="filteredOrders" :itemsPerPage="itemsPerPage" />
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 1rem;
}
</style>
