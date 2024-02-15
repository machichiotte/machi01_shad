// router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import Home from '@comp/Home.vue'
import AddTrades from '@comp/AddTrades.vue'
import Shad from '@comp/Shad.vue'
import Orders from '@comp/Orders.vue'
import Cmc from '@comp/Cmc.vue'
import Update from '@comp/Update.vue'
import Strategy from '@comp/Strategy.vue'
import Trades from '@comp/Trades.vue'
import Converter from '@comp/Converter.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/addtrades', name: 'addtrades', component: AddTrades },
  { path: '/update', name: 'update', component: Update },
  { path: '/orders', name: 'orders', component: Orders },
  { path: '/cmc', name: 'cmc', component: Cmc },
  { path: '/shad', name: 'shad', component: Shad },
  { path: '/strategy', name: 'strategy', component: Strategy },
  { path: '/trades', name: 'trades', component: Trades },
  { path: '/converter', name: 'converter', component: Converter }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
