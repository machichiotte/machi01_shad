<!-- src/components/trades/Trades.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useCalculStore } from '../../store/calculStore'
import SearchBar from '../machi/SearchBar.vue'
import TradesTable from './TradesTable.vue'
import { Trade } from '../../types/responseData'

const filters = ref<{
  global: {
    value: string | null
    matchMode: (typeof FilterMatchMode)[keyof typeof FilterMatchMode]
  }
}>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const totalSell = ref(0)
const totalBuy = ref(0)
const amountBuy = ref(0)
const amountSell = ref(0)

const realBalance = ref<number | null>(null) // Balance réelle saisie par l'utilisateur
const averageBuyPrice = computed(() => {
  if (realBalance.value === null || realBalance.value === 0) return 0
  return (totalSell.value - totalBuy.value) / realBalance.value
})

const calculStore = useCalculStore()
const trades = computed<Trade[]>(() => calculStore.getTrade)

const filteredTrades = ref<Trade[]>([])

const getTradesData = async () => {
  try {
    await calculStore.loadTrade()
    console.info('Trade data retrieved:', trades.value.length)
  } catch (error) {
    console.error('An error occurred while retrieving data:', error)
  }
}

onMounted(async () => {
  await getTradesData()
})

// Mettre à jour filteredTrades en fonction des filtres et transformer les données
watchEffect(() => {
  console.log('Trades mis à jour:', {
    nombreTotal: trades.value.length,
    trades: trades.value.map(trade => ({
      pair: trade.pair,
      orderid: trade.orderid,
      side: trade.side,
      price: trade.price,
      amount: trade.amount,
      total: trade.total,
      platform: trade.platform,
      date: trade.dateUTC || new Date(trade.timestamp || 0).toISOString()
    }))
  })

  filteredTrades.value = trades.value
    .filter((item) => {
      const searchValue = (filters.value.global.value || '').toLowerCase()
      const matchesPair = item.pair.toLowerCase().startsWith(searchValue)
      const matchesBase = item.base.toLowerCase().startsWith(searchValue)
      const matchesQuote = item.quote.toLowerCase().startsWith(searchValue)
      const matchesPlatform = item.platform.toLowerCase().startsWith(searchValue)

      return matchesPair || matchesBase || matchesQuote || matchesPlatform
    })
    .map((item: Trade) => {
      let date: string

      if (item['timestamp']) {
        const timestamp =
          item['timestamp'].toString().length <= 10 ? item['timestamp'] * 1000 : item['timestamp']
        const formattedDate = new Date(timestamp)
        const year = formattedDate.getFullYear()
        const month = String(formattedDate.getMonth() + 1).padStart(2, '0')
        const day = String(formattedDate.getDate()).padStart(2, '0')
        const hours = String(formattedDate.getHours()).padStart(2, '0')
        const minutes = String(formattedDate.getMinutes()).padStart(2, '0')
        const seconds = String(formattedDate.getSeconds()).padStart(2, '0')

        date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } else if (typeof item['dateUTC'] === 'string') {
        date = item['dateUTC']
      } else {
        date = 'Invalid date'
      }

      const eqUsd = item['eqUSD'] !== null ? item['eqUSD'] : 0
      return {
        base: item['base'],
        quote: item['quote'],
        dateUTC: date,
        orderid: item['orderid'],
        pair: item['pair'],
        side: item['side'],
        price: item['price'],
        amount: item['amount'],
        total: item['total'],
        eqUSD: eqUsd,
        fee: item['fee'],
        feecoin: item['feecoin'],
        platform: item['platform']
      } as Trade
    })

  const safeSum = (acc: number, value: number) => Number(acc + (value || 0))

  const sellTrades = filteredTrades.value.filter((item) => item.side.toLowerCase() === 'sell')
  totalSell.value = sellTrades.reduce((acc, item) => safeSum(acc, item.eqUSD), 0)
  
  amountSell.value = sellTrades.reduce((acc, item) => acc + (item.amount || 0), 0)

  const buyTrades = filteredTrades.value.filter((item) => item.side.toLowerCase() === 'buy')
  totalBuy.value = buyTrades.reduce((acc, item) => safeSum(acc, item.eqUSD), 0)
  amountBuy.value = buyTrades.reduce((acc, item) => acc + (item.amount || 0), 0)
})
</script>

<template>
  <div class="page">
    <div class="header">
      <SearchBar :filters="filters" />
      <div class="trade-sums">
        <label>Supposed Balance: {{ amountBuy - amountSell }}</label>
        <label>Supposed Avg: {{ (totalSell - totalBuy) / (amountBuy - amountSell) }}</label>
        <label>Buy: -{{ totalBuy.toFixed(2) }} / Sell: +{{ totalSell.toFixed(2) }}</label>
        <label>Diff: {{ (totalSell - totalBuy).toFixed(2) }}</label>
        <div>
          <!-- Champ pour saisir la balance réelle -->
          <label>Real Balance:</label>
          <input type="number" v-model.number="realBalance" placeholder="Enter real balance" />
        </div>
        <div>
          <!-- Affichage de la moyenne d'achat -->
          <label>Average Buy Price: {{ averageBuyPrice }}</label>
        </div>
      </div>
    </div>

    <div class="card">
      <TradesTable :items="filteredTrades" />
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trade-sums {
  display: flex;
  flex-direction: column;
  margin-right: 1rem;
}
</style>
